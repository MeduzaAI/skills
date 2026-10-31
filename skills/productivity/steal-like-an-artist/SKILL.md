---
name: steal-like-an-artist
description: Read before adapting someone else's skill. Use when an existing skill is close to what the user needs but not right. Produces a brief for meduza:skillify that keeps what works and changes what does not.
---

# Steal Like an Artist

Analyze → interview → brief → hand off. Authoring and placement belong to
`meduza:skillify`; this skill produces the brief it authors from. Create a
todo per step.

## Inputs

From the conversation:

- **The source skill**: plugin-qualified (`superpowers:brainstorming`), bare
  name, or path to a `SKILL.md`. Resolve via installed plugin caches,
  the user skill dirs (`~/.agents/skills/`, `~/.claude/skills/`), and the
  project's (`.agents/skills/`, `.claude/skills/`). Missing → ask,
  never guess.
- **Donor skills**, if the user names more than one: pieces to lift from.
  The first one named stays the base.

Not for: a capability nothing covers yet, or capturing this session's work
(`meduza:skillify`); a skill you already own (edit it directly).

## 1. Read the source cold

Read the whole `SKILL.md` and every file it references.

## 2. Critique

Arrive at the interview with a numbered critique; it is the agenda. Cover:

- **Load-bearing parts**: what makes the skill work. The brief must carry these.
- **Structure**: trigger (frontmatter), body shape, `references/`, `scripts/`,
  length.
- **Gaps against `meduza:skillify`'s "Writing a skill" rules**: anything
  they would cut or change.
- **Assumptions that won't hold here**: paths, tools, repo layout, team
  conventions, output locations.

## 3. Interview

One question at a time. Walk the critique first, then ask for the user's own
points. Reach a decision on each: **keep** (verbatim), **change** (how and
why), **add**, **drop** (why), **name and trigger**. Record every why as you go.

## 4. Brief

Write the brief: name and trigger, source skill, then the keep / change / add /
drop lists from the interview with each why. Paste **keep** text verbatim so
the source never needs reopening. Get the user's yes before handing off.

## 5. Hand off

Invoke `meduza:skillify` at its place step. Tell it capture and dedupe are
done and the overlap with the source is deliberate: the new skill replaces it.
Give it:

1. The brief as the sole content source.
2. The constraint: author from the brief, never copy-edit the source file.
   Editing a copy inherits its bloat, voice, and every gap from step 2.

Then tell the user how replacement works: `claude plugin disable` is per
plugin, not per skill, and there is no per-skill disable. The new skill wins on
triggering only through its description — the agent picks a skill before any
body loads, so a "supersedes" line in the body changes nothing. Make the
description more specific to your contexts than the source's.

## Common mistakes

- Opening with "what would you improve?" → bring the critique.
- Authoring `SKILL.md` here → brief and hand off.
- Inheriting the source description → rewrite for your triggers, or both fire.
- Dropping load-bearing parts with the bad ones → check the brief against the
  step 2 list.
- Recording what changed but not why → the why is what lets you re-steal later.
