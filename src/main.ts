import { createCli } from "./cli/createCli.js";
import { loadExternalPlugins } from "./core/application/externalPluginLoader.js";
import { GeneratorEngine } from "./core/application/generatorEngine.js";
import { ProjectExtender } from "./core/application/projectExtender.js";
import { SafeFileWriter } from "./core/infrastructure/safeFileWriter.js";
import { FileSystemTemplateRenderer } from "./core/infrastructure/fileSystemTemplateRenderer.js";
import { popularStarterPlugins } from "./plugins/popular-starters/index.js";
import { consoleLogger } from "./shared/logger.js";

export async function main(argv: string[]): Promise<void> {
  const { cliArgs, pluginSpecifiers } = extractPluginSpecifiers(argv.slice(2));
  const templateRenderer = new FileSystemTemplateRenderer();
  const fileWriter = new SafeFileWriter();
  const plugins = [
    ...popularStarterPlugins(templateRenderer),
    ...(await loadExternalPlugins(pluginSpecifiers))
  ];
  const engine = new GeneratorEngine(plugins, fileWriter);
  const extender = new ProjectExtender(fileWriter);
  const cli = createCli(engine, extender, plugins, consoleLogger);

  await cli.run(cliArgs);
}

function extractPluginSpecifiers(args: string[]): { cliArgs: string[]; pluginSpecifiers: string[] } {
  const cliArgs: string[] = [];
  const pluginSpecifiers = splitPluginList(process.env.ARXGEN_PLUGINS);

  for (let index = 0; index < args.length; index += 1) {
    const token = args[index];
    if (token !== "--plugin" && token !== "--plugins") {
      cliArgs.push(token);
      continue;
    }

    const value = args[index + 1];
    if (!value || value.startsWith("--")) {
      throw new Error(`Missing value for option ${token}`);
    }

    pluginSpecifiers.push(...splitPluginList(value));
    index += 1;
  }

  return { cliArgs, pluginSpecifiers };
}

function splitPluginList(value: string | undefined): string[] {
  return value?.split(",").map((entry) => entry.trim()).filter(Boolean) ?? [];
}
