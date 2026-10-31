---
name: pr
description: Write or update a pull request's description so a reviewer can judge in a few minutes whether it is safe to merge. Read before opening a PR, or when a skill needs to fill in part of a PR body, such as its verification evidence.
metadata:
  inspired-by: "Matt Pocock, https://github.com/mattpocock/skills"
---

Write a PR body the reviewer skims in two minutes to judge merge risk. Review, tests and `meduza:verify` already cover style, standards and test quality; the body says what changed and where a wrong call would hurt.

**The repo's template wins.** Find it (`.github/pull_request_template.md`, `.github/PULL_REQUEST_TEMPLATE/`, or the PR conventions in `AGENTS.md`/`CLAUDE.md`). Put each piece of content below into the slot that matches it and add the rest after the template; each fact appears once. Tick a checklist item only when you know it is true, and leave the rest unticked with a few words why. No template → use the pieces below as the body.

**Contents**, each only when it applies:

- **What and why**: one or two sentences, linking the plan's slice or the ticket.
- **Shape**: `meduza:show-me` on the branch diff against its base; embed the single smallest view it returns.
- **Where to look**: one to three places where a wrong call would hurt (data and migrations, auth, money, public contracts, irreversible actions), each as `file:line` and the question the reviewer should ask. Then one line each for decisions made beyond the plan and review findings the author declined, "None" when none. Nothing risky → say so with the reason.
- **Tests**: each planned case → the test that covers it, one line each.
- **Verification**: owned by `meduza:verify`: one visible status line (where it ran, flows proved out of total, bugs found), and the flow table, evidence links and human QA steps collapsed. Before verify has run → "Pending verify".

**Small.** The visible body fits on one screen. Tests and verification detail go in `<details>` blocks, unless the template's slot rules them out.

**Updating.** Rewrite only the sections your change affects and keep everything else, including the user's edits. Called by `meduza:verify` → replace the Verification section only.

Example: a checklist-only template, filled.

````markdown
Retries failed webhook deliveries with backoff instead of dropping them. Slice 2 of [the plan](https://example.com/plan).

- [x] Tests added
- [ ] Docs updated: no user docs cover webhook delivery
- [x] No breaking changes

```diff
 deliverWebhook
   send
-  on failure: log and drop
+  on failure: schedule retry (1m, 5m, 30m)
+    third failure: mark endpoint failing
```

**Where to look**
- `src/webhooks/retry.ts:42`: can a retry fire after the customer deletes the endpoint?
- `migrations/0031_webhook_attempts.sql`: new table, no backfill; is rollback a plain drop?
- Beyond the plan: capped retries at 3 (the plan left it open). Declined findings: None.

<details><summary>Tests</summary>

- retries a 5xx → `retries a failed delivery with backoff`
- gives up after 3 → `marks the endpoint failing after the third failure`
</details>

**Verification**: 2/2 flows proved on the preview deploy, no bugs.
<details><summary>Flows and evidence</summary>

| Flow | Status | Evidence | Regression test |
|---|---|---|---|
| Endpoint returns 500, then 200 | Proved | [log](https://example.com/log1) | `retries until delivered` |
| Endpoint keeps failing | Proved | [log](https://example.com/log2) | `marks endpoint failing` |
</details>
````
