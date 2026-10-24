# Placement

Loaded from skillify step 3. Mechanics for clone and `org` scopes only.

## The device config

Skillify ships inside an installed plugin (a read-only cache), so it never
writes next to itself. Where skills go lives in `~/.agents/skillify.json`:

```json
{
  "default": "meduza",
  "clones": {
    "meduza": "/abs/path/to/MeduzaAI/skills",
    "private": "/abs/path/to/own/skills"
  },
  "orgs": [
    {
      "org": "acme",
      "skillsRepo": "/abs/path/to/acme-skills",
      "match": { "paths": ["acme/dev"], "remotes": ["github.com/acme"] },
      "teams": { "frontend": "plugins/acme-frontend/skills" },
      "default": "plugins/acme/skills"
    }
  ]
}
```

Missing, or missing the entry this run needs → ask the user and write it
(asked once per device). No clone on this device (e.g. mobile) → clone
scopes are impossible here; tell the user to capture on a machine with the
clone. `project` and `local` still work.

## Clone scope

Each entry in `clones` is a skills repo laid out like MeduzaAI/skills:
`skills/<bucket>/<name>/`, one plugin listed in `.claude-plugin/plugin.json`,
releases through changesets.

1. Read the clone's `AGENTS.md`; it names the buckets and what a new skill
   needs besides its folder (plugin manifest entry, README line,
   `agents/openai.yaml`).
2. Write to `<clone>/skills/<bucket>/<name>/` and do what `AGENTS.md` lists.
3. Add a changeset, `<clone>/.changeset/<name>-<slug>.md`, for the package in
   the clone's `package.json`: `minor` for a new skill, `patch` for an edit,
   one line on what changed. Never edit `version` by hand; the release PR
   bumps it.
4. Commit and push from the clone. Tell the user the change ships when the
   "chore: version skills" PR merges, then
   `claude plugin update <plugin>@<marketplace>` (or the agent's own update)
   on each device.

## Org scope

1. Match the current repo's path and git remotes against each `orgs[].match`
   block. One hit → use it. None → ask which org, or fall back to the
   default clone. Several → ask, unless the user already named org and team.
2. Path = `<skillsRepo>/<teams[team]>`, or `<skillsRepo>/<default>` when no
   team is given (warn if that plugin does not exist yet).
3. Validate the plugin and tell the user it needs a PR in that repo.

## Not covered

Promotion (clone → org), cross-scope audits, and adding a new org entry
beyond writing what the user dictates are separate capabilities.
