---
name: build
description: Ship a feature end to end, from an issue, spec, project or a plain description to reviewed draft PRs. Read when the user wants it planned with them, built slice by slice by workers, and reviewed stack by stack on GitHub. Produces stacked, verified draft PRs, a plan true to what was built, and a retro.
disable-model-invocation: true
metadata:
  inspired-by: "Dex Horthy and HumanLayer, https://github.com/humanlayer/advanced-context-engineering-for-coding-agents/blob/main/wsff.md"
---

Plan the work with the user, have workers build it slice by slice into draft PRs, and pause after each stack for the user's review on GitHub.

This session holds the run, not the diffs. It never builds, reviews or fixes code, not even a one-line fix; every change goes through a worker.

**Consumes** what to build, from the conversation: an issue, spec or project, or the user describing it in their own words; nothing yet → ask, never derive it from the branch. **Produces** a draft PR per slice in the plan's stacks, the plan kept true to what was built, and a retro.

## 1. Plan

`meduza:plan` on the target, here, with the user. Nothing is built before they approve it.

File the slices per the workspace's documented process: one task per slice, its blockers as tracker relations. A single slice → the issue itself is the task. No tracker in play (a description alone) → the plan is the record; skip filing.

## 2. Build

Per slice, one fresh worker running `meduza:implement`, briefed the way the user would brief it with no plan at hand: the slice's full text (what it delivers, its shape, `Seams`, `Cases`, `Not tested`, `Flows`), the decisions and facts it rests on, the repo, the base (the default branch at the bottom of a stack, the slice below otherwise), and the PR of each dependency in another repo. Add links to the plan and the task as references, never as a substitute for the content.

Within a stack, a slice starts when the one below it is built. Across stacks, it starts only once everything it depends on has passed the user's review. Independent stacks run in parallel.

## 3. Review

When a stack's workers have all reported, post one line per PR, its link and status (Done, Unproved, Blocked), then each Blocked question with its options. Nothing else: risks, decisions beyond the plan and evidence are in the PR bodies, where the user reviews.

```
S1 https://github.com/acme/app/pull/12 Done
S2 https://github.com/acme/app/pull/13 Blocked
S2: retry in the client or in the queue? (a) client, per D3 (b) queue, survives restarts
```

Then hand off `/autofix-pr`, a Claude Code command only the user can run: one PR at a time, bottom to top, enter that PR's worktree and ask the user to run it or say skip. Elsewhere, ask the user to say when their comments are in, then rework that PR, telling the new worker its comments are in.

The user replies in plain words:

- Approve or pass → the next stack. If any PR got pushes since the stack's report, a fresh subagent compares its shape with its slice; a changed shape, or a decision beyond the plan the user accepted → `meduza:plan` Revise before any slice that relies on it starts or continues.
- Rework on a PR, or an answer to a Blocked question → a new implement worker with the slice's full brief as in step 2, the feedback or answer verbatim, the branch and worktree, and the PR if one exists. When it reports, post that PR's line again.
- Rejecting a decision beyond the plan → rework on its PR to undo it.

Within a stack, work bottom to top: after any push to a lower PR, restack the PRs above it before a worker touches them, `gh stack rebase` then submit; without `gh stack`, rebase each branch onto the one below and force-push it. A conflict is rework for that PR's worker.

## 4. Retro

After the last stack passes, `meduza:retro` here, with the user, on this session, the PRs and the plan.

## Report

One table: slice, stack, repo, PR, status, review rounds. Then what is blocked and why, where the retro landed, and the next step: which stack to merge first.
