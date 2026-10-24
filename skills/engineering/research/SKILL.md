---
name: research
description: Read before investigating a question a later decision depends on. Use when the user or another skill wants a topic, API, or part of the codebase looked into against primary sources. Produces a cited artifact plus the findings inline.
metadata:
  inspired-by: "Matt Pocock, https://github.com/mattpocock/skills"
---

## Inputs

- **Question**, from the conversation: what to find out. Passed to the agent
  verbatim. Unclear → ask.
- **Destination**: where the artifact lands, when the user or the calling
  skill names one (an issue or project, a Notion page, a repo path). Named →
  use it as-is, no questions.

## Pick the destination first

The agent runs in the background, so decide before dispatch. With no destination
named, infer from context:

- An issue-tracker issue or project is in play → a document attached to it there.
- The question is about code in a repo that already keeps such notes → a Markdown
  file there, following that convention.
- Otherwise → a Notion page.

If none of these clearly applies, ask the user one question with the three options.
Then state the pick in one line and proceed.

## Pick the model

Match the model to the question: a cheaper one for reading and citing sources,
a stronger one only where the work is judgement, such as reconciling sources
that disagree or a finding a later decision will stand on.

## Dispatch

Spin up a **background agent, or several**, to do the research, so you keep
working while they read. Split by source when the question spans them — one agent
reading the codebase for what exists, another reading the external provider's
docs for what must be called. Each agent's job:

1. Investigate the question against **primary sources** — official docs, source
   code, specs, first-party APIs — not a secondary write-up of them. Follow every
   claim back to the source that owns it.
2. Write the findings to the chosen destination, citing each claim's source.
   Shape is the agent's call; the citations are not. The agent writes the
   artifact, never the caller: the caller's context stays small, and the
   findings survive even if the calling session ends. With several agents, each
   writes its own artifact and returns its own link.
3. Return the artifact link and the full findings inline, so the caller can act on
   them without opening the artifact.

## Common mistakes

- Asking the user where to save when a destination was passed → the caller chose;
  respect it.
- Dispatching before the destination is settled → the agent stalls or guesses.
- Returning only the link → a calling skill then has to reopen and parse the
  artifact.
- Telling the agent not to write and saving in the caller → the findings land in
  the caller's context twice, once returned and once re-emitted.
