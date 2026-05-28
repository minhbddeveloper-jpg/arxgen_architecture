import { Generator } from "./generator.js";
import { PluginCapabilities, PluginMetadata } from "./pluginSdk.js";
import { ProjectConfig } from "./projectConfig.js";

export interface Plugin {
  metadata?: PluginMetadata;
  name: string;
  language: string;
  framework: string;
  capabilities?: PluginCapabilities;
  supports(config: ProjectConfig): boolean;
  getGenerators(): Generator[];
}
