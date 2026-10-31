---
name: code-review
description: Read before reviewing a branch, PR, or issue's changes against the repo's conventions and the spec they came from. Use when the user or a parent skill wants to know whether a change follows the standards, builds what was asked and tests it honestly. Produces Standards, Spec and repo-review findings, each hard or a judgement call, not a bug hunt.
metadata:
  inspired-by: "Matt Pocock, https://github.com/mattpocock/skills"
---

Review one repo's diff along three axes, each in its own parallel fresh subagent, and report them separately, never reranked across axes. A change can follow every standard and build the wrong thing, or build the right thing with tests that would stay green if it broke; one axis must not mask another.

Not a bug hunt: `meduza:verify` proves the feature works and finds bugs.

**Consumes** a target from the conversation or caller: a PR, an issue, or a branch with its worktree; none → the current branch, named in the report's first line. **Produces** the per-axis report in the conversation; posting it anywhere is the user's separate step.

Called by `meduza:implement` after building: the caller fixes findings with its own judgement, so every finding must be actionable on its own.

## 1. Resolve the diff

One repo per run: the PR's repo, else the one you are in. An issue resolves to the branch or open PR carrying it; several → ask. Base: the caller's, else the PR's, else the default branch.

Done when both refs resolve, you have the diff against the merge-base and the commit list, and the diff is non-empty. Fail here on a bad ref or an empty diff, before spawning anything.

## 2. Gather what the axes need

**Spec.** Use the task and plan the caller named. Otherwise find the issue from the PR or commit messages (a branch name alone → confirm with the user) and fetch it through the workspace's documented tracker workflow. When sources disagree: a spec document linked from the issue, then its plan (whose decisions are binding), then the issue and its comments, then the PR body, then spec or plan files they reference. Nothing found → ask; the user says there is none → skip Spec and report "no spec available".

Caller names one slice → review that slice only; other slices' requirements and cases are not missing from this diff.

**Standards.** The repo's `AGENTS.md`/`CLAUDE.md`, path rules whose paths match a file in the diff, review checklists kept as docs, the workspace's shared style guide for this stack, and cross-repo invariants in the workspace root `AGENTS.md`/`CLAUDE.md`. For test quality: `meduza:tdd` (its `SKILL.md`, `references/tests.md` and `references/mocking.md`, in the `tdd` folder beside this skill) and the repo's testing docs.

**Repo review.** The repo's own review skill, whatever it is called, among the skills it ships (`.agents/skills/` or `.claude/skills/`) and plugins the workspace documents for it. None → skip the axis and say so.

The caller may name which axes to run; run only those.

## 3. Spawn the axes in parallel

Every prompt gets the diff command, the commit list, and this output rule: "Each finding is one line: `hard` or `judgement`, `file:line`, what is wrong, and the rule or spec line it breaks, quoted. Under 400 words."

**Standards**: the standards files, [references/smells.md](references/smells.md) pasted in full, and the tdd paths (paste the files if the subagent cannot read skill files). Brief:

- Documented-standard breaches: cite file and rule; these can be hard. Skip what tooling enforces.
- Smells from the baseline: always judgement, and a documented standard overrides them.
- Test quality judged by `meduza:tdd`: for each bad test, quote the assertion and name the break it would miss.
- Hard: a deleted, skipped or weakened test not listed as a deviation with a reason; a new test asserting no value (only existence, a boolean, a mock call or a snapshot); a test for code the repo says not to test.
- Tests of trivial code, type-guaranteed behaviour or impossible cases: judgement, remove them.
- If the repo documents a mutation-testing command for changed files, run it and report surviving mutants as judgement.

**Spec**: the spec, the plan's decisions, and the slice's `Cases` and `Flows`. Brief:

- Requirements missing or partial; behaviour nobody asked for; requirements implemented wrongly; decisions contradicted. Quote the spec line.
- Every planned case and flow has a test that would fail if it broke; none → hard. How well a test is written belongs to Standards; here judge only whether the case is covered.
- A missing test the plan didn't list is judgement, and only when you name the concrete bug it would catch.

**Repo review**: the repo path and base. Brief: "Run the `<skill>` skill on this diff exactly as written, including the standards it collects. Return its findings with its own severity labels, marking what it says must be fixed before merge." That counts as hard.

## 4. Aggregate

Report under `## Standards`, `## Spec` and `## Repo review`, verbatim or lightly cleaned, hard findings first within each. End with one line per axis: hard and judgement counts and its worst finding. Then name sibling repos in the workspace carrying the same branch, so the user can review them too.
