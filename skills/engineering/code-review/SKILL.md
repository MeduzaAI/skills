---
name: code-review
description: Read before reviewing a branch, PR, or issue's changes against the repo's conventions and the spec they came from. Use when the user wants to know whether a change follows the standards, builds what was asked and tests it honestly. Produces Standards, Spec, Tests and repo-review findings, not a bug hunt.
---

# Code Review

Review the diff between a target and a base branch along axes that never
mix:

- **Standards** — does the code conform to this repo's documented coding standards?
- **Spec** — does the code faithfully implement the originating issue / spec?
- **Tests** — do the tests prove the behaviour the plan asked for, in the
  shape the repo's testing standards require?
- **Repo review** — what the repo's own review skill says, when the repo
  ships one. The repo's maintainers encoded what they check in review; it
  runs as written, not paraphrased into the Standards axis.

Each axis runs as a **parallel sub-agent** so they don't pollute each other's
context, then this skill aggregates their findings.

Not for: correctness bug hunting (the built-in `code-review`) or reuse and
simplification passes (`simplify`).

## Inputs

- **Target**, from the conversation or the calling skill: a PR number, an
  issue key, or a branch with its worktree path. None → the current branch,
  stated in the first line of the report.
- **Spec and plan**: when the caller names the task and plan, use those.
- **Base**: the one the caller names, else the PR's base, else the repo's
  default branch.
- **Axes**: all four, unless the caller names which to run (`meduza:verify`
  asks for Tests only on the tests it generated).
- **Produces**: one report per axis in the conversation. Posting them anywhere is
  the user's separate step.

## 1. Resolve the target to a diff

One repo per run: the repo the PR belongs to, otherwise the repo you are in.
An issue ID resolves to the branch or open PR that carries it; several →
ask.

Done when you have a diff command against the merge-base and the commit
list, both refs resolve, and the diff is non-empty. Check this before step
4: a bad ref or empty diff should fail here, not inside parallel
sub-agents.

## 2. Infer the spec

Use the task and plan the caller named. Otherwise take the issue from the PR
or the commit messages; the branch name alone is not enough, so confirm it
with the user. Then gather everything linked to the change. Fetch issue-tracker material via the
workspace's documented issue-tracker workflow. Authority order when they
disagree:

1. A spec document attached to or linked from the issue.
2. A plan attached to or linked from the issue, and the project plan it
   belongs to, whose Decisions are binding.
3. The issue's description and comments.
4. The PR body.
5. Spec or plan files the issue or PR references in the repo.

Nothing found → ask the user where the spec is. If they say there isn't one,
the Spec sub-agent is skipped and the report says "no spec available"; the
Tests axis then judges against the diff's behaviour alone.

## 3. Collect the standards sources

For the repo under review:

