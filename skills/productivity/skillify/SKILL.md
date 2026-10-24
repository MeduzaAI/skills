---
name: skillify
description: Required reading before writing or editing any SKILL.md. Use when a workflow or hard-won approach from this session is worth keeping as a reusable skill. Produces one skill covering the capability, new or rebuilt, in the right plugin.
---

# Skillify

Capture → dedupe → place → author. Afterwards exactly one skill must cover
this capability. Create a todo per step.

## 1. Capture

Extract the general, reusable approach from the session: technique, step
order, the user's corrections, input/output shape. Not the one-off story.
State it in one line and confirm with the user.

## 2. Dedupe (DRY / MECE)

Search every skill visible to you (user, project, installed plugins) for one
that covers this or an adjacent slice.

- Covers it → rebuild that skill with the new case folded into its core, per
  "Rebuild, don't patch" in the authoring guide. Say which and why.
- Overlaps part of it → fix the boundary first: fold in, or carve a
  non-overlapping slice. Say which.
- Nothing → create.
- Unsure → list the candidates and let the user choose.

## 3. Place

A scope the user named wins. Otherwise infer, state the reason, and confirm
before writing anywhere but the default clone: a company project whose org
is in the device config → `org [team]` (backend, frontend, QA by the
project's stack); anything else → the default clone.

| scope | path |
|---|---|
| clone (default) | a skills repo clone from the device config, `skills/<bucket>/<name>/` |
| `project` | `<repo>/.agents/skills/<name>/`, or `.claude/skills/` if the repo already uses it |
| `local` | same as project; remind the user it is gitignored |
| `org [team]` | resolved from the device config's `orgs` |

Read `references/placement.md` for the device config, clone and `org`
resolution.

## 4. Author and propagate

Read `references/authoring-guide.md`, then write or edit the skill at the
resolved path.

Propagate per `placement.md`: clone → changeset, commit and push, the user
told when it ships and how to update. `org` → the plugin validates, note it needs a PR.

Report: created or updated (which skill), absolute path, resolved
scope/team/org, and the propagation step still owed.
