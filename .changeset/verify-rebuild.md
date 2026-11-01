---
"meduza": minor
---

`verify` proves a change works and has no bugs on a running system: it walks every flow, reads the diff for likely bugs and reproduces each on the app, counting only what it shows happening with evidence. It writes no code; bugs go back to `implement`. With nothing runnable it falls back to a static bug review labelled "not run". It fills the PR's Verification section through `pr`.
