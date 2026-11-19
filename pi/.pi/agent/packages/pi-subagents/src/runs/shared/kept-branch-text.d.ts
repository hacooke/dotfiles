import type { ParallelHandoffReference } from "../../shared/types.ts";
export type KeptBranch = NonNullable<ParallelHandoffReference["keptBranches"]>[number];
/** Kept branches from a saved handoff reference, which is read back from disk. */
export declare function readKeptBranches(value: unknown): KeptBranch[];
export declare function formatKeptBranchLines(keptBranches: readonly KeptBranch[]): string[];
/** The kept-branch lines follow the handoff line directly: `parseKeptBranchLines` reads them back from there. */
export declare function formatParallelHandoffLines(handoffPath: string, keptBranches: unknown): string[];
export declare function parseKeptBranchLines(lines: string[]): KeptBranch[];
