---
name: herdr-agent
description: Launch interactive Pi agents in persistent Herdr terminals with safe initial-task delivery and optional space placement.
---

# Herdr agent launch

Use this skill when starting a standalone interactive Pi agent in an `hc` terminal. This skill owns launch mechanics only: it does not choose agent roles, workflow, task context, phases, gates, or trust decisions.

## Wrapper

Run `scripts/herdr-agent` from this skill directory, or use its absolute path. It passes the exact initial task as one Pi message argument and forwards all arguments after `--` unchanged as Pi options. Use repeated `--skill PATH` options there to load agent-specific skills; do not pass other positional prompts, since wrapper appends task as Pi's initial message.

```sh
herdr-agent \
  --name delta \
  --cwd /path/to/workspace \
  --space sp0123456789abcdef0123456789abcdef \
  --task "$initial_task" \
  -- --skill "$HOME/.agents/skills/agent-reporting/SKILL.md"
```

`--space` is optional; when supplied, the created terminal is bound to a space (this should be used by default). `--tab-name` selects visible tab name and defaults to `--name`.

Wrapper prints one compact JSON object on successful launch, with `terminal` address, `name`, `cwd`, `space`, `tab`, `tab_name`, `tab_renamed`, `tab_error`, `keep`, `initial_message`, and original `hc` JSON result. `initial_message.sent` confirms task string was passed as Pi's initial prompt argument and terminal launch succeeded; it does not claim model completed or responded to task. In dry-run output, `initial_message.sent` is false. Use returned terminal address for lifecycle and coordination. Launch errors remain on stderr and retain `hc` exit code.

## Safety and interface

- Pass task via quoted `--task "$message"`; wrapper keeps it one argument, including whitespace/newlines and leading dashes.
- Pass Pi flags after `--`; wrapper preserves each argument boundary. It inserts Pi's own `--` before task text.
- `--cwd` must already exist. `--name` and optional `--space` are validated before launch.
- `--dry-run` prints compact JSON with exact `hc` argv and planned explicit-ID rename shape, without invoking `hc` or `herdr-app` or creating a terminal. `--help` prints usage.
- Do not use wrapper dry-run as evidence of launch or task delivery; dry-run does not contact Herdr.
