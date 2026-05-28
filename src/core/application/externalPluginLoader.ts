import { pathToFileURL } from "node:url";
import { isAbsolute, resolve } from "node:path";
import { Generator } from "../domain/generator.js";
import { GeneratedFile } from "../domain/generatedFile.js";
import { Plugin } from "../domain/plugin.js";
import {
  ARXGEN_PLUGIN_API_VERSION,
  ArxgenPlugin,
  PluginFactoryContext,
  PluginMetadata
} from "../domain/pluginSdk.js";
import { EntityConfig, ProjectConfig } from "../domain/projectConfig.js";

export async function loadExternalPlugins(specifiers: string[], cwd = process.cwd()): Promise<Plugin[]> {
  const plugins: Plugin[] = [];

  for (const specifier of specifiers) {
    try {
      const candidates = await loadPluginCandidates(specifier, cwd);
      plugins.push(...candidates.map((candidate) => adaptExternalPlugin(validateExternalPlugin(candidate, specifier), specifier)));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Plugin ${specifier} failed to load: ${message}`);
    }
  }

  return plugins;
}

export function validateExternalPlugin(value: unknown, source = "plugin"): ArxgenPlugin {
  if (!isRecord(value)) {
    throw new Error(`${source} must export a plugin object`);
  }

  const metadata = value.metadata;
  if (!isRecord(metadata)) {
    throw new Error(`${source} must expose metadata`);
  }

  const name = readNonEmptyString(metadata, "name", source);
  const version = readNonEmptyString(metadata, "version", source);
  const apiVersion = readNonEmptyString(metadata, "apiVersion", source);
  validateApiVersion(apiVersion, source);

  if (metadata.language !== undefined && typeof metadata.language !== "string") {
    throw new Error(`${source} metadata.language must be a string`);
  }
  if (metadata.framework !== undefined && typeof metadata.framework !== "string") {
    throw new Error(`${source} metadata.framework must be a string`);
  }

  if (typeof value.generateProject !== "function") {
    throw new Error(`${source} must implement generateProject(context)`);
  }

  if (value.supports !== undefined && typeof value.supports !== "function") {
    throw new Error(`${source} supports must be a function`);
  }

  if (!value.supports && (!metadata.language || !metadata.framework)) {
    throw new Error(`${source} must provide supports(config) or metadata language/framework`);
  }

  for (const hook of ["generateEntity", "generateCrud", "generateAuth", "generateOrm"]) {
    if (value[hook] !== undefined && typeof value[hook] !== "function") {
      throw new Error(`${source} ${hook} must be a function`);
    }
  }

  return {
    metadata: {
      ...metadata,
      name,
      version,
      apiVersion
    } as PluginMetadata,
    capabilities: isRecord(value.capabilities) ? value.capabilities : undefined,
    supports: value.supports as ArxgenPlugin["supports"],
    generateProject: value.generateProject as ArxgenPlugin["generateProject"],
    generateEntity: value.generateEntity as ArxgenPlugin["generateEntity"],
    generateCrud: value.generateCrud as ArxgenPlugin["generateCrud"],
    generateAuth: value.generateAuth as ArxgenPlugin["generateAuth"],
    generateOrm: value.generateOrm as ArxgenPlugin["generateOrm"]
  };
}

function adaptExternalPlugin(plugin: ArxgenPlugin, source: string): Plugin {
  const language = plugin.metadata.language ?? "external";
  const framework = plugin.metadata.framework ?? "external";

  return {
    metadata: plugin.metadata,
    name: plugin.metadata.name,
    language,
    framework,
    capabilities: plugin.capabilities,
    supports(config: ProjectConfig): boolean {
      if (plugin.supports) {
        try {
          const supported = plugin.supports(config);
          if (typeof supported !== "boolean") {
            throw new Error("supports(config) must return a boolean");
          }
          return supported;
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          throw new Error(`Plugin ${plugin.metadata.name} from ${source} failed during supports: ${message}`);
        }
      }

      return (
        config.language.toLowerCase() === language.toLowerCase() &&
        config.framework.toLowerCase() === framework.toLowerCase()
      );
    },
    getGenerators(): Generator[] {
      return [new ExternalPluginGenerator(plugin, source)];
    }
  };
}

class ExternalPluginGenerator implements Generator {
  constructor(private readonly plugin: ArxgenPlugin, private readonly source: string) {}

  async generate(config: ProjectConfig): Promise<GeneratedFile[]> {
    const root = toProjectRoot(config.projectName);
    const files: GeneratedFile[] = [];

    files.push(...(await this.runHook("generateProject", () => this.plugin.generateProject({
      config,
      root,
      plugin: this.plugin.metadata
    }))));

    for (const entity of config.entities ?? []) {
      files.push(...(await this.runEntityHook("generateEntity", config, root, entity)));
      files.push(...(await this.runEntityHook("generateCrud", config, root, entity)));
    }

    if (config.auth && this.plugin.generateAuth) {
      files.push(...(await this.runHook("generateAuth", () => this.plugin.generateAuth!({
        config,
        root,
        plugin: this.plugin.metadata,
        auth: config.auth!
      }))));
    }

    if (config.orm && this.plugin.generateOrm) {
      files.push(...(await this.runHook("generateOrm", () => this.plugin.generateOrm!({
        config,
        root,
        plugin: this.plugin.metadata,
        orm: config.orm!
      }))));
    }

    return files;
  }

  private async runEntityHook(
    hook: "generateEntity" | "generateCrud",
    config: ProjectConfig,
    root: string,
    entity: EntityConfig
  ): Promise<GeneratedFile[]> {
    const generator = this.plugin[hook];
    if (!generator) {
      return [];
    }

    return this.runHook(hook, () => generator({
      config,
      root,
      plugin: this.plugin.metadata,
      entity
    }), entity);
  }

  private async runHook(
    hook: string,
    callback: () => Promise<GeneratedFile[]> | GeneratedFile[],
    entity?: EntityConfig
  ): Promise<GeneratedFile[]> {
    try {
      const files = await callback();
      return validateGeneratedFiles(files, `${this.plugin.metadata.name}.${hook}${entity ? `(${entity.name})` : ""}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Plugin ${this.plugin.metadata.name} from ${this.source} failed during ${hook}: ${message}`);
    }
  }
}

async function loadPluginCandidates(specifier: string, cwd: string): Promise<unknown[]> {
  const imported = await import(resolveImportSpecifier(specifier, cwd));
  const exported = imported.default ?? imported.plugin ?? imported.arxgenPlugin ?? imported.plugins;
  const value = typeof exported === "function"
    ? await exported({ apiVersion: ARXGEN_PLUGIN_API_VERSION } satisfies PluginFactoryContext)
    : exported;

  return Array.isArray(value) ? value : [value];
}

function resolveImportSpecifier(specifier: string, cwd: string): string {
  if (isLocalSpecifier(specifier)) {
    const absolute = isAbsolute(specifier) ? specifier : resolve(cwd, specifier);
    return pathToFileURL(absolute).href;
  }

  return specifier;
}

function validateApiVersion(apiVersion: string, source: string): void {
  const major = apiVersion.match(/^(\d+)(?:\.|$)/)?.[1];
  if (major !== "2") {
    throw new Error(`${source} uses plugin API ${apiVersion}; arxgen supports ${ARXGEN_PLUGIN_API_VERSION}`);
  }
}

function validateGeneratedFiles(files: unknown, source: string): GeneratedFile[] {
  if (!Array.isArray(files)) {
    throw new Error(`${source} must return an array of generated files`);
  }

  return files.map((file, index) => {
    if (!isRecord(file) || typeof file.path !== "string" || typeof file.content !== "string") {
      throw new Error(`${source} returned invalid generated file at index ${index}`);
    }
    return { path: file.path, content: file.content };
  });
}

function readNonEmptyString(metadata: Record<string, unknown>, key: string, source: string): string {
  const value = metadata[key];
  if (typeof value !== "string" || !value) {
    throw new Error(`${source} metadata.${key} must be a non-empty string`);
  }

  return value;
}

function isLocalSpecifier(value: string): boolean {
  return value.startsWith(".") || value.startsWith("/") || value.startsWith("\\") || /^[a-zA-Z]:[\\/]/.test(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toProjectRoot(projectName: string): string {
  return projectName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "app";
}
