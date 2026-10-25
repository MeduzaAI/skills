---
"meduza": major
---

`plan-project` and `plan-task` merge into `plan`, sized to the change instead of a fixed template. `build-project` merges into `build`, now user-invoked: it plans with you, then runs each slice in a fresh `build-slice` worker (implement, code-review, verify) with a checkpoint after each stack.
