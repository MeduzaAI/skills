---
"meduza": minor
---

`plan` is rewritten from a retro, at the same length. The user now decides before code every choice that shapes the flow: exclusion, the data model, where slow or external calls sit relative to transactions, and which function owns a state change. The design is the simplest that meets its cases. The plan document is sections with nothing between them, brevity over grammar: few, short decisions, a call tree as its own block per slice with transaction boundaries marked, signatures, and one-line cases and flows. Slices are renumbered in order when one is merged, split or removed. File roles and names the repo's rules don't cover are asked, not invented, and the post-approval check verifies every name against those rules. On revise, a merged slice shrinks to its heading and PR link, and there are no backup copies.
