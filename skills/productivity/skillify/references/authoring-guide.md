# Authoring Guide

How to write the actual `SKILL.md` once skillify has decided *what* to capture
and *where* it goes. Distilled from Anthropic's skill-creator and the
superpowers writing-skills guidance, so skillify is self-contained.

Read this before writing or editing skill content.

## What a skill is (and isn't)

A skill is a **reference guide for a proven technique, pattern, or tool** that
future agents find and apply. It is reusable.

It is NOT a narrative about how you solved something once. "In this session we
fixed the websocket bug by…" is not a skill. "Use when debugging dropped
websocket connections" with the general technique is.

Create a skill when: the technique wasn't obvious, you'd reference it again, it
applies broadly. Don't create one for: a one-off, a standard practice documented
elsewhere, or a purely mechanical constraint better enforced by a script/linter.

## Anatomy

```
skill-name/
├── SKILL.md              # required: YAML frontmatter + markdown body
├── references/           # docs loaded on demand (large/optional context)
├── scripts/              # executable code for deterministic/repeated tasks
└── assets/               # files used in output (templates, etc.)
```

**Progressive disclosure — three loading levels:**
1. **name + description** — always in context. ~100 words. The triggering layer.
2. **SKILL.md body** — loaded when the skill triggers. Keep under ~500 lines.
3. **Bundled resources** — loaded only when needed (references), or executed
   without loading (scripts). Effectively unlimited.

Keep judgment and concepts in the body. Push heavy reference (100+ lines), API
dumps, and reusable scripts into separate files, and point to them clearly from
the body with a note on when to read them. For large reference files, add a
table of contents.

When a skill spans multiple domains/variants, organize by variant under
`references/` (e.g. `aws.md`, `gcp.md`) and have the body select which to read.

## Frontmatter

Two fields, `name` and `description`, plus `disable-model-invocation: true`
for a skill only the user should start (a long unattended run, a retro).
Pair it with `policy.allow_implicit_invocation: false` in the skill's
`agents/openai.yaml` so Codex treats it the same way.
Keep frontmatter under ~1024 characters. No `argument-hint`: skills take no
arguments (see Inputs, not arguments).

- **name**: letters, numbers, hyphens only. Active, verb-first or gerund —
  `creating-skills` not `skill-creation`, `root-cause-tracing` not
  `debugging-techniques`. Name by what you DO or the core insight.
