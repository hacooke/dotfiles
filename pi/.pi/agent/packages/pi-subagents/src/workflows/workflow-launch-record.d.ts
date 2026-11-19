import { type ResolvedSubagentCapabilityCeiling } from "../runs/shared/capability-ceiling.ts";
/**
 * The public launch of an async top-level workflow, saved so the run can be relaunched later. A
 * named resource is saved by name (its `runs.host` permit cannot be saved); structured tasks/chain
 * launches and internal ones (schedule ticks, prompt-template delegation) save no params, so they
 * cannot be relaunched from this record; their record still gives a child revive its ceiling.
 * The record is the only source of a relaunch's owner and capability ceiling. It lives outside the
 * run directory because a run behind a runner launcher can write its own directory.
 */
export type WorkflowLaunch = {
    source: "script" | "resource";
    params: Record<string, unknown>;
} | {
    source: "structured";
} | {
    source: "internal";
};
export type WorkflowLaunchRecord = WorkflowLaunch & {
    version: 2;
    scriptDigest: string;
    /** The session that launched the run; only it, or a session that replaced it, may relaunch it. */
    sessionId: string;
    admissionCapabilityCeiling?: ResolvedSubagentCapabilityCeiling;
};
type WorkflowLaunchRecordRead = {
    ok: true;
    record: WorkflowLaunchRecord;
} | {
    ok: false;
    missing: boolean;
    error: string;
};
/** Throws on a write failure; the launch must fail rather than start a run it cannot relaunch. */
export declare function writeWorkflowLaunchRecord(asyncDirRoot: string, runId: string, record: WorkflowLaunchRecord): void;
export declare function readWorkflowLaunchRecord(asyncDirRoot: string, runId: string): WorkflowLaunchRecordRead;
export {};
