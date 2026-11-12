import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";

type State = "idle" | "working" | "done" | "blocked" | "clear";
type BlockedKind = "permission" | "question";

function isHerdrTui(ctx: ExtensionContext): boolean {
	return ctx.mode === "tui" && Boolean(process.env.HC_TERMINAL_ID);
}

function report(state: State, options: { kind?: BlockedKind; message?: string } = {}): void {
	const fields = [`state=${state}`, "app=pi"];
	if (options.kind) fields.push(`kind=${options.kind}`);
	if (options.message) fields.push(`msg=${Buffer.from(options.message, "utf8").toString("base64")}`);
	process.stdout.write(`\x1b]7501;${fields.join(":")}\x1b\\`);
}

export default function (pi: ExtensionAPI): void {
	let waitingForUi = false;

	pi.on("session_start", (_event, ctx) => {
		if (isHerdrTui(ctx)) report("idle");
	});

	pi.on("agent_start", (_event, ctx) => {
		if (!isHerdrTui(ctx)) return;
		waitingForUi = false;
		report("working");
	});

	pi.on("ui_prompt_start", (event, ctx) => {
		if (!isHerdrTui(ctx)) return;
		waitingForUi = true;
		report("blocked", {
			kind: event.kind === "confirm" ? "permission" : "question",
			message: event.title ?? "Pi needs your input",
		});
	});

	pi.on("ui_prompt_end", (_event, ctx) => {
		if (!isHerdrTui(ctx) || !waitingForUi) return;
		waitingForUi = false;
		report(ctx.isIdle() ? "idle" : "working");
	});

	pi.on("agent_settled", (_event, ctx) => {
		if (!isHerdrTui(ctx)) return;
		waitingForUi = false;
		report("done");
	});

	pi.on("session_shutdown", (_event, ctx) => {
		if (!isHerdrTui(ctx)) return;
		waitingForUi = false;
		report("clear");
	});
}
