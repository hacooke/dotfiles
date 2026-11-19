import { type ChildProcess } from "node:child_process";
import { EventEmitter } from "node:events";
import { Worker } from "node:worker_threads";
export declare class WorkflowScriptProcess extends EventEmitter {
    readonly child: ChildProcess;
    private exitCode;
    private stopping;
    private stderr;
    constructor(acornPath: string);
    postMessage(message: unknown): void;
    terminate(): Promise<number>;
}
export declare function createWorkflowScriptWorker(acornPath: string): Worker | WorkflowScriptProcess;
