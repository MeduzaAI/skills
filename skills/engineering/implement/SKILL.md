---
name: implement
description: Build one slice of an approved plan, or a ticket small enough to need no plan, into a pull request. Read before writing the code, whether the user asks directly or `meduza:build` hands over a slice. Produces a reviewed, verified draft PR and a report.
metadata:
  inspired-by: "Matt Pocock, https://github.com/mattpocock/skills"
---

Take one planned slice, or one ticket, to a draft PR that is built test-first, reviewed and shown working. Do all of it in this session; it runs the same whether the user started it or `meduza:build` handed it to a fresh worker.

**Inputs.** A plan and the slice to build, or a ticket. From the caller when given: the base branch (for a stack), the worktree, the existing PR, and rework feedback, verbatim or as "the PR's comments are in" (fetch them). Not given → the repo's default branch, in the current working copy.

**Rework** → in the existing worktree, change exactly what the feedback asks, test-first where behaviour changes, then run steps 3 to 6 against the existing PR. Step 2's limits apply to rework too.

## 1. Read

The slice and the plan's decisions, or the ticket (fetch it and state its title). The repo's `AGENTS.md`/`CLAUDE.md`, the path rules matching the files you will touch, and the files the slice names; a ticket names none → a targeted search for the code it changes. No codebase survey, no re-research: the plan's facts were verified.

Create the branch from the base, per the repo's naming convention, before the first edit.

## 2. Build

`meduza:tdd` through the slice's `Seams` and `Cases`, and the `Flows` as e2e or API regression tests, red first, in the layers the repo has. A ticket brings none → tdd picks them.

A small deviation (a wrong path, a missed import) gets the smallest fix and one line under Deviations.

Changing the slice's shape or a signature a later slice uses, contradicting a decision, or choosing between options the plan or ticket left open is the user's call. User present → ask with a question tool, 2 to 3 options, and continue with the answer. Running as a worker → leave the work on disk and return Blocked.

## 3. Check

Run the lint, typecheck and test commands the repo documents; never guess one. Fix until green, and never delete, skip or weaken a test to get there. Whatever the environment cannot run is reported by name, never called green.

## 4. Review

`meduza:code-review` on the branch against its base, in a fresh subagent. Fix the findings yourself, test-first when one changes behaviour, using your judgement on which to act on; each declined finding gets a one-line reason for the PR body. Re-run the checks and review again, as many rounds as it takes, until a round raises nothing you would act on.

## 5. PR

Commit per the repo's conventions, push, and open a draft PR (`gh stack` when installed), body by `meduza:pr`. Rework → push to the existing PR and update its body. The PR stays a draft; the user marks it ready.

## 6. Verify

`meduza:verify` in a fresh subagent with the slice's flows or the ticket, the PR and the worktree. It reports bugs and writes no code: fix each one test-first, run the checks, review the fix as in step 4, push, and run verify again. Stop when it proves every flow, or when another round would not change the outcome → Unproved.

## Report

- Status: Done; Unproved (PR open, verify could not prove it or bugs remain); or Blocked (the question, 2 to 3 options, the step it stopped in, and the rest of this list as far as it got).
- PR, branch, worktree.
- Built shape: the file-tree and call-tree diffs from `meduza:show-me`, for the caller to set beside the plan's.
- Decided beyond the plan: Deviations and declined findings, "None" when none.
- Per case: the test name and its red failure line.
- Verify: flows proved, broken, not walkable, and bugs remaining.
