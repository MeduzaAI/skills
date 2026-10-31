---
name: skillify
description: Write or rebuild an agent skill. Required reading before creating or editing any SKILL.md, including turning a workflow from this session into one.
metadata:
  inspired-by: "Matt Pocock, https://github.com/mattpocock/skills; Anthropic, https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices; Jesse Vincent, https://github.com/obra/superpowers"
---

Turn a workflow into a skill, or rebuild an existing one. Done means exactly one skill covers the capability, and it is short enough that every line gets followed.

**Capture.** Pull the reusable approach out of the session: the technique, the order that mattered, the user's corrections, the input and output. Leave out the one-off story. State it in one line and confirm it with the user.

**Dedupe.** Search every skill you can see, installed and in the target repo.

- One already covers it → rebuild that one around the new case.
- One overlaps → fold it in, or carve a clean boundary. Say which.
- Unsure → list the candidates and let the user pick.

**Place.** Where the user said wins. Inside a skills repo → follow its `AGENTS.md`/`CLAUDE.md` for the folder, manifest, README, changeset and PR. Inside another project → `.agents/skills/<name>/`, or `.claude/skills/` if the project already uses it. Tied to no project → ask. State the path before writing.

**Write** by the rules below. Rebuilding: re-read the whole skill and rewrite it with the new case folded into the core. Appended fixes blur the rule into its exceptions.

**Check.** Give a fresh subagent a realistic task without the skill, then with it, and compare. Rebuilding: include a case the old version missed.

A missed instruction is a prominence problem: move it up or make it stronger, never add a neighbour. Then cut every sentence the run didn't need, and confirm the description still routes to what the body does.

Report: created or rebuilt, which skill, its path, what the check showed, and what is still owed (a PR, a release).

## Writing a skill

The reader is a capable agent that already knows how to code, search and use git. Write only what it can't look up or wouldn't do by default.

- **Every sentence changes behaviour.** Would the agent act differently without it? No → delete the whole sentence. Every line of a short skill gets followed; a long one gets skimmed.
- **No template.** No title heading: open with the instruction. Add headings only where the skill splits into distinct cases. A mistakes line earns its place only for a failure you have seen that the steps don't already prevent.
- **Short paragraphs.** One or two sentences, one line per paragraph, no hard wrapping. Bullets for parallel items.
- **Show, then tell.** One concrete example beats a paragraph of explanation, and beats five weak examples.
- **Say what to do.** "Write one-line comments" beats "don't write long comments", because a prohibition puts the unwanted behaviour in mind. Keep "never" for hard guardrails, with the reason.
- **Goal over steps.** Be exact about what done looks like and how to check it, the constraints, and facts the agent can't find. Leave out commands it knows, ordinary error handling, and runtime specifics such as paths, counts and versions.
- **Leading words.** One word the model already understands (a _frontier_, a _tight_ loop) replaces a sentence. Reuse the word instead of re-explaining it.
- **Link, don't copy.** Content owned elsewhere (a process doc, an API, a CLI's flags) gets a pointer, and the source wins. A copy goes stale and the agent trusts it anyway.
- **Inputs come from the conversation.** No arguments or flags. Key modes to something the agent can observe ("dispatched by another skill → return instead of asking"). A phase of a longer workflow names the artifact it consumes and produces, so the next phase can start in a fresh session.
- **Push down only what some runs need.** What every run needs stays in `SKILL.md`. Reference only some branches reach goes in `references/`, behind a pointer that says when to read it. Repeatable code goes in `scripts/`.

**Description.** It sits in every session next to every other skill's description and decides whether this one loads. Lead with the situation or intent, in a sentence or three of its own shape. Describe the intent in plain words: the agent matches meaning, and quoted trigger phrases teach it to match words. Leave the steps out, because an agent that reads a workflow in the description follows that and skips the body.

```yaml
description: Fix an end-to-end test that passes locally but fails in CI. Read before reaching for retries or longer timeouts.
```

**Frontmatter.** `name` in hyphen-case, named for what the skill does or makes. `description`. `metadata.inspired-by: "<who>, <link>"` when it is built from someone's work. `disable-model-invocation: true` when only the user should start it, which also means no other skill can call it.

**Every harness.** Describe the action ("ask with a question tool", "a fresh subagent"), not one harness's tool name, and write `AGENTS.md`/`CLAUDE.md` together. A skill in a public or personal repo reaches company facts by role ("the workspace's documented process"), never by naming teams, repos or trackers.
