# meduza

## 1.0.0

### Major Changes

- First release as `meduza`, split out of `mattaliev/skills` (where it was the `personal` plugin). Skills are now invoked as `meduza:<name>`, e.g. `meduza:build`.
- Works beyond Claude Code: installs on Codex, Copilot, VS Code, Gemini CLI and anything skills.sh supports. Skill text no longer names Claude Code tools; Codex reads `agents/openai.yaml` beside each skill.
- `skillify` reads where to write skills from `~/.agents/skillify.json` and ships edits as changesets instead of hand bumps.
