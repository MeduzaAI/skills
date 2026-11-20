# meduza

## 3.3.0

### Minor Changes

- [#17](https://github.com/MeduzaAI/skills/pull/17) [`2c82621`](https://github.com/MeduzaAI/skills/commit/2c82621065739993327b2f6a2887f5493d6d22ad) Thanks [@mattaliev](https://github.com/mattaliev)! - `plan`: step 2 asks two more choices before code: the reuse boundary when a second consumer is known or named, and the visible result, shown as a sample and agreed before it is built.

- [#17](https://github.com/MeduzaAI/skills/pull/17) [`2c82621`](https://github.com/MeduzaAI/skills/commit/2c82621065739993327b2f6a2887f5493d6d22ad) Thanks [@mattaliev](https://github.com/mattaliev)! - `verify`: a flow walked with the integration the change touches mocked is Not walkable, never Proved. When the repo's docs require the real path before merge, verify follows them and reports the flow so, instead of moving it to a human QA plan.

### Patch Changes

- [#17](https://github.com/MeduzaAI/skills/pull/17) [`2c82621`](https://github.com/MeduzaAI/skills/commit/2c82621065739993327b2f6a2887f5493d6d22ad) Thanks [@mattaliev](https://github.com/mattaliev)! - `build`: sets the model on every agent it launches, and its report lists each new secret or one-time setup step with the exact command and values filled in.

- [#17](https://github.com/MeduzaAI/skills/pull/17) [`2c82621`](https://github.com/MeduzaAI/skills/commit/2c82621065739993327b2f6a2887f5493d6d22ad) Thanks [@mattaliev](https://github.com/mattaliev)! - `code-review`: the Standards axis loads every skill the repo ships for reviewing a diff, and the Duplicated Code smell names DRY and looks beyond the diff for code that copies or rebuilds what the codebase already has.

## 3.2.0

### Minor Changes

- [#15](https://github.com/MeduzaAI/skills/pull/15) [`2f34b37`](https://github.com/MeduzaAI/skills/commit/2f34b379dfa5e71514abdcf235806f665bfa5015) Thanks [@mattaliev](https://github.com/mattaliev)! - `plan` is rewritten from a retro, at the same length. The user now decides before code every choice that shapes the flow: exclusion, the data model, where slow or external calls sit relative to transactions, and which function owns a state change. The design is the simplest that meets its cases. The plan document is sections with nothing between them, brevity over grammar: few, short decisions, a call tree as its own block per slice with transaction boundaries marked, signatures, and one-line cases and flows. Slices are renumbered in order when one is merged, split or removed. File roles and names the repo's rules don't cover are asked, not invented, and the post-approval check verifies every name against those rules. On revise, a merged slice shrinks to its heading and PR link, and there are no backup copies.

### Patch Changes

- [#15](https://github.com/MeduzaAI/skills/pull/15) [`2f34b37`](https://github.com/MeduzaAI/skills/commit/2f34b379dfa5e71514abdcf235806f665bfa5015) Thanks [@mattaliev](https://github.com/mattaliev)! - `build`: after a squash merge, the branch above is rebased `--onto` the default branch, and its worker is briefed with the base as it is now.

## 3.1.0

### Minor Changes

- [#13](https://github.com/MeduzaAI/skills/pull/13) [`4124a41`](https://github.com/MeduzaAI/skills/commit/4124a41819d82bd595e548fed7d90d164e77909f) Thanks [@mattaliev](https://github.com/mattaliev)! - `plan`, `retro`: the review page is redesigned. It has a dark, Linear-style theme that also follows a light OS setting. You comment by selecting text, in a window that grows with what you type, and saved comments stay highlighted. Fenced code is highlighted, a Mermaid diagram opens full screen with zoom and pan, and `> [!NOTE]`-style callouts render as coloured boxes. The footer no longer covers the end of the page. Comments survive a reload. `assets/components.md` shows every component.

## 3.0.0

### Major Changes

- [#12](https://github.com/MeduzaAI/skills/pull/12) [`829bb23`](https://github.com/MeduzaAI/skills/commit/829bb23d8467d8083717a5fecba82cb284bf58ac) Thanks [@mattaliev](https://github.com/mattaliev)! - `implement` is rebuilt and absorbs `build-slice`, which is removed. It takes a planned slice or a ticket to a draft PR in the session it runs in: `tdd` at the slice's seams, cases and flows, the repo's checks, `code-review` in a fresh subagent with this agent fixing what it agrees with, a PR body by `pr`, and `verify` in a fresh subagent whose bugs come back to it. It runs the same whether the user or `build` starts it.

### Minor Changes

- [#12](https://github.com/MeduzaAI/skills/pull/12) [`829bb23`](https://github.com/MeduzaAI/skills/commit/829bb23d8467d8083717a5fecba82cb284bf58ac) Thanks [@mattaliev](https://github.com/mattaliev)! - `build` is slimmed to orchestration: plan with the user, one `implement` worker per slice, a review per stack, then retro. The checkpoint document, its renderer and the answer grammar are gone: when a stack finishes, chat shows one line per PR and any blocked questions, the user reviews on GitHub (with `/autofix-pr` in Claude Code) and replies in plain words.

- [#12](https://github.com/MeduzaAI/skills/pull/12) [`829bb23`](https://github.com/MeduzaAI/skills/commit/829bb23d8467d8083717a5fecba82cb284bf58ac) Thanks [@mattaliev](https://github.com/mattaliev)! - `code-review` has three axes: Standards (now also judging test quality against `tdd`), Spec (now also requiring a test for every planned case and flow) and the repo's own review skill. The separate Tests axis is gone, the smell baseline moves to `references/smells.md`, and each finding is one line marked hard or judgement with its `file:line`.

- [#9](https://github.com/MeduzaAI/skills/pull/9) [`dce35cb`](https://github.com/MeduzaAI/skills/commit/dce35cbea282f1c5044a2234db1a837368752bf5) Thanks [@mattaliev](https://github.com/mattaliev)! - `plan` is freeform: the agent writes `plan.md` sized to the change, which is the saved plan workers read, and reviews it as an HTML page made by prepending a small generic shell (`assets/review.html`) that renders the Markdown and Mermaid and adds a comment box per heading and table row; the user pastes back the copied feedback lines or `approve`. Each slice now lists its `Seams`, `Cases`, `Not tested` and `Flows`. The YAML schema, renderer and template are gone.

- [#12](https://github.com/MeduzaAI/skills/pull/12) [`829bb23`](https://github.com/MeduzaAI/skills/commit/829bb23d8467d8083717a5fecba82cb284bf58ac) Thanks [@mattaliev](https://github.com/mattaliev)! - New `pr` skill: a short PR body merged into the repo's own template, with the shape of the change from `show-me`, the one to three places where a wrong call would hurt, planned cases mapped to tests, and a verification slot `verify` fills.

- [#9](https://github.com/MeduzaAI/skills/pull/9) [`dce35cb`](https://github.com/MeduzaAI/skills/commit/dce35cbea282f1c5044a2234db1a837368752bf5) Thanks [@mattaliev](https://github.com/mattaliev)! - `retro` writes its report once as `retro.md`, each theme a `T<n>` heading with its lesson, evidence, owner and the change as a diff, and reviews it as an HTML page built by prepending the same small review shell `plan` uses; the user pastes back feedback lines (`T1: do`, `T2: skip`, a reroute or a comment) or `approve`. The YAML schema, renderer and template are gone.

- [#11](https://github.com/MeduzaAI/skills/pull/11) [`bc7a5a1`](https://github.com/MeduzaAI/skills/commit/bc7a5a19bd05469647ee2b06ea08de68ede54805) Thanks [@mattaliev](https://github.com/mattaliev)! - `skillify` is rebuilt: one short `SKILL.md` with its writing rules inline (no body template, no title heading, every sentence must change behaviour, free-form descriptions without quoted trigger phrases), a check step that runs a fresh subagent with and without the skill, and placement read from the target repo's `AGENTS.md`/`CLAUDE.md`. The authoring guide, the placement reference and the `~/.agents/skillify.json` device config are gone.

- [#12](https://github.com/MeduzaAI/skills/pull/12) [`829bb23`](https://github.com/MeduzaAI/skills/commit/829bb23d8467d8083717a5fecba82cb284bf58ac) Thanks [@mattaliev](https://github.com/mattaliev)! - New `tdd` skill: write tests red-first, one case at a time, through the given seams and cases, with independent oracles and mocks only at system boundaries. It is the one standard for writing tests and for reviewing them.

- [#12](https://github.com/MeduzaAI/skills/pull/12) [`829bb23`](https://github.com/MeduzaAI/skills/commit/829bb23d8467d8083717a5fecba82cb284bf58ac) Thanks [@mattaliev](https://github.com/mattaliev)! - `verify` proves a change works and has no bugs on a running system: it walks every flow, reads the diff for likely bugs and reproduces each on the app, counting only what it shows happening with evidence. It writes no code; bugs go back to `implement`. With nothing runnable it falls back to a static bug review labelled "not run". It fills the PR's Verification section through `pr`.

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
