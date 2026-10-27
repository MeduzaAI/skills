---
name: retro
description: Read before reflecting on how a piece of agent-built work went, from its review comments or its sessions. Use when the user, or a skill finishing a run, wants the same review comment or correction never to be needed again. Produces ranked improvements, each routed to the check, standard or skill that owns it.
metadata:
  inspired-by: "Matt Pocock, https://github.com/mattpocock/skills"
---

# Retro

Every review comment and every correction the user had to make is a defect
in the agent's environment, not just in the code. This skill finds them,
works out which part of the environment should have prevented each one, and
proposes the fix there, so the next run does not need the comment.

Be specific and critical. A flattering retro is worthless.

## Inputs

From the conversation: one or more PRs, a project or stack (its PRs), one
or more sessions, or several of these. Nothing named → the current session.

- **Produces**: a dated report and, for the improvements the user approves,
  the changes themselves in the repos that own them.

## Goal

Done when every comment and correction in the sources is classified and
routed, recurring ones are counted, the report is saved, and each approved
improvement has landed (or has a draft PR) in its owner.

## 1. Gather

Read primary sources, not memories of them:

- **PRs**: every human review comment, inline and top-level, with the reply
  and the commit that answered it. When the agent posts under the user's own
  account, tell them apart by the agent's footer or signature.
- **Sessions**: transcripts on this machine (the harness's session store,
  e.g. `~/.claude/projects/` or `~/.codex/sessions/`): the user's corrections, rework, dead ends, long
  waits for information.
- **The plan and the spec** the work was built from, to tell "the builder
  ignored a decision" from "nobody made the decision".
- **The skills the session used**, read from the sources themselves (the
  skills invoked, the instructions loaded), and where each one lives.

Large sources → parallel subagents, one per PR or session, each writing its
findings to a file; this session reads the files.

## 2. Classify and route

For each comment or correction, decide what should have prevented it:

| Finding | Owner of the fix |
|---|---|
| A mechanical rule (banned API, import shape, naming pattern, file location) | An automated check: the repo's linter, pre-commit hook or CI job, whichever is cheapest there. Prefer a check over a written rule. |
| A judgement rule (structure, error handling, test shape, "follow the sibling") | The repo's standards that its reviewer loads: its review checklist or path rules. `AGENTS.md`/`CLAUDE.md` holds only navigation pointers. |
| A rule that exists but was not applied | Enforcement, not a new rule: wire it into the reviewer or a check, or make it discoverable from the paths it governs. |
| A rule the repo documents the opposite way | Ask the user for the ruling, then fix the document. |
| A product or technical decision made in review | The planning step that should have asked it: a missing class of question in the planning skill the session used, or a checkpoint that should have caught it. If the work is still running, add the answer to its plan's decisions. |
| A PR boundary problem (too small, too big, wrong stack) | The slicing and stacking rules of the planning skill the session used. |
| A skill behaving wrongly | The skill that did it, rebuilt in its own repo, through the skill-authoring skill when one is installed. |
| Information the agent could not find or reach | A navigation pointer, a doc, or access (logs, read-only service access). |
| An expensive or repeated tool call | Tooling: a script, a better command. |

The implementing agent has the most context pressure, the reviewing agent
the least. Standards are imposed at review; the builder only needs the
path rules that load for the files it touches.

## 3. Rank and report

Rank by recurrence first (the same ask in different words counts as one
theme, made N times), then by cost (redesign beats a rename). For each
theme:

- **headline**: the lesson in plain words, as what the agent does wrong.
  Never the comment text.
- the evidence: quotes with links, and the reply that answered each;
- the owner: the kind of fix, the repo, and the file, skill or check;
- the concrete change as a **diff to the owner file**: the rule, check or
  skill text exactly as it would land.

Save the report where the workspace keeps retros, if it documents a place;
otherwise `~/.agents/retros/<project-dir>/YYYY-MM-DD-<slug>.md`.

## 4. Apply what the user approves

Copy `assets/retro.html` next to the report, fill its `DATA` block and
nothing else, then open it. The comment above `DATA` lists the fields.
Seed `targets` with the owners found in step 2 and the repos in play, so
the user can reroute a fix without typing paths. In chat, say only that
the retro is open and to paste the answer block when done.

The user marks each theme do or skip, edits its route or text, or
comments, and pastes back the answer block. Apply it:

- `do 1 3`: apply those changes as proposed.
- `skip 2`: drop it; note it as skipped in the report.
- `4 ✎`, with a `→ <kind> <target> @ <repo>` line and/or indented rule
  text: apply the user's version, to their target, as written.
- `5 💬 "…"`: don't apply. Rework that theme's proposal to meet the
  comment (a `✎` block for it is the starting point), then open a fresh
  copy for another round: new `id`, `round` and `previous` set on the
  reworked themes, decided themes carried over folded via `decided`.
  Repeat until no theme is left to revise.

Each change lands in its owner: a repo change on its own branch with a
draft PR in that repo (one repo, one PR; the same branch name when one
change spans repos); a skill change via the skill-authoring skill when one
is installed. Nothing is changed before the user picks it.

## Report

Report path, the biggest lesson in one line, and per improvement where it
went (PR link, skill, or left as a note).

## Common mistakes

- Writing a prose rule for something a linter can catch → build the check.
- Adding a rule that already exists → it is an enforcement gap.
- Treating a review-time decision as a coding standard → it belongs to
  planning.
- Putting standards in `AGENTS.md`/`CLAUDE.md` → the reviewer's standards file.
- Fixing one instance of a recurring ask → the rule, so every instance goes.
- The report pasted in chat, or a Markdown list, for approval →
  `retro.html`; chat says only that it is open.
