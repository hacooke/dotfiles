---
name: github-prs
description: Review open pull requests, requested reviews, review feedback, Jira-key references, and stale activity across known GitHub repositories using the authenticated gh CLI.
---

# GitHub PR attention

Use this skill for GitHub PR reads and interpretation. Mike owns prioritization and any change proposal. Use existing `gh` authentication only; never request, inspect, print, extract, copy, or store a raw GitHub token. Use `gh pr` and `gh api`. Never run a GitHub write command here and never send Slack messages.

## Repository scope and auth

- Read canonical `github_repo` values from `/home/harry/dotfiles/agents/.agents/skills/known-repos/repos.json`; do not infer owner/repo from aliases or paths and do not modify shared catalog.
- Read CWD-local `.agents/knowledge.json` for Mike-specific excluded repositories. If absent, use every catalog repository. Exclusions apply only to Mike's attention checks, not as a global allowlist.
- At each requested GitHub check, run `gh auth status` and get current user with `gh api user --jq '{login: .login, id: .id}'`. Do not expose auth status details or token values in user-facing output.
- Confirm repository access with read-only `gh repo view <owner/repo>`. An inaccessible repository is uncertain/incomplete, never a clear result.
- All reads happen on prompt. No polling, scheduler, unattended loop, repository writes, or Slack send.

## Read-only queries

Use explicit canonical `<owner/repo>` and paginate every connection. `gh pr list` is a quick query capped at 100; use the following paginated `gh api` query for complete repository coverage:

```bash
gh pr list --repo <owner/repo> --state open --limit 100 \
  --json number,title,url,author,createdAt,updatedAt,reviewRequests,latestReviews,comments

gh api --paginate 'repos/<owner>/<repo>/pulls?state=open&per_page=100' \
  --jq '.[] | {number, title, html_url, state, created_at, updated_at, user: .user.login, requested_reviewers: [.requested_reviewers[].login]}'

gh api --paginate 'repos/<owner>/<repo>/pulls/<number>/reviews?per_page=100' \
  --jq '.[] | {id, user: .user.login, state, submitted_at, html_url}'

gh api --paginate 'repos/<owner>/<repo>/issues/<number>/comments?per_page=100' \
  --jq '.[] | {user: .user.login, created_at, updated_at, html_url}'

gh api --paginate 'repos/<owner>/<repo>/pulls/<number>/comments?per_page=100' \
  --jq '.[] | {id, in_reply_to_id, user: .user.login, created_at, updated_at, html_url}'
```

Use GraphQL read queries for review-thread resolution; use paginated REST timeline/comment/review endpoints for activity timestamps. Paginate each connection fully; do not assume one `--paginate` request can advance two independent cursors. For review threads, collect `isResolved` plus comment author and timestamps; mark uncertainty if nested comment pagination is incomplete. For timeline, include non-commit events (issue comments, submitted reviews, review comments, review-request events, close/reopen/ready-for-review state changes) and exclude commits. Example shape; use separate cursor variable/connection for each paginated query:

```graphql
query($owner: String!, $name: String!, $number: Int!, $endCursor: String) {
  repository(owner: $owner, name: $name) {
    pullRequest(number: $number) {
      reviewThreads(first: 100, after: $endCursor) {
        pageInfo { hasNextPage endCursor }
        nodes {
          isResolved
          comments(first: 100) {
            pageInfo { hasNextPage endCursor }
            nodes { author { login } createdAt updatedAt url }
          }
        }
      }
    }
  }
}
```

For activity timestamps, also read the paginated issue timeline and the paginated issue/review comment and review endpoints above. Timeline query:

```bash
gh api --paginate 'repos/<owner>/<repo>/issues/<number>/timeline?per_page=100' \
  --jq '.[] | select(.event != "committed" and .event != "head_ref_force_pushed") | {event, created_at, actor: .actor.login, requested_reviewer: .requested_reviewer.login}'
```

Combine timeline events with all issue comments, submitted reviews, and review comments; exclude commit and head-ref-force-push events regardless of endpoint. Use `gh api graphql --paginate` with a single paginated connection per query and its `pageInfo { hasNextPage endCursor }` cursor. If the CLI/API cannot retrieve a connection fully, report the affected PR/repo as uncertain. Keep outputs to evidence needed for classification; do not dump full API envelopes or comment text.

## Classification rules

- Match current user by `gh api user` login. Flag open PRs where current user is requested reviewer. Include request evidence and URL.
- For PRs authored by current user, flag unresolved review threads that contain feedback not yet answered by the PR author. Compare thread comment authors/times; unresolved threads with no author response are actionable. If author/thread identity or thread data is missing, mark uncertain rather than clear. Also show unresolved threads with an author response as still unresolved, but distinguish them from unanswered feedback.
- Parse Jira keys only from bracketed title groups matching `\[[A-Z][A-Z0-9]+-\d+(?:\s*,\s*[A-Z][A-Z0-9]+-\d+)*\]`. Each group contains one key or comma-separated keys; link every key in the group (for example, `[SOF-252]`, `[SOF-1, SOF-2]`, or `[SOF-1,SOF-2]`). Do not infer keys from branch name, PR body, or commit message. Flag open PRs with no bracketed keys as missing-key candidates; propose only, never modify title.
- Compute stale age from latest available non-commit PR activity: creation, issue comments, submitted reviews, review comments, review-request events, and relevant PR state/timeline events. Commit activity does not reset this clock. Do not use PR `updated_at` alone because commits update it.
- Mark stale once two local Monday–Friday working days have elapsed with no non-commit activity. Use local timezone. Do not invent holiday calendars. Incomplete timeline/history, inaccessible API data, missing timestamps, or pagination failure means uncertain—not fresh and not stale.
- A PR may belong to multiple categories. Keep evidence concise (repo, PR number/title, URL, event/identity, timestamp, age).

## User output

Report counts and evidence for: review requests to current user, current-user PRs needing feedback response, stale PRs, and missing Jira keys. Separate uncertain/incomplete results by repo/PR; never call unavailable data clear. Include repository coverage counts and excluded repos.

If user asks for Slack-ready output, draft messages grouped by intended action recipient. Each draft includes PR link, requested action, and age. Show drafts only; do not send or invoke Slack tools.

## Safety

This skill is read-only. Never call `gh pr edit`, `gh api` with a write method/body, mutating `gh repo` commands, issue/PR mutation commands, or Slack send. Read-only `gh repo view` is allowed. Any proposed GitHub write belongs in Mike's explicit complete-change-set approval flow. A failed or partial read is uncertainty, not evidence that no action is needed.
