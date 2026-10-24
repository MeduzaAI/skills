---
name: build-project
description: Read before building a whole planned project unattended. Use when a project has an approved plan from meduza:plan-project with filed tasks, and the user wants every slice turned into PRs. Produces short draft PR stacks and a visual merge guide; one task is meduza:build.
disable-model-invocation: true
---

# Build Project

Turn a planned project into short, mergeable stacks of draft PRs, then tell
the user in one picture what to merge in which order. The plan already
decided everything and cut the stacks; this skill keeps the work moving and
never plans, builds, reviews or fixes in its own context. Its context is the
run's memory, and a single slice's diff would crowd it out.

Talk to workers through **pointers** (plan, task, repo, base), never pasted
content.

## Inputs

- **Consumes**: a project named in the conversation, with an approved plan
  from `meduza:plan-project` (Decisions, slices, stacks and merge waves)
  and a filed task per slice. No such plan → stop; `meduza:plan-project`
  writes it. Never pick "the current project" from the branch.
- **Produces**: a draft PR per slice, in the stacks the plan defined, and the
  merge guide.

## 1. Read the plan

Load the plan, each task's status and its stack and position. A slice whose
task is already Done, or has an open PR whose flows are proved, counts as
built. An open PR that opens with failing flows (Unproved) is not: nothing
stacks on it until the user fixes or closes it.

A fact or decision the plan left open is a planning gap, not research for
this run: stop and send the user back to `meduza:plan-project`.

## 2. Run the stacks

A **stack** is the unit of parallel work; slices inside a stack are built
in order, bottom to top. Up to three stacks at once.

A stack can start when every blocker outside it is satisfied:

| Blocker | Satisfied when |
|---|---|
| in another repo | its PR is open (the contract is readable from it) |
| another stack in the same repo | that stack is merged: it is a later wave; report it, do not build it on an unmerged branch |

For each slice, one fresh worker in the background, told
it is a worker: run `meduza:build` for this task on the base this skill
names (trunk for the bottom, the head branch of the slice below otherwise;
the named base wins over build's own lookup), and return the build report. Move the task per the workspace's process when it
starts and when its PR opens.

A worker returning Blocked, Failed or Unproved stops its stack at that slice; slices
above it and stacks that depend on it do not start. Everything else keeps
running: an unattended run has nobody to ask, so the question waits for the
report. Stop when nothing is runnable.

Parallel stacks can exceed a work-in-progress limit the workspace sets per
person; say so in the report rather than throttling.

## 3. Merge guide

The user's map for merging. Build it with `meduza:show-me`:

- A Mermaid graph: one subgraph per stack with its PRs bottom to top, edges
  for cross-stack and cross-repo blockers, each node labelled with the PR
  number and a short title and coloured by status (draft ready to skim,
  blocked, failed, not started).
- Under it, the waves as a list: wave, stack, repo, PRs in merge order with
  links, what it waits for.

Ask `show-me` for the HTML view as well. Save the markdown to the project,
next to the plan, replacing an earlier guide, and open the HTML for the
user.

## 4. Autofix tail

Attended, after the loop. Walk the opened stacks in wave order, each bottom
to top, one PR at a time. Done for a PR when the session itself is on its
branch (only entering the worktree moves the session), the user has the URL, and
they have run `/autofix-pr` or said skip. Only the user can invoke it; ask
and wait. When a fix lands on a lower PR, restack the PRs above it
(`gh stack rebase`, then submit) before handing off the next one.
A harness without `/autofix-pr` → skip the tail.

## Report

The merge guide, then one table: slice, stack/position, repo, PR URL, review
rounds, status, autofix launched or skipped. Then Blocked, Failed and Unproved slices
with their questions or findings verbatim, what never started because of
them, and the WIP note. Then the next step in plain words: which wave to
merge, and that this skill is re-run after it to build the next wave; once
the project is merged, `meduza:retro` on its PRs.

## Common mistakes

- Planning, building or fixing in this context → a fresh agent, every time.
- Pasting plan or task text into a worker → pointers only.
- Stacking a slice on a branch the plan did not put it on, or building a
  same-repo later wave on an unmerged stack → follow the stack map.
- Stopping the whole run on one Blocked worker → stop its stack only.
- Running `/autofix-pr` yourself → hand off and wait.
