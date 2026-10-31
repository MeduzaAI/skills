---
name: verify
description: Prove that a built change actually works and has no bugs, by using it on a running system and showing evidence a reviewer can watch or read. Read before calling a branch or PR done, whether the user asks or `meduza:implement` hands one over. Produces each flow proved, broken or not walkable, the bugs found with evidence, and the PR's Verification section.
---

Prove the change works and has no bugs by using the real running system the way a user or client would, and show the proof so nobody has to rerun it. Passing tests are not proof here: `meduza:implement` already ran them and wrote the flows' regression tests.

Write no code in the branch: no fixes, no tests. A local mock or stub you need to run the app stays outside it, uncommitted. Every broken flow and bug goes back in the report. Called by `meduza:implement` → it fixes them and runs verify again. Run by the user → report them and suggest running `meduza:implement` as rework with them.

**Inputs.** The slice's flows or the ticket, the PR and its worktree, from the caller or the conversation. Missing → ask; never guess from the branch name. No flows → a fresh subagent writes them from the spec without seeing the code, so they check what was asked rather than restate what was built.

**Asking.** User in the conversation → ask before any destructive step. Run as a worker → nobody to ask, so destructive steps are Not walkable.

## 1. Environment

Read how the repo runs the app and where its deployments live (`AGENTS.md`/`CLAUDE.md`, the workspace's documented process). Use the first that works:

1. A deployment of the PR (the docs, or the PR's checks and comments, name it), once it runs the PR's head commit. Evidence from a stale deploy proves nothing.
2. A local run the way the repo documents it, or the closest you can get from its docs. Mock what cannot run and label every piece of evidence that relied on it ("mocked payments"); the real integration with the mocked piece goes into the human QA plan.
3. Nothing can run → a static bug review of the diff: the harness's built-in correctness review when it has one, else read the diff hunting for bugs yourself. Report each finding as a suspect labelled "not run", never as a bug; the result is Unproved and every flow goes into the human QA plan.

## 2. Walk every flow

Set up the data, perform the steps, and check each step's expected result as you go, not only the end state. A flow's error cases are steps too. The repo or workspace ships its own demo-recording skill → record UI with it; it knows the app's auth, data and gated flows.

- **Proved**: walked end to end, every step matched, evidence linked.
- **Broken**: the change was reached and a step did not match; expected vs actual, with evidence.
- **Not walkable**: never got there (the app would not start, an auth wall, a destructive step nobody could approve); name the cause and whether a code change could clear it, and put the flow in the human QA plan as exact steps with expected results.

## 3. Hunt bugs

Read the diff for where it is likely wrong beyond the flows: edge inputs (empty, huge, boundary, unicode), error paths, state transitions, concurrency and double submits, auth and other users' data, data integrity and migrations. Try each suspect on the running app.

A bug counts only when you have shown it happening, with evidence. A suspect you could not trigger is dropped, never reported as a maybe.

Each bug: steps to reproduce, expected vs actual, evidence.

## Evidence

Something the reader can watch or read without rerunning anything:

- UI flow → one video per flow, named after it, console and network errors noted. No recording skill → browser automation with GIF capture.
- Static visual change → screenshots, before and after when a before exists.
- API → a table per endpoint: request (method, path, the input that matters) → status and body excerpt, expected vs actual, for the happy path, each error and auth.
- Job, script, or logic with no surface → the run's log or output showing the effect.

On a shared environment create only the data you need and mark it as test data; anything you did not create counts as destructive. No secrets, tokens or personal data in evidence. Never commit recordings.

Save evidence where the plan lives, as the caller or the PR's links name it: attachments on the issue via the workspace's tracker workflow. A repo-file spec → beside it, uncommitted, links marked "local to the author", with API tables kept inline so a reviewer still sees the proof. No plan anywhere → tables and logs inline in the Verification section.

## Report

Fill the PR's Verification section through `meduza:pr`. Then report:

- Status: Proved (every flow proved, no bugs) or Unproved.
- Flows by status, including any written for this run.
- Bugs, each with steps to reproduce, expected vs actual, and evidence.
- Human QA plan: every flow not proved, as exact steps with expected results.
- Where it ran and what was mocked, or "not run" with the static suspects.
- Where the evidence is saved.
