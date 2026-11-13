---
name: agent-extern
description: Run an external interactive command as a top-level Herdr agent and collect its output. Use when asked to launch a CLI or TUI through agent-extern.
---

# agent-extern

Use `agent-extern` from a Herdr-managed terminal to run an external CLI or TUI as a root agent in the same Herdr space and tab. When the source tab is active, it zooms and focuses the temporary pane; otherwise it leaves current focus alone. It returns command output on stdout and command exit code.

## Usage

```sh
agent-extern [--name NAME] [--status STATUS] [--kind KIND] -- command [arguments...]
```

Options must come before `--`; command and arguments after `--` pass through unchanged.

```sh
agent-extern --name tuicr-review -- tuicr tui --stdout
agent-extern --name external-check --status blocked --kind question -- my-tool --interactive
```

Defaults: generated `agent-extern-<pid>` name, `blocked` status, and `question` kind. Status accepts `working`, `blocked`, `idle`, or `done`. Kind accepts `question`, `permission`, `auth`, or `none`; kind only applies to `blocked`.

Pane names must be 1–32 lowercase letters, digits, dots, underscores, or hyphens, and cannot look like terminal IDs (for example, `t7`).

Requires `hc`, `herdr-app`, `jq`, and `base64`. The wrapper reports the exact incomplete-history warning on stderr; command output stays on stdout.
