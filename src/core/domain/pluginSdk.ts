import { GeneratedFile } from "./generatedFile.js";
import { EntityConfig, ProjectConfig } from "./projectConfig.js";

export const ARXGEN_PLUGIN_API_VERSION = "2.0.0";

export interface PluginMetadata {
  name: string;
  version: string;
  apiVersion: string;
  language?: string;
  framework?: string;
  description?: string;
  homepage?: string;
}

export interface PluginCapabilities {
  entities?: boolean;
  crud?: boolean;
  dto?: boolean;
  validation?: string[] | boolean;
  pagination?: boolean;
  auth?: string[];
  orm?: string[];
  relations?: boolean;
  extendExistingProject?: boolean;
  schemaUpgrade?: boolean | "partial";
  productionReady?: boolean;
}

export interface PluginGenerationContext {
  config: ProjectConfig;
  root: string;
  plugin: PluginMetadata;
}

export interface EntityGenerationContext extends PluginGenerationContext {
  entity: EntityConfig;
}

export interface AuthGenerationContext extends PluginGenerationContext {
  auth: string;
}

export interface OrmGenerationContext extends PluginGenerationContext {
  orm: string;
}

export interface ArxgenPlugin {
  metadata: PluginMetadata;
  capabilities?: PluginCapabilities;
  supports?(config: ProjectConfig): boolean;
  generateProject(context: PluginGenerationContext): Promise<GeneratedFile[]> | GeneratedFile[];
  generateEntity?(context: EntityGenerationContext): Promise<GeneratedFile[]> | GeneratedFile[];
  generateCrud?(context: EntityGenerationContext): Promise<GeneratedFile[]> | GeneratedFile[];
  generateAuth?(context: AuthGenerationContext): Promise<GeneratedFile[]> | GeneratedFile[];
  generateOrm?(context: OrmGenerationContext): Promise<GeneratedFile[]> | GeneratedFile[];
}

export interface PluginFactoryContext {
  apiVersion: string;
}
