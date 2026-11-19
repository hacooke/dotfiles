import type { McpToolPrefix } from "./mcp-direct-tool-grant.ts";
export interface McpServerDefinition {
    command?: string;
    args?: string[];
    socket?: string;
    env?: Record<string, string>;
    cwd?: string;
    url?: string;
    headers?: Record<string, string>;
    requestHeadersCommand?: {
        command: string;
        args?: string[];
        env?: Record<string, string>;
        timeoutMs?: number;
    };
    auth?: "oauth" | "bearer" | false;
    bearerToken?: string;
    bearerTokenEnv?: string;
    exposeResources?: boolean;
    includeTools?: string[];
    excludeTools?: string[];
    /** Per-server override of the global `settings.toolPrefix`, matching the adapter. */
    toolPrefix?: McpToolPrefix;
    protocolVersion?: string;
    /** Validated so adapter configs load; `mcp:` selectors do not read it. */
    directTools?: boolean | string[] | "search";
    httpTransport?: string;
    pluginDataDir?: string;
    literalEnv?: boolean;
    inheritEnv?: boolean;
    /** Only literal true disables a server, matching pi-mcp-adapter. */
    disabled?: boolean;
}
export declare function isMcpServerDefinition(value: unknown): value is McpServerDefinition;
export declare function loadPackageMcpServers(cwd: string): Record<string, McpServerDefinition>;
export declare function loadAgentPluginMcpServers(paths: unknown, cwd: string): Record<string, McpServerDefinition>;
