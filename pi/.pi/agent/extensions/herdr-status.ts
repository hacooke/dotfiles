import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";

const HERDR_PERMISSION_PROMPT_EVENT = "herdr:permission-prompt";

type State = "idle" | "working" | "done" | "blocked" | "clear";
type BlockedKind = "permission" | "question";
type HerdrPermissionPromptEvent =
	| { action: "start"; message: string }
	| { action: "end"; state: "idle" | "working" };

function isHerdrTui(ctx: ExtensionContext): boolean {
	return ctx.mode === "tui" && Boolean(process.env.HC_TERMINAL_ID);
}

function report(state: State, options: { kind?: BlockedKind; message?: string } = {}): void {
	const fields = [`state=${state}`, "app=pi"];
	if (options.kind) fields.push(`kind=${options.kind}`);
	const message = options.message?.replace(/[\u0000-\u001f\u007f-\u009f]/g, " ").replace(/\s+/g, " ").trim();
	if (message) fields.push(`msg=${Buffer.from(message, "utf8").toString("base64")}`);
	process.stdout.write(`\x1b]7501;${fields.join(":")}\x1b\\`);
}

export default function (pi: ExtensionAPI): void {
	let waitingForUi = false;
	let permissionPromptActive = false;

	pi.on("session_start", (_event, ctx) => {
		if (isHerdrTui(ctx)) report("idle");
	});

	pi.on("agent_start", (_event, ctx) => {
		if (!isHerdrTui(ctx)) return;
		waitingForUi = false;
		permissionPromptActive = false;
		report("working");
	});

	function markWaitingForUi(kind: BlockedKind, message: string): void {
		if (waitingForUi) return;
		waitingForUi = true;
		report("blocked", { kind, message });
	}

	function clearWaitingForUi(state: "idle" | "working"): void {
		if (!waitingForUi) return;
		waitingForUi = false;
		report(state);
	}

	// Gate signals are synchronous and span both its confirmation and reason dialogs.
	pi.events.on(HERDR_PERMISSION_PROMPT_EVENT, (data) => {
		if (!process.env.HC_TERMINAL_ID) return;
		const event = data as HerdrPermissionPromptEvent;
		if (event.action === "start") {
			permissionPromptActive = true;
			markWaitingForUi("permission", event.message);
		} else {
			permissionPromptActive = false;
			clearWaitingForUi(event.state);
		}
	});

	pi.on("ui_prompt_start", (event, ctx) => {
		if (!isHerdrTui(ctx)) return;
		markWaitingForUi(
			event.kind === "confirm" ? "permission" : "question",
			event.title ?? "Pi needs your input",
		);
	});

	pi.on("ui_prompt_end", (_event, ctx) => {
		if (!isHerdrTui(ctx) || permissionPromptActive) return;
		clearWaitingForUi(ctx.isIdle() ? "idle" : "working");
	});

	pi.on("agent_settled", (_event, ctx) => {
		if (!isHerdrTui(ctx)) return;
		waitingForUi = false;
		permissionPromptActive = false;
		report("done");
	});

	pi.on("session_shutdown", (_event, ctx) => {
		if (!isHerdrTui(ctx)) return;
		waitingForUi = false;
		permissionPromptActive = false;
		report("clear");
	});
}