- **description**: the router. With the name, it is the only part of a skill
  always in context, next to every other installed skill's description, so
  each extra word costs every session and makes picking the right skill
  harder. Three sentences, in this order, under ~300 characters:
  1. **When to read it**: the situation the agent is in ("Read before …",
     "Required reading before …").
  2. **When to use it**: what the user wants, described as an intent ("Use
     when the user wants …").
  3. **What it covers or produces**: the output or the knowledge inside,
     never the steps.

  Two rules hold the structure:
  - **No workflow.** If the description spells out the process, agents follow
    the description and skip the body. A description saying "review between
    tasks" caused one review where the body specified two.
  - **No trigger phrases.** Quoted phrases ("break this down", «разбей на
    слайсы») are concrete steps for routing: the agent matches words instead
    of understanding the intent, and every language or synonym needs another
    entry. Describe the intent in plain English; the agent generalizes from
    it. Add a "Not for X (use Y)" clause only when a sibling skill actually
    gets picked in this one's place.

```yaml
# ❌ workflow, limits, a list of trigger phrases, five exclusions
description: Release notes — collect merged PRs since the last tag, group by label (feat, fix, chore), drop bots, max 20 lines, post to the channel after approval … Use when "write release notes", "changelog for the release", "what shipped this week", …

# ✅ when to read · when to use · what it produces
description: Read before announcing a release. Use when the user wants the changes since the last release written up for people outside the team. Produces approved release notes, posted where the repo documents.
```

## Inputs, not arguments

A skill takes no arguments and no flags. It reads what it needs from the
conversation: an issue key, a URL, a plan the user or a parent skill just
pointed at. Missing or ambiguous → ask; never guess from the branch name or
"the latest" anything. Modes are not flags either: key the behaviour to a
predicate the agent can observe ("the project already has an approved plan"
→ no interview; "dispatched as a worker by another skill" → nobody to ask,
return Blocked instead). A flag is a decision the user has to remember; a
predicate is one the agent can check.

A parent skill hands values to a child in the prompt it writes ("the base
branch is X, build in a worktree"), not as `--options`.

## Phase skills

A skill that is one phase of a longer workflow (plan, build, review, test)
states its contract in the body: what artifact it **consumes**, what it
**produces**, and where that lands (a tracker document, a PR, a file). The
artifact is the hand-off, so the next phase can run in a fresh session with
only a pointer to it. A phase never assumes the conversation that ran the
previous one.

## Keep personal skills general

A skill in a personal or shared plugin carries no company facts: no team
names, tracker keys, repo names, label sets, process rules or templates.
Those live in the company's own repos (workspace `AGENTS.md`/`CLAUDE.md`, a repo's
path rules, the company's skills plugin) and the skill reaches them by
role: "file tasks per the workspace's documented process", "the repo's own
review skill, whatever it is called". The company copy is the source and it
wins; a general skill that quotes it goes stale and leaks it.

## Body structure

Scale sections to the skill. A common shape:

```markdown
# Skill Name

## Overview
What is this, core principle in 1-2 sentences.

## Inputs
What the skill reads from the conversation, and for a phase skill what it
consumes and produces (see Phase skills).

## When to Use
Symptoms / situations. When NOT to use. Small inline flowchart only if the
decision is non-obvious.

## Goal
What done looks like and how the agent checks it (see Precise goal, loose
steps).

## Core pattern / steps
Before-after for techniques. For procedures, the stages and the order that
matters, not the commands inside each.

## Quick reference
Table or bullets for scanning.

## Common mistakes
What goes wrong + the fix.
```

## Writing style

- **Imperative voice** for instructions.
- **Explain the why.** Today's models have good theory of mind; given the reason
  behind an instruction they generalize past rote steps. Heavy-handed `ALWAYS`/
  `NEVER` in all caps is a yellow flag — reframe as the reason it matters.
- **One excellent example beats five mediocre ones.** Make it complete,
  runnable, from a real scenario, commented to explain WHY. Don't reimplement it
  in five languages or write fill-in-the-blank templates.
- **Lean.** Remove anything not pulling its weight. If a skill loads frequently,
  aim well under 200 words in the body; other skills under ~500.
- **Cross-reference, don't duplicate.** Point to another skill by name
  (`Use superpowers:test-driven-development`) rather than copying its content or
  `@`-loading it (which burns context immediately). This is the DRY rule applied
  to skills themselves.

## Precise goal, loose steps

A skill is not a script. Steps written for the environment the author had
break the moment the repo, the tool, or the data looks different; a goal
survives because the agent adapts to what it actually finds.

**Be precise about:**
- **The goal**: what done looks like, and a way to verify it ("call the
  endpoint with a sample payload and get a 200", "every spec requirement
  maps to a unit").
- **Constraints**: the guardrails that prevent damage or wasted work (never
  write to the issue tracker before approval, one repo per run).
- **Context the agent can't derive**: where data lives, which tool or
  document is the source of truth, the schema or vocabulary it would
  otherwise guess.

**Leave loose:**
- **The steps**: which files to open, which commands to run. "Understand how
  billing works" is enough; `git log --oneline -20` is not needed.
- **Failures**: the agent reads errors and works through them. Name a
  failure only when the right reaction is not obvious (stop and ask instead
  of retry).
- **Runtime specifics**: line numbers, file lists, counts, versions, default
  branch names, example paths. They change, and the skill rots with them.

```markdown
# ❌ a script: breaks on the first repo that differs
Run `git log --oneline -20`. For each commit, open the diff. If a function
is over 50 lines, flag it.

# ✅ a goal: the agent finds the path
Find recent changes that look risky and explain why. Start with the commit
history.
```

Test: if a line tells the agent *how* to do something it already knows how
to do, cut it. If it tells the agent *what* counts as done, or a fact it
can't look up, keep it.

## Link, don't copy

Content that changes outside the skill (a process document, a template, an
API, a CLI's flags) belongs to its source. Point to the source by URL or
path and say it wins on conflict; don't paste it. A copy goes stale
silently, and the agent trusts it over the real thing. Hand-write only the
durable part: the goal, the judgment, the constraints.

## Updating a skill: rebuild, don't patch

A new case or correction is not appended. Re-read the whole
skill, then rewrite it so the new case is part of the core: merge it into
an existing step, generalize a rule, delete what no longer pulls weight.
Fixes stacked one by one blur the skill's focus until the agent can't tell
the rule from the exception. After the rewrite, check the description still
routes to what the body now does.

When a fix touches drifting content, also remove the reason it drifted:
replace the copy with a link.

## Flowcharts

Use a small `dot` flowchart ONLY for a non-obvious decision point or a loop
where an agent might stop too early. Never for reference material (use tables),
code (use code blocks), or linear steps (use a numbered list). Labels must carry
meaning — no `step1`, `helper2`.

## Match the form to the failure

When a skill exists to change behavior, pick the form by what goes wrong:

| Failure | Right form | Wrong form |
|---|---|---|
| Skips a rule under pressure (knows better) | Prohibition + rationalization table + red-flags list | Soft "prefer…/consider…" |
| Output has the wrong shape (bloated, buried) | Positive recipe: state what the output IS, in order | Prohibition list ("don't…") |
| Omits a required element it already produces | A REQUIRED field/slot in the template | Prose reminder near the template |
| Behavior should depend on a condition | Conditional keyed to an observable predicate | Unconditional rule + exemption clauses |

Prohibitions backfire on shaping problems: under a competing incentive, agents
negotiate with "don't X". A recipe leaves nothing to negotiate. Avoid nuance and
exemption clauses ("don't X unless…", "doesn't apply to…") — they reopen the
negotiation and don't actually scope the rule.

For discipline skills only, bulletproof against rationalization: close specific
loopholes explicitly, state that violating the letter violates the spirit, build
a rationalization table from observed excuses, and add a red-flags self-check.

## Verify before you call it done

You don't know a skill teaches the right thing until you've seen the difference
it makes. Test proportionate to the skill's importance and risk:

- **Discipline / behavior-shaping skills**: write a realistic pressure scenario,
  run a subagent on it WITHOUT the skill to capture the baseline failure and the
  exact rationalizations, then run WITH the skill and confirm it complies. Always
  include a no-guidance control — if the control doesn't fail, there's nothing to
  fix. Use 5+ reps; single samples lie; read every flagged match by hand.
- **Technique / reference skills**: run an application scenario and confirm an
  agent can find and correctly apply the guidance; check for gaps.

If you can't run subagents, at minimum re-read the skill cold and walk a
realistic task through it, then have the user sanity-check.

## Quick checklist

- [ ] Name: hyphen-case, active/verb-first
- [ ] Description: three sentences (when to read · when to use · what it covers), under ~300 characters, no workflow, no trigger phrases
- [ ] Goal and how to verify it are explicit; steps, failure handling and runtime specifics are left to the agent
- [ ] Volatile content is linked to its source, not copied
- [ ] Update rewrote the skill around the new case instead of appending to it
- [ ] No arguments or flags: inputs read from the conversation, modes keyed to observable predicates
- [ ] Phase skill: consumes / produces / where it lands are stated
- [ ] No company facts in a personal skill: reached by role, owned by the company's repos
- [ ] Body under ~500 lines; heavy reference / scripts split out and pointed to
- [ ] One strong example, not many weak ones
- [ ] Flowchart only where a decision is non-obvious
- [ ] Guidance form matches the failure type
- [ ] Verified against a realistic scenario (and a no-skill baseline for discipline skills)
