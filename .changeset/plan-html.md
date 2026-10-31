---
"meduza": minor
---

`plan` is freeform: the agent writes `plan.md` sized to the change, which is the saved plan workers read, and reviews it as an HTML page made by prepending a small generic shell (`assets/review.html`) that renders the Markdown and Mermaid and adds a comment box per heading and table row; the user pastes back the copied feedback lines or `approve`. Each slice now lists its `Seams`, `Cases`, `Not tested` and `Flows`. The YAML schema, renderer and template are gone.
