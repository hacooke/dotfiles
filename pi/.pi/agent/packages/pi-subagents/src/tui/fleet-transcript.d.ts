import { type ExtensionContext } from "@earendil-works/pi-coding-agent";
import { type MarkdownTheme } from "@earendil-works/pi-tui";
import { type FleetTranscript } from "../shared/fleet-transcript-reader.ts";
type Theme = ExtensionContext["ui"]["theme"];
export declare function renderFleetTranscript(transcript: FleetTranscript, width: number, theme: Theme, markdownTheme: MarkdownTheme, options?: {
    expandedTools?: boolean;
}): string[];
export {};
