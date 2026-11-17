---
description: Use for Herdr app/core customization — layouts, themes, keybindings, mods, spaces, terminals, and agent workflows.
---

# Herdr app and core

Before changing Herdr, read current installed docs; app/core APIs change by release:

- For app changes, read `~/.config/herdr-app/AGENTS.md` completely and run `herdr-app --skill`.
- For persistent terminals, commands, or agent orchestration, run `hc --skill`.
- For reusable Pi-agent launch workflows, load the `herdr-agent` skill; this wrapper should be preferred where appropriate.
- If `HERDR_APP_HOME` is set, use its `AGENTS.md` instead of `~/.config/herdr-app/AGENTS.md`.

This setup stores stowed Herdr config in `~/dotfiles/herdr/.config/`:

- App: `herdr-app/settings.json`, `keys.json`, `themes/`, `layouts/`, and `mods/`.
- Backend: `herdr-core/config.toml`.

The app-generated `AGENTS.md`, `.d.ts` files, and `frame/` are read-only; Herdr rewrites them. Customize source files in dotfiles, not generated files. Shipped layouts and mods are also replaced on start; clone them before editing.

Changes usually reload live. After an app change, run `herdr-app status` and check `errors`; use `herdr-app shot` to verify visual changes. Do not stop or restart the user's app or core; terminals may be running.
