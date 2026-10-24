# MeduzaAI/skills

Agent skills shipped as one plugin, `meduza`. Skills are invoked as
`meduza:<name>` in Claude Code and Codex, and by bare name elsewhere.

## Layout

Skills live in bucket folders under `skills/`:

- `engineering/`: the delivery chain and other daily code work
- `productivity/`: non-code tools, including skill authoring

Every skill folder holds a `SKILL.md` and an `agents/openai.yaml`, plus
`references/` when it needs them.

## Adding, renaming or removing a skill

Do all of these in the same change:

- The skill's entry in `.claude-plugin/plugin.json`'s `skills` array. The
  plugin ships exactly that list.
- Its line in the README's skill list, the name linked to its `SKILL.md`.
- Its `agents/openai.yaml`: `interface.display_name` and
  `interface.short_description` for the Codex picker.
- A changeset (see Releases).

Run `claude plugin validate . --strict` after touching either manifest.

## Invocation

A skill is either model-invoked (the default) or user-invoked. User-invoked
means `disable-model-invocation: true` in the frontmatter and
`policy.allow_implicit_invocation: false` in `agents/openai.yaml`. Keep the two
in sync: a skill is user-invoked in every harness or none. Only the user can
start a user-invoked skill, so no other skill may call one; tell the user to
run it instead.

## Writing skills for every harness

These skills run in Claude Code, Codex, Copilot, Gemini CLI and others. Skill
text describes the action, never one harness's tool name:

| Not this | This |
|---|---|
| AskUserQuestion | a question tool or plain text |
| EnterWorktree | enter the worktree |
| a `general-purpose` / `Explore` agent | a fresh subagent |
| `CLAUDE.md` | `AGENTS.md`/`CLAUDE.md` |
| `.claude/skills/` | `.agents/skills/` or `.claude/skills/` |

A step that only one harness supports (a Claude Code command, the status
line) says so and says what to do elsewhere.

Cross-references to another skill in this plugin use its qualified name,
`meduza:<name>`.

## Public repo

This repo is public. No company facts in any skill: no team or repo names,
tracker keys, label sets, process rules, local paths or templates. A skill
reaches those by role ("the workspace's documented process", "the repo's own
review skill") and the company's own repos hold them.

## Releases

Every change to a skill ships with a changeset in `.changeset/` (see
`.changeset/README.md`). Never edit `version` by hand. On push to `main` the
Release workflow opens a "chore: version skills" PR; `npm run version` bumps
`package.json`, copies the version into `.claude-plugin/plugin.json` and
writes `CHANGELOG.md`. Merging that PR tags `vX.Y.Z` and publishes a GitHub
release. Installed plugins update when the `plugin.json` version changes.
