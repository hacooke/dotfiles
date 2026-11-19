export declare const DEFAULT_WAIT_TOOL_NAME = "bg_wait";
/**
 * The name pi-subagents registers its wait tool under (`config.waitTool.name`). One value per process: the parent
 * sets it from config, a child runtime from its launch config, and an async runner from its runner config, because
 * every runtime in a process descends from the same parent setting.
 */
export declare function waitToolName(): string;
export declare function setWaitToolName(name: string): void;
