# Meduza skills

Agent skills for shipping software: brainstorm a problem, plan it with
you, build it slice by slice into reviewed draft PRs, prove it works, and learn from the
review. Works in Claude Code, Codex, Copilot, VS Code, Gemini CLI and any
agent [skills.sh](https://skills.sh) supports.

## Install

Pick one route per agent. The plugin is a managed, read-only bundle;
skills.sh copies files you own and edit. Installing both gives you every
skill twice.

### Claude Code

```bash
claude plugin marketplace add MeduzaAI/skills
claude plugin install meduza@meduza-skills
```

Skills show up as `meduza:build`, `meduza:code-review` and so on. Update with
`claude plugin update meduza@meduza-skills`, or turn on auto-update for the
`meduza-skills` marketplace in `/plugin`.

### Codex

```bash
codex plugin marketplace add MeduzaAI/skills
codex plugin add meduza@meduza-skills
```

Updates itself at startup.

### GitHub Copilot (CLI and VS Code)

```bash
copilot plugin marketplace add MeduzaAI/skills
copilot plugin install meduza@meduza-skills
```

Then, once, add to `~/.copilot/settings.json` so it updates itself:

```json
{
  "extraKnownMarketplaces": {
    "meduza-skills": { "source": { "source": "github", "repo": "MeduzaAI/skills" }, "autoUpdate": true }
  }
}
```

In VS Code, run **Chat: Install Plugin From Source** and enter
`https://github.com/MeduzaAI/skills`. It updates daily.

### Gemini CLI

```bash
gemini skills install https://github.com/MeduzaAI/skills.git --path skills/engineering
gemini skills install https://github.com/MeduzaAI/skills.git --path skills/productivity
```

Re-run both to update.

### Any other agent, or files you want to edit (skills.sh)

```bash
npx skills@latest add MeduzaAI/skills -a <agent>  # cursor, opencode, windsurf, amp, ...; omit -a to choose
```

One skill on its own:

```bash
npx skills@latest add MeduzaAI/skills --skill=<name>
```

Update with `npx skills@latest update`, and re-run `add` to pick up new
skills.

## The delivery chain

You approve the plan, then check each stack of PRs against it before the
next one is built.

```
build
├─ plan                      with you: architecture, slices, program design
├─ per slice: build-slice    a fresh worker
│  ├─ implement
│  ├─ code-review
│  └─ verify                 → draft PR, then your checkpoint
└─ retro                     with you, after the last checkpoint
```

Each skill calls only the ones below it. `brainstorm` comes before, while
the idea is still open; `retro` also runs on its own, on any session or PR.

Company process (statuses, labels, templates, QA) is never in these skills:
they follow whatever the workspace documents in its `AGENTS.md`/`CLAUDE.md`.

## Skills

### Engineering

- [brainstorm](skills/engineering/brainstorm/SKILL.md): work a plan or idea through, every open decision put to you.
- [build](skills/engineering/build/SKILL.md) (user-invoked): plan an issue or project with you, then build it slice by slice with checkpoints.
- [plan](skills/engineering/plan/SKILL.md): agree what gets built, in which slices, and how each is checked.
- [build-slice](skills/engineering/build-slice/SKILL.md): implement, review and verify one planned slice into a draft PR.
- [implement](skills/engineering/implement/SKILL.md): build one planned slice into a verified commit.
- [verify](skills/engineering/verify/SKILL.md): prove a change works on its deployment, then guard it with tests.
- [code-review](skills/engineering/code-review/SKILL.md): review a change against the repo's standards and its spec.
- [research](skills/engineering/research/SKILL.md): investigate a question against primary sources.
- [show-me](skills/engineering/show-me/SKILL.md): explain code flow or a change with visuals.
- [retro](skills/engineering/retro/SKILL.md): turn review comments and corrections into fixes upstream.

### Productivity

- [skillify](skills/productivity/skillify/SKILL.md): capture a workflow from a session as a skill.
- [steal-like-an-artist](skills/productivity/steal-like-an-artist/SKILL.md): adapt someone else's skill into a brief for skillify.
- [inbox](skills/productivity/inbox/SKILL.md): clear a notification inbox with a click-to-answer board, then apply the answers.
- [setup-statusline](skills/productivity/setup-statusline/SKILL.md): install a compact Claude Code status line.

## Credits

Many of these skills started from other people's work:

- [Matt Pocock](https://github.com/mattpocock/skills): `code-review`, `brainstorm`, `implement`, `research` and `retro` grew out of his skills, and this repo's layout, install story and release flow follow his. Thank you, Matt.
- [Dex Horthy](https://github.com/dexhorthy) and [HumanLayer](https://github.com/humanlayer): `show-me` is built on their simple, lovely skill, and `plan` and `build` follow [Why Software Factories Fail](https://github.com/humanlayer/advanced-context-engineering-for-coding-agents/blob/main/wsff.md).

- [Anthropic's skill authoring best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices), Matt's writing-for-agents and [Jesse Vincent's superpowers](https://github.com/obra/superpowers): `skillify`'s writing rules are drawn from all three.

Each of those skills names its source in `metadata.inspired-by` in its frontmatter.

## Contributing

Repo rules for agents and humans are in [AGENTS.md](AGENTS.md). Every change
ships with a changeset; see [.changeset/README.md](.changeset/README.md).
