/**
 * Permission Gate Extension
 *
 * Prompts for confirmation before running potentially dangerous bash commands.
 * Patterns checked: rm -rf, sudo, chmod/chown 777, git commands
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

const HERDR_PERMISSION_PROMPT_EVENT = "herdr:permission-prompt";

export default function (pi: ExtensionAPI) {
	// const dangerousPatterns = [/\brm\s+(-rf?|--recursive)/i, /\bsudo\b/i, /\b(chmod|chown)\b.*777/i, /\bgit\b/i];
	const dangerousPatterns = [/\brm\s+(-rf?|--recursive)/i, /\bsudo\b/i, /\b(chmod|chown)\b.*777/i];

	pi.on("tool_call", async (event, ctx) => {
		if (event.toolName !== "bash") return undefined;

		const command = event.input.command as string;
		const isDangerous = dangerousPatterns.some((p) => p.test(command));

		if (isDangerous) {
			if (!ctx.hasUI) {
				return { block: true, reason: "The user has blocked use of this command" };
			}

			const message = `⚠️ Dangerous command: ${command}`;
			const reportsHerdrStatus = ctx.mode === "tui" && Boolean(process.env.HC_TERMINAL_ID);
			if (reportsHerdrStatus) {
				pi.events.emit(HERDR_PERMISSION_PROMPT_EVENT, { action: "start", message });
			}

			try {
				const choice = await ctx.ui.select(`${message}\n\nAllow?`, ["Yes", "No"]);

				if (choice !== "Yes") {
					const note = await ctx.ui.input(
						"Block reason",
						"Why block this? Tell model what to change next.",
					);
					return {
						block: true,
						reason: note?.trim() ? note.trim() : "The user has blocked use of this command",
					};
				}
			} finally {
				if (reportsHerdrStatus) {
					pi.events.emit(HERDR_PERMISSION_PROMPT_EVENT, {
						action: "end",
						state: ctx.isIdle() ? "idle" : "working",
					});
				}
			}
		}

		return undefined;
	});
}
