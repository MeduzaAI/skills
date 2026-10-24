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

## What the changelog lines look like

Each changeset's summary becomes one bullet under the new version, grouped
into Major, Minor and Patch Changes. `@changesets/changelog-github` adds the
PR and commit links and a "Thanks @user" by looking up, through the GitHub
API, the PR that added the changeset. Write the summary as the line a reader
should see; the links come for free.

## Leave `npm run version` to the workflow

The changelog formatter calls the GitHub API, so `npm run version` fails on
a machine without `GITHUB_TOKEN`. The Release workflow has the token; don't
run the version step locally.

## Repo setting the workflow needs

Settings → Actions → General → Workflow permissions → "Allow GitHub Actions
to create and approve pull requests" must be on (for an org repo, the org
must allow it first). Without it the workflow can't open the version PR and
fails. Releases of an already-bumped version still tag and publish.
