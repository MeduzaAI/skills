---
name: build-slice
description: Read before building one slice of an approved plan into a pull request. Use when a planned slice, or a checkpoint's rework on one, needs to be built, reviewed and verified. Produces a reviewed, verified draft PR and a report ready for the user's checkpoint.
---

# Build Slice

Take one slice of a plan from `meduza:plan` to a draft PR the user can check
against the plan: built, reviewed, and shown working. Usually run by a
fresh worker that `meduza:build` dispatched. Each phase runs its own fresh
agents; this one sequences them and carries pointers.

Nobody is there to ask. A question the plan does not answer is returned,
never decided here.

## Inputs

- **Consumes**: the plan, the slice, its task, the repo and the base
  branch, and the PR of any blocker in another repo. For rework, also the
  user's checkpoint feedback and the slice's worktree.
- **Produces**: a draft PR, and the report below.

## 1. Implement

`meduza:implement` with the plan, the slice, the base and a worktree, told
it runs as a worker.

Rework instead → one fresh fixer with the worktree and the feedback
verbatim: change exactly that, run the repo's checks, one commit.

## 2. Review

`meduza:code-review` on the branch, scoped to this slice, plus a
correctness review for bugs (the built-in `code-review` skill in Claude
Code; elsewhere a fresh subagent told to find bugs in the diff). Blocking
findings → one fresh fixer with them verbatim, then review again. At most
three rounds; still not clean → stop, no PR, return the findings.

## 3. Draft PR

Push, and open a draft PR on the base (`gh stack` when installed), per the
repo's conventions and template. On rework, push and update the existing PR
body. The body says what changes and why with a link to the slice's plan,
**what was decided beyond the plan** (implement's deviations, fixers'
choices; "None" when none), and the shape of the change from
`meduza:show-me`.

## 4. Verify

`meduza:verify` with the task, the slice's flows, the PR and the worktree,
told it runs as a worker: on the PR's deployment once it runs the head
commit, or locally when the repo has none. A blocker in another repo → walk
against its PR's deployment, or label that dependency as mocked. Still
broken after its rounds → the PR stays a draft with the failing flows at the
top.

## Report

- Status: Done, Unproved (PR open, flows broken), Failed (review never came
  clean) or Blocked (the question, its options, and the phase it stopped
  in).
- PR link, branch, worktree.
- **Built shape**: the file-tree and call-tree diffs from `show-me`, for the
  checkpoint to set beside the plan's.
- Decided beyond the plan.
- Flows: proved, broken, not walkable.

## Common mistakes

- Deciding what the plan left open → return Blocked with 2–3 options.
- Fixing in this context → a fresh fixer.
- Verifying before the rework is pushed → verify walks the old code.
- Marking the PR ready → it stays a draft; the user decides.
