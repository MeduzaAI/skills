# meduza

## 2.1.1

### Patch Changes

- [#7](https://github.com/MeduzaAI/skills/pull/7) [`6829af3`](https://github.com/MeduzaAI/skills/commit/6829af3a9d92890260dda6ec910abe56303f2dd1) Thanks [@mattaliev](https://github.com/mattaliev)! - `inbox`: reply drafts come as an HTML document (`assets/drafts.html`) where the user edits each reply in place, marks it Send or Skip, and pastes back one answer block.

## 2.1.0

### Minor Changes

- [`a519255`](https://github.com/MeduzaAI/skills/commit/a519255827899597ac0946e161505ca720a9b42c) Thanks [@mattaliev](https://github.com/mattaliev)! - Add `inbox`: research every unread notification, show a click-to-answer board from a fixed template, apply the answers and mark handled notifications read.

### Patch Changes

- [#6](https://github.com/MeduzaAI/skills/pull/6) [`b664ec3`](https://github.com/MeduzaAI/skills/commit/b664ec3ef96ea0b5b3b9af6f4fcf50abfaeac442) Thanks [@mattaliev](https://github.com/mattaliev)! - `inbox`: the board template's example data uses neutral names and a neutral accent colour.

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
