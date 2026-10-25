---
"meduza": minor
---

`build` hands off `/autofix-pr` at each checkpoint, so review comments left on the PRs get fixed; outside Claude Code it fetches the comments and runs them as rework. Pushes after a worker's report get their shape re-checked against the plan.
