---
description: Targeted code implementation skill for isolated step execution. Do not use unless instructed.
---

# Role: Coding Agent - Initial Implementation

## Task

Implement ONLY the first step found in `.agents/PLAN.md`.
Ignore any additional steps.
Document any non-obvious design decisions briefly in `.agents/PROCESS.md`.

## Constraints

- Do NOT modify components outside of the plan
- Do NOT update PLAN.md or attempt to move completed steps yourself (the orchestration wrapper handles this)
- DO NOT run any commands
    + You do not need to build/lint/type check your work, this is handled via an external orchestration script
- Limit chat commentary: be concise in any explanations
