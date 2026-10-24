---
name: plan-task
description: Read before deciding how to build a single task. Use when a task or small spec is about to be built and needs its files, interfaces, test cases and proving flows worked out against the repo. Produces a slim task plan a coding agent builds from, with no decision left to the builder.
---

# Plan Task

Turn one task into a plan a coding agent can build without guessing: which
files, which interfaces, which shapes, which test cases, all fitted to the
repo's existing patterns and standards, plus the flows that will prove the
built change works. Decisions come from the project plan; this skill
applies them to code, it does not make new ones quietly.

## Inputs

- **Consumes**: a task (tracker issue, or a small spec). When it belongs to a
  project with a plan from `meduza:plan-project`, that plan too: its
  Decisions, Facts, Test strategy and the task's slice section.
- **Produces**: the task plan, units and Flows, saved where the task lives
  (a document on the issue; for a repo-file spec, beside it in the repo's
  docs folder, not committed). `meduza:implement` builds the units;
  `meduza:verify` walks the Flows.

Observable conditions shape the run:

| Condition | Behaviour |
|---|---|
| A project plan covers this task | No architecture interview: its Decisions are binding. |
| No project plan | Interview the task's own open decisions first, the way `meduza:plan-project` steps 2–3 do, scaled to one task. |
| The user is in the conversation | Show the finished plan once; approve or change. |
| Dispatched as a worker by another skill | Nobody to ask: the reviewer is the only check. |

A decision the project plan does not settle and the repo does not dictate is
**never** decided here unattended: return Blocked with the question and 2–3
options, recommended first. In an attended run, ask it. A builder that fills
the gap itself is how decisions end up being made in PR review.

## Goal

Done when the plan is saved and:

- every requirement of the task maps to a unit, and nothing else is in it;
- every unit names its files, its interfaces and its definition precisely
  enough that the builder never invents a name or a shape;
- every unit that changes behaviour lists the test cases that prove it;
- every requirement a user or client can observe is covered by a flow, and
  every flow traces to a requirement;
- the plan follows the repo's standards: the reviewer found no violation.

## 1. Read

The task, its slice section and the project plan's Decisions and Facts. Then
the repo's `AGENTS.md`/`CLAUDE.md`, the path rules matching the area, its review
checklist, its testing standards, and the nearest sibling of each thing the
task adds (the existing provider, service or component it should look like).
Unknowns that need digging → `meduza:research`, saving where the task
lives.

## 2. Write the units and the flows

Start the flows first, in a separate session: one fresh
agent with `references/flows-writer-prompt.md`, the task, the project plan
and the testing standards files, **not** the units. Flows written from the
spec alone catch what the design missed; written beside the units, they
just restate them. Write the units while it runs.

A unit is any implementation piece: a model, service, endpoint, migration,
task, component, store, infra resource. In build order.

- **Files**: create / modify, exact paths.
- **Interfaces**: Consumes (exact names from earlier units or existing code)
  and Produces (exact names, parameter and return types that later units or
  tasks rely on).
- **Definition**:
  - *Models / schemas*: fields as a table or `name: type, notes` list, not
    framework code.
  - *Functions / services*: signature and behaviour in a few lines, a short
    snippet only where it is clearer than words.
  - *API*: method, path, request and response shape, taken from the code
    that owns the contract, never inferred from a client.
  - *Components*: props and emits, what it renders, which store or API it
    reads.
- **Pattern**: the sibling it follows ("like `exporters/csv.py`").
- **Tests**: the test cases as behaviours ("rejects a refund above the
  remaining amount", "a 404 from the vendor marks the payment unmatched"), in
  the repo's test layout. A behaviour-neutral refactor lists equivalence
  cases (same outputs as before for the inputs that matter). Skip only where
  the repo's standards say a kind of code is not unit-tested, and say so.

When the flows come back, add them as the plan's **Flows** section. A
requirement they left uncovered → a unit's test cases prove it, or the gap
is a finding. A question they raised about an expected result is an open
decision: ask it, or return Blocked.

Open the plan with the shape of the change from `meduza:show-me`,
against the code as it is today: a file-tree diff of what is created and
modified, and a call-tree or component diff where control flow changes. The
units follow it, then the Flows. The visuals are saved with the plan, so the
builder and the PR reviewer see the same picture the user approved.

Out of the plan: test bodies, commit and PR steps, branch names, restated
spec text.

## 3. Check and save

One fresh reviewer with the plan inline, the task, and the
list of standards files read in step 1, using
`references/plan-reviewer-prompt.md`. Fix what it finds. Attended → show the
plan exactly as it will be saved, approve or change. Then save and report the
location in one line.

## Common mistakes

- Choosing between options the project plan did not settle → ask, or return
  Blocked.
- Proposing before reading the repo's standards and nearest sibling → the
  plan prescribes the violations the reviewer will flag.
- A unit that changes behaviour with no test cases.
- Writing the flows yourself, after the units → a fresh agent, from the spec.
- A flow naming a regression layer the repo does not have → "none", with the
  standard that says so.
- A vendor field name marked "confirm" → it is a fact; verify or block.
- Framework code for a model → a table.
