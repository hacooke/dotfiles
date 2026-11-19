---
description: How to read and understand a codebase, and document learnings. Use before reading code.
---

# Context-First Reading Strategy

Minimize file reads and prevent file discovery spirals by checking active context and project instructions before reading codebase files.

## Execution Hierarchy (Follow in Order)

1. Consult Active Context
   - Read active `AGENTS.md` or skill rules already present in your system prompt
   - Do not re-read files if their relevant interfaces or types are already described in your current session or `PLAN.md` unless you suspect they have been updated

2. Delegate Cross-File Questions to Scout
   - For one codebase question that likely needs reading two or more code files, use the `scout` subagent before reading those files yourself
   - Give scout the precise question, repository cwd, and any known paths or symbols; ask for exact file paths, line ranges, and evidence
   - Use its findings as a map, then inspect the minimum relevant lines yourself to verify important claims
   - Read directly when answer is in one known file or active context; do not use scout for broad repo surveys or implementation work

3. Targeted Code Lookup
   - Use targeted line range reads or concise search commands to inspect only the specific lines needed for your active task

4. Update `LEARNINGS.md` Upon Discovery
   - If you uncover a non-obvious architecture pattern, hidden dependency, tricky type constraint, or similar while reading code; append a concise note to `.agents/LEARNINGS.md`
   - This note should have sufficient information such that the detail would have been trivial to understand

## Hard Constraints

- DO NOT list or read directories recursively
- DO NOT read files unrelated to your current task
