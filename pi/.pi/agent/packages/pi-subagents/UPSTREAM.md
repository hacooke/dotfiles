# Upstream and local changes

- Upstream: `nicobailon/pi-subagents`
- Snapshot: `0.89.0`
- License: see `LICENSE`

Local changes:

- Widget animation interval reduced to 100 ms for smoother progress updates.
- `skills/pi-subagents/SKILL.md` encourages concurrent delegation across independent workstreams without a fixed agent count.
- `packages/pi/install.sh` installs local runtime dependencies with the checked-in lockfile; Pi does not install dependencies for local packages.

Keep upstream as the source for future updates; review its changes before merging them into this local package.
