---
name: implement
description: Read before building one slice of a plan written by meduza:plan. Use when the user or a parent skill hands over a planned slice and wants it built. Produces a verified commit per touched repo, without a PR.
metadata:
  inspired-by: "Matt Pocock, https://github.com/mattpocock/skills"
---

# Implement

Build one slice of a plan in a fresh agent and return a verified commit. This
session only dispatches and relays: the code is written well with a small
context or not at all, and this conversation is what the builder must not
carry.

## Inputs

- **Consumes**: a plan (a tracker document or a file) and the slice to
  build. A spec or an issue is not a plan; route it to `meduza:plan` first.
- **From the caller, when given**: the base branch to branch from (for a
  stack) and whether to build in a worktree. Not given → the repo's default
  branch, in the current working copy.
- **Produces**: one commit per touched repo on a new branch, not pushed, and
  a report.

## Dispatch

One fresh agent with the plan location, the slice, the base and the
worktree choice, then wait. Not a fork, nothing from this session in the
prompt. Write the prompt yourself; it must get across:

1. **The slice is the brief; the repo's standards are the rules.** Read the
   plan's decisions and facts and the slice, the repo's
   `AGENTS.md`/`CLAUDE.md`, and the path rules that match the files the
   slice touches. Read the files its shape names and the code they sit
   beside. No codebase surveys, no re-research: the plan's facts were
   verified.
2. **Small deviations go in a list; decisions do not.** A wrong path or a
   missed import gets the smallest fix and one line under Deviations. Anything
   that would change the slice's shape or a signature a later slice relies
   on, contradict a decision, or pick between options the plan did not
   settle → stop, leave
   the work on disk uncommitted, return Blocked with 2–3 options.
3. **Write the tests the slice needs**: unit tests for the logic it adds or
   changes, in the repo's test layout, where its standards say that kind of
   code is tested. Flows' regression tests are `meduza:verify`'s.
4. **Verify fully, per repo**: the lint, typecheck and test commands the repo
   documents. Never guess a command. Fix
   until green. If the environment cannot run the tests (missing service,
   database), report exactly what could not run; never mark it green.
5. **Commit once per repo** on a branch named per that repo's convention,
   created from the base. No push, no PR, no review.
6. **Report**: Status Done or Blocked; per repo the branch, worktree path,
   commit SHA, files, what verification ran; Deviations.

## When the builder returns

- **Done** → relay the report. The caller owns what comes next.
- **Blocked**, user in the conversation → ask with a question tool or plain text, the
  builder's options as written, then dispatch a **new** builder with the same
  prompt plus the decision and prior Deviations; it continues from the work
  on disk.
- **Blocked**, dispatched as a worker → return the Blocked report unchanged.

## Common mistakes

- Building here, or in a fork → a fresh agent, plan location only.
- Skipping tests because "CI will run them" → CI is a second check, not the
  first.
- Deciding a Blocked question yourself → it is the user's.
- Resuming the blocked agent → dispatch a new one.
