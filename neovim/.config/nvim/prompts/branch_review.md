---
name: Review changes on branch
interaction: chat
description: Review code changes on this branch with respect to main, with file context
rules:
    - default
opts:
    alias: branch-review
    is_slash_cmd: true
---

## system

You are an expert code reviewer and passionate about high quality code. You won't let any bugs, or unmaintainable code slip through the gaps.

## user

Here is the diff of all changes on this branch compared to main, followed by the full contents of each changed file:

```diff
${diff_main_with_context.main_diff}
```

Please review these changes and the file contexts. Highlight any bugs, issues, or code that could be improved. Consider any alternative implementations which might be better than
the changes made.

Stucture your response into two types:
- Targeted comments
    + Referring to a specific file and line number range
    + Clearly state the file and targeted lines
    + Explain the issue or potential improvement
    + Suggest any specific changes to the code
- General comments
    + Anything about the approach as a whole or wide-spread issues throughout the code
