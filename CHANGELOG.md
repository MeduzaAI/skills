# meduza

## 2.0.0

### Major Changes

- [#1](https://github.com/MeduzaAI/skills/pull/1) [`a9602e4`](https://github.com/MeduzaAI/skills/commit/a9602e4258cffe41daf745bb240389335ea5acfa) Thanks [@mattaliev](https://github.com/mattaliev)! - `plan-project` and `plan-task` merge into `plan`, sized to the change instead of a fixed template. `build-project` merges into `build`, now user-invoked: it plans with you, then runs each slice in a fresh `build-slice` worker (implement, code-review, verify) with a checkpoint after each stack.

### Minor Changes

- [#2](https://github.com/MeduzaAI/skills/pull/2) [`567c9a4`](https://github.com/MeduzaAI/skills/commit/567c9a4c8c77b4280163e963ee27b773f9c15b82) Thanks [@mattaliev](https://github.com/mattaliev)! - `build` hands off `/autofix-pr` at each checkpoint, so review comments left on the PRs get fixed; outside Claude Code it fetches the comments and runs them as rework. Pushes after a worker's report get their shape re-checked against the plan.

- [#3](https://github.com/MeduzaAI/skills/pull/3) [`793c59d`](https://github.com/MeduzaAI/skills/commit/793c59dd69a6d34dceac8d307e64ee3ae721d243) Thanks [@mattaliev](https://github.com/mattaliev)! - Skills now reference only the skills below them. `plan` covers architecture (components and flow, contracts, data, states) and per-slice program design (file tree, call tree, key signatures). `build` ends by running `retro` with you; `retro` is now model-invoked and names no skills, so it works on any session or PR.

## 1.0.0

### Major Changes

- First release as `meduza`, split out of `mattaliev/skills` (where it was the `personal` plugin). Skills are now invoked as `meduza:<name>`, e.g. `meduza:build`.
- Works beyond Claude Code: installs on Codex, Copilot, VS Code, Gemini CLI and anything skills.sh supports. Skill text no longer names Claude Code tools; Codex reads `agents/openai.yaml` beside each skill.
- `skillify` reads where to write skills from `~/.agents/skillify.json` and ships edits as changesets instead of hand bumps.
