import type { AgentConfig } from "./agents.ts";
export declare const KNOWN_FIELDS: Set<string>;
interface SerializeAgentOptions {
    preserveFrontmatterFields?: ReadonlySet<string>;
    /** The caller set inheritGlobalContext on create; write it even when false, because an absent field takes settings defaults. */
    explicitInheritGlobalContext?: boolean;
}
export declare function serializeAgent(config: AgentConfig, options?: SerializeAgentOptions): string;
export {};
