import type { HerdrLocalMachineReference, HerdrMachineReference, PlacementMachineReference } from "../../shared/types.ts";
import { type HerdrForwardedConnection, type HerdrRpcClient } from "./herdr-connection.ts";
import type { HerdrRunIdentity } from "./herdr-placed-run.ts";
import { PlacedRunOwner } from "./placed-run-owner.ts";
import { type PlacementAgentKind, type PlacementBridgeIdentity, type PlacementEvidenceProof, type PlacementOwnedPane, type PlacementPromptOptions, type PlacementReconnectCheck, type PlacementRunState, type PlacementStartOptions } from "./placement-host.ts";
type HerdrPlacementMachine = HerdrMachineReference | HerdrLocalMachineReference;
export interface HerdrPaneCandidate {
    endpoint: {
        session: string | null;
        protocol: number;
        version: string;
    };
    agents: Array<{
        terminal_id?: string;
        pane_id?: string;
        agent_status?: string;
    }>;
}
export interface HerdrReconnectCandidate extends HerdrPaneCandidate {
    bridge: PlacementBridgeIdentity;
}
export declare function herdrStatusSubscriptions(paneId: string): unknown[];
export declare function reconcileHerdrPlacedRun(identity: HerdrRunIdentity, candidate: HerdrPaneCandidate, proveEvidence: () => PlacementEvidenceProof): PlacementReconnectCheck;
export declare function parseHerdrCreated(value: unknown, type: "workspace_created" | "tab_created"): {
    workspaceId?: string;
    tabId: string;
    paneId: string;
};
export declare function parseHerdrAgent(value: unknown, type: "agent_started" | "agent_info" | "agent_prompted"): Record<string, unknown>;
export declare function parseHerdrSessionSnapshot(value: unknown): Record<string, unknown>;
export declare function ownsHerdrPane(agent: Record<string, unknown>, terminalId: string, paneId: string): boolean;
export declare const HERDR_MAX_OWNED_PANES = 20;
export declare function provisionHerdrPane(client: HerdrRpcClient, cwd: string, runId: string, runtimeDir: string, environment?: Record<string, string>, allocationKey?: string): Promise<{
    workspaceId: string;
    tabId: string;
    paneId: string;
}>;
declare function closeOwnedHerdrPane(connection: HerdrForwardedConnection, owned: PlacementOwnedPane, terminalId: string | undefined, agentName: string | undefined): Promise<void>;
/** Herdr pane host: Herdr RPC over the Herdr socket, SSH-forwarded for a saved machine and direct for `local`. Ownership is the Herdr terminal_id/pane_id pair; run state comes from agent_status. */
export declare const herdrPaneHost: {
    connect(machine: PlacementMachineReference): Promise<HerdrForwardedConnection>;
    sessionOf(connection: HerdrForwardedConnection): string | null;
    launch(connection: HerdrForwardedConnection, machine: PlacementMachineReference, runId: string, runtimeDir: string, request: import("./placement-host.ts").PlacementLaunchRequest, onPane: (owned: PlacementOwnedPane) => Promise<void>, options: PlacementStartOptions | undefined): Promise<{
        owned: PlacementOwnedPane;
        terminalId: string;
    }>;
    prompt(connection: HerdrForwardedConnection, identity: HerdrRunIdentity, text: string, options?: PlacementPromptOptions): Promise<void>;
    subscribe(connection: HerdrForwardedConnection, paneId: string, listener: (event: unknown) => void, onDisconnect: (error: Error) => void): Promise<() => void>;
    paneEvent(event: unknown, fallback: PlacementRunState): {
        terminalId: unknown;
        paneId: unknown;
        state: PlacementRunState;
    } | undefined;
    panes(connection: HerdrForwardedConnection): Promise<{
        endpoint: import("./herdr-connection.ts").HerdrEndpoint;
        agents: {
            terminal_id?: string;
            pane_id?: string;
            agent_status?: string;
        }[];
    }>;
    reconcile: typeof reconcileHerdrPlacedRun;
    closeOwnedPane: typeof closeOwnedHerdrPane;
};
/** The placed-run owner bound to Herdr and its machine access (SSH, or this machine for `local`), plus the separate provision and start steps the external CLI adapters use. */
export declare class HerdrPlacedRunOwner<M extends HerdrPlacementMachine = HerdrMachineReference> extends PlacedRunOwner<HerdrForwardedConnection, M> {
    private constructor();
    static create<M extends HerdrPlacementMachine>(machine: M, runId: string, beforePane?: (owner: HerdrPlacedRunOwner<M>) => void | Promise<void>): Promise<HerdrPlacedRunOwner<M>>;
    provision(environment?: Record<string, string>): Promise<PlacementOwnedPane>;
    start(kind: PlacementAgentKind, name: string, args: string[], options?: PlacementStartOptions): Promise<{
        terminalId: string;
        paneId: string;
        argv: string[];
    }>;
}
export {};
