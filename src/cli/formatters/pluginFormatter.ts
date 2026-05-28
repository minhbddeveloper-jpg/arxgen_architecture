import { Plugin } from "../../core/domain/plugin.js";

export function formatPlugin(plugin: Plugin): string {
  const capabilities = plugin.capabilities;
  const version = plugin.metadata?.version ? `@${plugin.metadata.version}` : "";
  const apiVersion = plugin.metadata?.apiVersion ? ` API ${plugin.metadata.apiVersion}` : "";
  const header = `${plugin.name}${version} (${plugin.language}/${plugin.framework})${apiVersion}`;
  if (!capabilities) {
    return header;
  }

  return [
    header,
    `  CRUD: ${yesNo(capabilities.crud)}`,
    `  ORM: ${formatList(capabilities.orm)}`,
    `  Auth: ${formatList(capabilities.auth)}`,
    `  Validation: ${Array.isArray(capabilities.validation) ? capabilities.validation.join(", ") : yesNo(capabilities.validation)}`,
    `  Schema upgrade: ${capabilities.schemaUpgrade === "partial" ? "partial" : yesNo(capabilities.schemaUpgrade)}`,
    `  Production ready: ${yesNo(capabilities.productionReady)}`
  ].join("\n");
}

function formatList(value: string[] | undefined): string {
  return value?.length ? value.join(", ") : "none";
}

function yesNo(value: unknown): string {
  return value ? "yes" : "no";
}
