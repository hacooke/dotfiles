import { type ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { type HerdrStatusRun } from "../integrations/herdr-status.ts";
import { type SubagentState } from "../shared/types.ts";
export declare function projectActiveHerdrRuns(state: SubagentState): HerdrStatusRun[];
export default function registerSubagentExtension(pi: ExtensionAPI): void;
