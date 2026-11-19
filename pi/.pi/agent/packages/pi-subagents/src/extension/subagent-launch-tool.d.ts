import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { Type, type Static } from "typebox";
declare const parameters: Type.TObject<{
    workflowRunId: Type.TString;
    key: Type.TString;
    agent: Type.TOptional<Type.TString>;
    task: Type.TOptional<Type.TString>;
    cwd: Type.TOptional<Type.TString>;
    model: Type.TOptional<Type.TString>;
    async: Type.TOptional<Type.TBoolean>;
    worktree: Type.TOptional<Type.TBoolean>;
    resume: Type.TOptional<Type.TString>;
    commands: Type.TOptional<Type.TArray<Type.TObject<{
        command: Type.TString;
        cwd: Type.TOptional<Type.TString>;
        env: Type.TOptional<Type.TRecord<"^.*$", Type.TString>>;
    }>>>;
    output: Type.TOptional<Type.TString>;
}>;
export type SubagentLaunchArgs = Static<typeof parameters>;
/** Not declared to the model, so the system prompt and tool list stay unchanged. */
export declare function registerSubagentLaunchTool(pi: ExtensionAPI): void;
/** Offers a workflow child start to the session's `tool_call` handlers; returns the refusal, or the task the handlers left. */
export declare function approveWorkflowChildLaunch(ctx: ExtensionContext, describe: () => SubagentLaunchArgs, signal: AbortSignal): Promise<{
    refusal: string;
} | {
    task?: string;
}>;
export {};
