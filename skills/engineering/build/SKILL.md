---
name: build
description: Read before shipping an issue or a project end to end. Use when the user hands over existing work and wants it planned together, then built slice by slice into draft PRs with checkpoints to steer. Produces stacked draft PRs, reviewed and verified, and a plan true to what was built.
disable-model-invocation: true
metadata:
  inspired-by: "Dex Horthy and HumanLayer, https://github.com/humanlayer/advanced-context-engineering-for-coding-agents/blob/main/wsff.md"
---

# Build

Plan the work with the user, then build it slice by slice, stopping at
checkpoints where the user checks the PRs against the plan and steers what
comes next. This session plans and orchestrates; each slice is built in a
fresh worker, so this context holds the run, not the diffs.

## Inputs

- **Consumes**: an existing issue, or a spec or project, named in the
  conversation. Missing → ask; never derive it from the branch.
- **Produces**: a draft PR per slice in the plan's stacks, and the plan
  kept true to what was built.

## 1. Plan

Run `meduza:plan` on the target, here, with the user. Nothing is built
before they approve it.

Then file the slices **following the workspace's documented process**: one
task per slice, with its blockers as tracker relations. A single slice → the
issue itself is the task.

## 2. Run the slices

Per slice, one fresh worker running `meduza:build-slice`, given pointers
only: the plan, the slice, its task, the repo, its base (the default branch
for the bottom of a stack, the slice below otherwise), and the PR of each
blocker in another repo.

A slice starts when:

- within its stack, the slice below it is built;
- across stacks, every slice it depends on has passed a checkpoint, so
  nothing is built on code the user has not seen.

Stacks with no dependency between them run in parallel.

## 3. Checkpoint

After each stack, and once after the first slice of the first stack, so
the tracer bullet is checked before anything is built on it. Show per PR:
its link and status, the planned shape beside the built shape from the
worker's report, what was decided beyond the plan, and its flows.

Then hand off `/autofix-pr` (a Claude Code command), one PR at a time,
bottom to top: the session enters the PR's worktree, the user runs it or
says skip. Only the user can invoke it; ask and wait. It picks up the
comments the user leaves on the PR and pushes the fixes. Elsewhere, when
the user says their comments are in, fetch them and treat them as rework.

The user checks the PRs, then:

- **Pass** → a fresh agent redraws the built shape of each PR that got
  pushes since its report, beside the plan's; a difference → Revise. Then
  the next stack.
- **Rework** → a new `build-slice` worker with their feedback verbatim (chat
  or PR comments) and the worktree. Back to the checkpoint.
- **A question** a worker returned → ask it; a new worker continues with
  the answer.

Code the user accepted differs from the plan → `meduza:plan` Revise before
the next dependent slice starts. A push to a lower PR once slices sit on it
(rework, `/autofix-pr`) → restack them: `gh stack rebase`, then submit;
without `gh stack`, rebase each branch onto the one below and force-push
it.

## 4. Retro

After the last checkpoint passes, run `meduza:retro` here, with the user,
on this session, the PRs and the plan.

## Report

One table: slice, stack, repo, PR, status, checkpoint rounds. Then what is
blocked and why, where the retro landed (its report and each applied
change), and the next step: which stack to merge first.

## Common mistakes

- Building, reviewing or fixing in this session → a `build-slice` worker.
- Pasting plan text into a worker → pointers.
- Starting a slice in another stack before what it depends on passed a
  checkpoint.
- Building on after accepting a deviation without Revise.
