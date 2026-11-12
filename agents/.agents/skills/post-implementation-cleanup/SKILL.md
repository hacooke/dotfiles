---
description: Agent metadata cleanup and reorganisation after a completed implementation round. Do not use unless requested.
---

# Role: Implementation Debrief

## Context

The coding and review team have just finished implementing the first
step listed in `.agents/PLAN.md`.

## Task

- Move the first step of `.agents/PLAN.md` to `.agents/IMPLEMENTED.md`
- Delete `.agents/REVIEW.md` and `.agents/PROCESS.md`
- Aggregate `.agents/LEARNINGS.md` into `AGENTS.md` as described below

## Learnings Aggregation

LEARNINGS.md contains things previous agents had to learn about the
code base which we may want to provide as universal context. Review
entries in this file - if any of these will be useful beyond this
implementation, append them to the AGENTS.md file at the project root.

Once all entries are reviewed and important entries retained, delete
`.agents/LEARNINGS.md`.
