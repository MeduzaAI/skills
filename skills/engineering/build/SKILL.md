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
the tracer bullet is checked before anything is built on it. Copy
`assets/checkpoint.html` next to the user's work, fill its `DATA` block from
the workers' reports and nothing else, then open it. The comment above
`DATA` lists the fields: per slice its PR and status, the planned shape
beside the built one, what was decided beyond the plan, its flows, or the
question it returned. PRs that match the plan collapse into one item. In
chat, say only that the checkpoint is open and to paste the answer line
when done.

Then hand off `/autofix-pr` (a Claude Code command), one PR at a time,
bottom to top: the session enters the PR's worktree, the user runs it or
says skip. Only the user can invoke it; ask and wait. It picks up the
comments the user leaves on the PR and pushes the fixes. Elsewhere, when
the user says their comments are in, fetch them and treat them as rework.

The user checks the PRs, then pastes the answer line:

- **`pass n`** → a fresh agent redraws the built shape of each PR that got
  pushes since its report, beside the plan's; a difference → Revise. Then
  the next stack. A PR passes only once each decision beyond the plan on it
  is accepted; the document holds Pass back until then.
- **`rework n: "…"`** → a new `build-slice` worker with their feedback
  verbatim (the line, PR comments) and the worktree. Back to the checkpoint.
- **`q4b`, or `q4: "…"`** → the answer to slice 4's question: that option,
  or the user's text. A new worker continues with it.
- **`accept D1`** → the code stays as built: `meduza:plan` Revise before
  the next dependent slice starts. **`reject D1`** → rework of its PR to
  undo it. A `shapeN` item, a shape difference no decision explains, takes
  the same answers.

A push to a lower PR once slices sit on it
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
- The checkpoint written out in chat → `checkpoint.html`; chat says only
  that it is open.