- Its `AGENTS.md`/`CLAUDE.md`.
- Its path rules whose `paths` frontmatter matches a file in the diff
  (`.claude/rules/*.md`, or the harness's equivalent).
- Review checklists the repo keeps as docs (not a skill).
- The shared style-guide repo when the workspace has one for this stack.
- Any cross-repo invariants the workspace root `AGENTS.md`/`CLAUDE.md` documents. These
  are the rules a single-repo view breaks most easily.

Split off the **testing sources** for the Tests axis: the repo's testing
docs, the rules whose paths match test files, and the testing sections of
the files above. Test shape, what is and is not tested, and which helpers
and fixtures to use are judged there, once, not also under Standards.

On top of whatever the repo documents, the Standards axis always carries the
**smell baseline** below — a fixed set of Fowler code smells (_Refactoring_,
ch.3) that applies even when a repo documents nothing. Two rules bind it:

- **The repo overrides.** A documented repo standard always wins; where it
  endorses something the baseline would flag, suppress the smell.
- **Always a judgement call.** Each smell is a labelled heuristic ("possible
  Feature Envy"), never a hard violation — and, like any standard here, skip
  anything tooling already enforces.

Each smell reads *what it is* → *how to fix*; match it against the diff:

- **Mysterious Name** — a function, variable, or type whose name doesn't reveal what it does or holds. → rename it; if no honest name comes, the design's murky.
- **Duplicated Code** — the same logic shape appears in more than one hunk or file in the change. → extract the shared shape, call it from both.
- **Feature Envy** — a method that reaches into another object's data more than its own. → move the method onto the data it envies.
- **Data Clumps** — the same few fields or params keep travelling together (a type wanting to be born). → bundle them into one type, pass that.
- **Primitive Obsession** — a primitive or string standing in for a domain concept that deserves its own type. → give the concept its own small type.
- **Repeated Switches** — the same `switch`/`if`-cascade on the same type recurs across the change. → replace with polymorphism, or one map both sites share.
- **Shotgun Surgery** — one logical change forces scattered edits across many files in the diff. → gather what changes together into one module.
- **Divergent Change** — one file or module is edited for several unrelated reasons. → split so each module changes for one reason.
- **Speculative Generality** — abstraction, parameters, or hooks added for needs the spec doesn't have. → delete it; inline back until a real need shows.
- **Message Chains** — long `a.b().c().d()` navigation the caller shouldn't depend on. → hide the walk behind one method on the first object.
- **Middle Man** — a class or function that mostly just delegates onward. → cut it, call the real target direct.
- **Refused Bequest** — a subclass or implementer that ignores or overrides most of what it inherits. → drop the inheritance, use composition.

Then look for **the repo's own review skill**, whatever it is called: among
the skills the repo ships (its `.agents/skills/` or `.claude/skills/`) and the plugins the
workspace documents for this repo. Found → the Repo review axis runs. None →
the axis is skipped and the report says so.

## 4. Spawn the sub-agents in parallel

**Standards sub-agent prompt** — include:

- The full diff command and commit list.
- The list of standards-source files you found in step 3, minus the testing
  sources, **plus the smell baseline from step 3** pasted in full — the
  sub-agent has no other access to it.
- The brief: "Report — per file/hunk where relevant — (a) every place the
  diff violates a documented standard: cite the standard (file + the rule);
  and (b) any baseline smell you spot: name it and quote the hunk.
  Distinguish hard violations from judgement calls — documented-standard
  breaches can be hard, but baseline smells are always judgement calls, and a
  documented repo standard overrides the baseline. Skip anything tooling
  enforces. Leave test files' shape to the Tests review. Under 400 words."

**Spec sub-agent prompt** — include:

- The diff command and commit list.
- The path or fetched contents of the spec, and the project plan's
  Decisions when there is one.
- The brief: "Report: (a) requirements the spec asked for that are missing
  or partial; (b) behaviour in the diff that wasn't asked for (scope creep);
  (c) requirements that look implemented but where the implementation looks
  wrong; (d) anything that goes against a project Decision. Quote the spec
  line for each finding. Under 400 words."

**Tests sub-agent prompt** — include:

- The diff command and commit list.
- The plan's test cases when there is a plan, else the spec. The Flows
  only when the caller says their regression tests are in the diff
  (`meduza:verify` does); before verify runs they do not exist yet.
- The testing sources from step 3.
- The brief: "Report, per test or per planned case: (a) tautological tests:
  ones that assert what they set up, mock the unit under test, mirror the
  implementation's calls, or would still pass if the behaviour broke —
  quote the assertion and say what break it misses; (b) a planned test case
  (or a flow you were given) with no test that proves it; (c) behaviour the
  diff changes with no test that would catch it breaking; (d) violations of
  the testing standards, including tests for kinds of code the repo says are
  not tested — cite the file and rule. (a), (b) and (d) are hard; (c) is
  hard only when the plan listed the case, otherwise a judgement call.
  Under 400 words."

**Repo review sub-agent prompt**, when the repo has a review skill — include:

- The diff command, commit list, repo path and base.
- The brief: "Invoke the `<skill name>` skill on this diff and follow it as
  written. Return its findings, keeping its own severity labels and marking
  which it says must be fixed before merge."

## 5. Aggregate

Present the reports under `## Standards`, `## Spec`, `## Tests` and
`## Repo review` headings, verbatim or lightly cleaned. Do **not** merge or
rerank findings — the axes are deliberately separate (see _Why separate
axes_). What the repo review says must be fixed before merge counts as a
hard violation for any caller deciding whether the change is clean.

End with a one-line summary: total findings per axis, and the worst issue
_within each axis_ (if any). Don't pick a single winner across axes — that's
the reranking the separation exists to prevent.

Then list sibling repos in the workspace that carry the same branch name, so
the user can run the review there too. The report itself stays in the
terminal; posting to the PR or the issue is the user's separate step.

## Why separate axes

A change can pass one axis and fail another:

- Code that follows every standard but implements the wrong thing →
  **Standards pass, Spec fail.**
- Code that does exactly what the issue asked but breaks the project's
  conventions → **Spec pass, Standards fail.**
- Code that does what was asked, with green tests that would stay green if
  it stopped doing it → **Spec pass, Tests fail.**
- Code that passes the general standards but trips a check only this repo's
  maintainers make → **Repo review fail.**

Reporting them separately stops one axis from masking another.

## Common mistakes

- Spawning sub-agents before the refs and diff are verified → fail in step 1.
- Pointing the Standards sub-agent at the smell list instead of pasting it →
  it has no access to this file.
- Treating a baseline smell as a hard violation → always a judgement call.
- Judging test shape under Standards too → testing sources go to Tests only.
- Counting tests instead of asking what break each one catches.
- Ranking a Spec finding against a Standards finding → report per axis.
- Folding the repo's review skill into the Standards prompt → run it as its
  own sub-agent, as the repo wrote it.
- Reviewing every sibling repo in one run → one repo per run, hint at the rest.
