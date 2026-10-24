# Changesets

Every change to a skill ships with a changeset: a small Markdown file here
naming the bump and what changed. Run `npx changeset`, or write one by hand:

```md
---
"meduza": patch
---

`code-review` now loads the repo's path rules before the diff.
```

`patch` for an edit, `minor` for a new skill or a new behaviour, `major` for a
rename or removal that breaks how people invoke a skill.

On every push to `main`, the Release workflow opens (or updates) a
"chore: version skills" PR that bumps `package.json` and
`.claude-plugin/plugin.json` and writes `CHANGELOG.md`. Merging it tags the
version and publishes a GitHub release.
