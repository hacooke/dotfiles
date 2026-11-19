/**
 * Fleet transcript reading: trusted-path validation, tail reads, and JSONL
 * parsing into display events. Pure data layer — no TUI imports — so both the
 * engine (run status) and the TUI (fleet view) can share one parser.
 */
export type FleetTranscriptEvent = {
    kind: "assistant";
    text: string;
    model?: string;
    timestamp?: number;
} | {
    kind: "user";
    text: string;
    timestamp?: number;
} | {
    kind: "tool";
    toolCallId?: string;
    name: string;
    args?: string;
    argsPayload?: string;
    output?: string;
    outputTruncated?: boolean;
    status: "running" | "complete" | "error";
    error?: string;
    startedAt?: number;
    endedAt?: number;
    timestamp?: number;
} | {
    kind: "notice";
    text: string;
    tone: "muted" | "warning" | "error";
    timestamp?: number;
};
export interface FleetTranscript {
    path: string;
    events: FleetTranscriptEvent[];
    truncated: boolean;
    warning?: string;
    /** The path was refused or the file could not be read, as opposed to a read that only skipped records. */
    readFailed?: true;
}
export interface FleetTranscriptReadOptions {
    trustedRoots: string[];
    trustedFiles?: string[];
    trustedFileRoot?: string;
    maxRecords?: number;
    maxBytes?: number;
}
export declare function objectValue(value: unknown): Record<string, unknown> | undefined;
export declare function safeTranscriptEvent(event: FleetTranscriptEvent): FleetTranscriptEvent;
export declare function readFleetTranscript(filePath: string, options: FleetTranscriptReadOptions): FleetTranscript;
