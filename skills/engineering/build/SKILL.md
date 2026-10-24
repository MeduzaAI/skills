---
name: build
description: Read before taking a tracked task from issue to pull request in one run. Use when the user hands over a task and wants it shipped, not one stage of it. Produces a reviewed draft PR per touched repo, placed in its stack, with its flows proved on a deployment and a skimmable description.
---

# Build

Walk one task through its phases and open its draft PR(s). Each phase owns
its rules; this skill sequences them, carries values between them, and
decides where the PR sits in its stack. The goal is a PR the user can skim:
decisions were locked before building, standards were checked before the PR
went up, the change was shown working on a deployment, and the description
shows what changed and anything the agent had to decide.

## Inputs

- **Consumes**: a task, named in the conversation (issue key or URL).
  Missing → ask; never derive it from the branch.
- **Produces**: a draft PR per touched repo and a one-table report.

| Condition | Behaviour |
|---|---|
| The user is in the conversation | Blocked questions are asked; ends with the `/autofix-pr` hand-off. |
| Dispatched as a worker (by `meduza:build-project`) | Nobody to ask: Blocked, Failed or Unproved is returned in the report; no hand-off. |

## 1. Task and base

Resolve the task via the workspace's documented tracker workflow, and its
project plan if it has one.

Find the base branch. The project plan's stack map is the source when it
exists:

- the base the caller gave, when it gave one, wins;
- bottom of its stack (a one-PR stack included) → the repo's default branch,
  new stack,
  but only once every blocker in the same repo is merged; a blocker sitting
  unmerged in another stack means the task is not ready;
- higher in its stack → the head branch of the slice directly below, whose
  PR must already be open; not open → the task is not ready, say so.

No stack map → a blocker in the same repo with an open PR that is the **top**
of its stack → stack on it. A blocker in the middle of a stack, or several
unchained blockers → never fork a stack: attended, ask; as a worker, return
Blocked. No such blocker → the default branch.

## 2. Plan and build

1. `meduza:plan-task` for the task: units and Flows. No saved plan → stop
   (or return the Blocked question it raised).
2. `meduza:implement` with the plan, the base, and a worktree per repo.
   Its full verification is the test run.

Keep `implement`'s Deviations: they go into the PR body.

## 3. Review until clean

Per repo, at most three rounds. Each round runs, telling each the branch,
worktree path, base, task and plan location so nothing is guessed:

- `meduza:code-review`: the spec and project Decisions, the repo's
  documented standards, the tests against the plan, and the repo's own
  review skill when it has one;
- the built-in correctness review (`code-review` skill) for bugs.

Clean = no Spec findings, no hard Tests findings, no documented-standard
violations, nothing the repo review says must be fixed, no correctness bug; judgement calls go into the PR body. Not
clean → one fresh fixer per repo with the repo path and
the blocking findings verbatim: fix exactly those, verify with the repo's
commands, one commit in its format, no push, and report any choice it made
beyond the finding. Review again.

Three rounds and still not clean → no PR. Attended, show the findings; as a
worker, return Failed with them.

## 4. Draft PR

Per repo, following its `AGENTS.md`/`CLAUDE.md` and PR template:

- **Always a draft.** The user moves it to ready after skimming it.
- **Stacks through GitHub native stacks** (`gh stack`) when installed: a new
  stack on the default branch, or added on top of the slice below. Submitting
  creates the PR as a draft. Without `gh stack`, a draft PR against the base.
  One branch, one PR, one parent: never two PRs based on the same branch.
- **Title** per the repo's convention.
- **Body**: the repo's PR template when it has one, filled slot by slot and
  nothing added outside it; otherwise these, in order. Either way the content
  is:
  1. What changes and why, two or three sentences, issue link, and the
     project Decisions it relies on (D2, D5, linked) so the reviewer does
     not reopen them.
  2. **Decided beyond the plan**: `implement`'s Deviations and every choice
     a fixer reported. "None" when none. This is what the user reads first.
  3. The shape of the change, from `meduza:show-me` with the branch diff
     against its base as the topic: the smallest visual that makes it clear.
  4. Tests: what `implement` ran; `verify` replaces it in step 5.
  5. Judgement calls from review, if any.

  No stack listing: `gh stack` shows it, and a list in the body goes stale as
  the stack grows.

## 5. Verify

Per PR, `meduza:verify` with the task, plan location, branch, worktree,
PR URL, and whether this run is a worker. It runs after the PR because the
PR is what deploys the change to somewhere it can be walked. It walks the
Flows, pushes their regression tests and any fixes, reviews what it pushed,
and rewrites the testing section.

Unproved → the PR stays a draft with the failing flows opening its body;
status Unproved, the flows quoted in the report.

## 6. Hand off `/autofix-pr` (attended)

One PR at a time. Done for a PR when the session itself is on its branch
(only entering the worktree moves the session; a `cd` does not), the user has the
PR URL, and they have run `/autofix-pr` or said skip. It is a command only
the user can invoke; ask and wait. A harness without `/autofix-pr` → skip
this step.

## Report

One table: repo, branch, base, stack position, PR URL, review rounds, flows
proved / broken / not walkable, status, autofix launched or skipped. Status
is Done, Blocked, Failed (review never came clean: no PR) or Unproved (draft
PR open, flows still broken). Then worktree paths left on disk, and for the
last three the question, findings or failing flows verbatim.

## Common mistakes

- Opening the PR as ready, or marking it ready → draft; the user decides.
- Basing on a branch that already has another PR on top → never fork a stack.
- Fixing findings in this session → a fresh fixer per round.
- Opening a PR after three unclean review rounds → no PR; report the findings.
- Closing the PR when verify fails → it stays a draft, Unproved, failure on top.
- Writing the testing section from test output → verify's flow table.
- Burying what the agent decided at the end of the body → second section.
- Running `/autofix-pr` yourself → hand off and wait.
