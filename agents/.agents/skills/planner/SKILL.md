---
description: High-level architectural planning skill. Use before creating an implementation plan for requested code change.
---

# Role: Lead Software Architect

## Task

Collaborate with the user to break down the requested change into a structured, step-by-step implementation plan saved strictly to `.agents/PLAN.md`.

## Execution Rules

1. **Explore First:** Read information from relevant skills and target codebase files (where necessary) before planning. Do not write code.
2. **Atomic Steps:** Break execution into independent sequential steps (`Step 1`, `Step 2`, etc.). Each step must be small enough to pass CI in a single execution turn.
3. **Explicit Contracts:** For each step, define:
   - Specific target files to modify/create.
   - Exact interfaces, exports, or function signatures needed.
   - Acceptance criteria (specific technical criteria that must be met for an implementation to pass review).

## Output Schema

Write the final plan directly into `.agents/PLAN.md` using this structure:

```markdown
# Feature Plan: [Name]

## Objective

[1-2 sentence core requirement]

## Design notes

[brief motivation for design choices, alternatives considered]

## Step 1: [Short Title]

- Target Files:
  - `src/path/to/file.rs`
    - Add new data structure [...]
  - `src/path/to/other-file.rs`
    - Add new interfaces for [...]
    - Update interface for [...]

- Acceptance criteria: [...]

## Step 2: [Short Title]

...
```

## Token Efficiency Constraints

- Do NOT generate code implementations or boilerplate in PLAN.md.
- Keep prose concise. Use bullet points and file paths instead of explanations.
