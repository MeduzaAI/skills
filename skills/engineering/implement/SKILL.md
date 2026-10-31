---
name: implement
description: Build one piece of work, a slice of a plan, a ticket or a described change small enough to need no plan, into a pull request. Read before writing the code. Produces a reviewed, verified draft PR and a report.
metadata:
  inspired-by: "Matt Pocock, https://github.com/mattpocock/skills"
---

Take one piece of work to a draft PR that is built test-first, reviewed and shown working, all in this session.

**Inputs**, from the conversation: what to build (a slice with the decisions and facts it rests on, a ticket, or a description), and when given, the base branch, a worktree, an existing PR, a dependency's PR in another repo, and feedback to rework, verbatim or as "the PR's comments are in" (fetch them). No base or worktree → the repo's default branch, in the current working copy. Too little to build from → ask.

**Rework** → read as in step 1, check out the existing branch (in its worktree when given), change exactly what the feedback asks, test-first where behaviour changes, then run steps 3 to 6, pushing to the existing PR or opening one if there is none yet. Step 2's limits apply to rework too.

## 1. Read

What to build, with its decisions; a ticket → fetch it and state its title. The repo's `AGENTS.md`/`CLAUDE.md`, the path rules matching the files you will touch, and the files the work names; none named → a targeted search for the code it changes. No codebase survey, and no re-research of facts already given with a source.

Create the branch from the base, per the repo's naming convention, before the first edit.

## 2. Build

`meduza:tdd` through the given `Seams` and `Cases`, and the `Flows` as e2e or API regression tests, red first, in the layers the repo has. None given → tdd picks them.

A small deviation (a wrong path, a missed import) gets the smallest fix and one line under Deviations.

Changing the agreed shape or a signature other work relies on, contradicting a decision, or choosing between options the brief left open is the user's call. Ask with a question tool, 2 to 3 options, and continue with the answer. Nobody to answer (you run as a subagent) → leave the work on disk and return Blocked.

## 3. Check

Run the lint, typecheck and test commands the repo documents; never guess one. Fix until green, and never delete, skip or weaken a test to get there. Whatever the environment cannot run is reported by name, never called green.

## 4. Review

`meduza:code-review` in a fresh subagent, given the branch, its base, the worktree and what you built from (the slice with its cases and flows, the ticket, or the description). Fix the findings yourself, test-first when one changes behaviour, using your judgement on which to act on; each declined finding gets a one-line reason for the PR body. Re-run the checks and review again, as many rounds as it takes, until a round raises nothing you would act on.

## 5. PR

Commit per the repo's conventions, push, and open a draft PR (`gh stack` when installed), body by `meduza:pr`. Rework → push to the existing PR and update its body. The PR stays a draft; the user marks it ready.

## 6. Verify

`meduza:verify` in a fresh subagent with the flows, or the spec they come from (the slice, ticket or description), the PR, the worktree, and any dependency's PR. It reports bugs and writes no code: fix each one test-first, run the checks, review the fix as in step 4, push, and run verify again. Stop when it proves every flow, or when another round would not change the outcome → Unproved.

## Report

- Status: Done; Unproved (PR open, verify could not prove it or bugs remain); or Blocked (the question, 2 to 3 options, the step it stopped in, and the rest of this list as far as it got).
- PR, branch, worktree.
- Built shape: the file-tree and call-tree diffs from `meduza:show-me`.
- Deviations and declined findings, "None" when none.
- Per case: the test name and its red failure line.
- Verify: flows proved, broken, not walkable, and bugs remaining.
