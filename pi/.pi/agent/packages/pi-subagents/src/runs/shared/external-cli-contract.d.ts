import type { ExternalCliReceiptMetadata, ExternalCliCapabilityNarrowing, ExternalCliRunnerStatus, ExternalProcessStatus, HerdrMachineReference } from "../../shared/types.ts";
export declare const CODE_OWNED_EXTERNAL_CLI_ADAPTER_IDS: readonly ["codex-exec", "codex-exec-writer", "claude-code", "claude-code-writer", "cursor-agent", "cursor-agent-writer"];
export type CodeOwnedExternalCliAdapterId = typeof CODE_OWNED_EXTERNAL_CLI_ADAPTER_IDS[number];
export declare const CODE_OWNED_EXTERNAL_CLI_ADAPTER_LABEL: string;
export declare function isCodeOwnedExternalCliAdapterId(value: unknown): value is CodeOwnedExternalCliAdapterId;
export declare function validateCodeOwnedProfileRunner(agent: {
    name: string;
    localName?: string;
    aliases?: readonly string[];
    runner?: {
        type: string;
        adapter?: string;
    };
}): string | undefined;
export declare const EXTERNAL_CLI_ADAPTER_SAFETY: {
    readonly "codex-exec": {
        readonly sandbox: "read-only";
        readonly approvalPolicy: "never";
        readonly ephemeral: true;
    };
    readonly "codex-exec-writer": {
        readonly access: "workspace-write";
        readonly sandbox: "workspace-write";
        readonly approvalPolicy: "never";
        readonly ephemeral: true;
    };
    readonly "claude-code": {
        readonly access: "read-only";
        readonly authentication: "existing-cli-required";
        readonly permissionMode: "plan";
        readonly tools: "none";
        readonly mcp: "empty-strict";
        readonly settingSources: "user";
        readonly userSettingsTrust: "required";
        readonly sessionPersistence: false;
    };
    readonly "claude-code-writer": {
        readonly access: "workspace-write";
        readonly authentication: "existing-cli-required";
        readonly permissionMode: "acceptEdits";
        readonly tools: "Read,Write,Edit,Glob,Grep";
        readonly mcp: "empty-strict";
        readonly settingSources: "user";
        readonly userSettingsTrust: "required";
        readonly sessionPersistence: false;
    };
    readonly "cursor-agent": {
        readonly access: "read-only";
        readonly authentication: "cursor-api-key-or-existing-login";
        readonly mode: "ask";
        readonly sandbox: "enabled";
        readonly workspaceTrust: "existing-required";
        readonly sessionReuse: false;
    };
    readonly "cursor-agent-writer": {
        readonly access: "workspace-write";
        readonly authentication: "cursor-api-key-or-existing-login";
        readonly mode: "print";
        readonly sandbox: "enabled";
        readonly workspaceTrust: "existing-required";
        readonly sessionReuse: false;
    };
};
export declare function parseExternalCliCapabilityNarrowing(value: unknown, label: string): ExternalCliCapabilityNarrowing | undefined;
export declare function resolveExternalCliRunnerStatus(input: {
    adapter?: CodeOwnedExternalCliAdapterId;
    command: string;
    args?: string[];
    promptDelivery?: "stdin";
    capabilities?: ExternalCliCapabilityNarrowing;
    machine?: HerdrMachineReference;
}): ExternalCliRunnerStatus;
export declare function normalizeExternalCliRunnerStatus(value: unknown): ExternalCliRunnerStatus | undefined;
export declare function externalCliReceiptMetadata(input: {
    runner: ExternalCliRunnerStatus;
    externalProcess?: ExternalProcessStatus;
    outputReference?: string;
}): ExternalCliReceiptMetadata;
