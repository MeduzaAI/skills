---
name: plan-project
description: Read before deciding how to build a spec that is more than one task. Use when the user has a spec and wants every decision locked and the work cut into tasks before anything is built. Produces an approved project plan (decisions, slices, stacks, test strategy) and the filed tasks.
---

# Plan Project

Lock every decision a builder or reviewer would otherwise make, then cut the
work into slices and stacks a reviewer can skim. This is the attended phase:
the user's time goes on product and technical decisions, once, here, so that
building is unattended and PR review is a quick check rather than a redesign.

What this plan does **not** carry: files, signatures, field tables, code.
`meduza:plan-task` writes those per task, with the repo open, right before
it is built. A project plan that lists every file takes hours to walk, rots
before the last slice is built, and still misses the decisions that matter.

## Inputs

- **Consumes**: a spec (a tracker project or document, or a file). Missing →
  ask; never go looking for "the latest spec".
- **Produces**: the project plan document, saved where the spec lives, and one
  tracker task per slice with its blockers and stack position.

## Goal

Done when all of these hold, and the user has approved the plan as a whole:

- Every spec requirement maps to a slice, and nothing in a slice was not asked
  for.
- No open question remains. Every gap in the spec is answered or explicitly
  out of scope; any answer that changes the spec is written back to it.
- Every decision a builder would otherwise take on its own — scope boundaries,
  states and transitions, money and amount semantics, failure and recovery,
  permissions, rollout and kill switch, where new code lives — is in the
  Decisions table with its reason.
- Each new or changed component's **responsibility and the call flow between
  them** is drawn (a call tree from `meduza:show-me`): which service
  records, which verifies, who calls whom, what each one owns. This is the
  design a reviewer would otherwise redo in the PR.
- Every external fact a slice depends on (a vendor endpoint, its auth, its
  error behaviour) is verified against a primary source and cited, never
  left as "confirm during build". No primary source exists (an undocumented
  endpoint) → ask the user for one (a sample payload, a sandbox call), or
  record a Decision for how the code behaves while the fact is unknown.
- Slices and stacks follow the rules below, and the tasks are filed.

## 1. Facts before options

Run `meduza:research` in parallel, one question per unknown, saving where
the spec lives: the parts of the codebase the spec touches and the patterns
they follow; each third-party integration per its official docs; and **the
standards of every repo involved** (its `AGENTS.md`/`CLAUDE.md`, path rules, review
checklist, style guide). Proposals that ignore house conventions are what
turn planning into a correction session.

A spec covering several independent subsystems → stop and suggest a plan per
subsystem.

## 2. Close the spec's gaps

List what the spec leaves open that would change behaviour. Typical holes:
which users or paths are in scope, terminal and recoverable states, timing
and retries, what an amount means (gross, net, tolerance), who may act,
what happens on failure, how the feature is switched off, how success is
measured.

Ask in rounds with a question tool or plain text: every question whose
prerequisites are settled, up to four at a time, recommended answer first with its reasoning.
Recompute after each round. An answer that narrows or changes the spec is a
spec edit: show it, and write it to the spec once the user agrees. A plan
that quietly disagrees with its spec is the most expensive mistake this skill
can make.

## 3. Decide the architecture

Same rounds, for the technical decisions the codebase does not already
settle: where a model lives, sync or async, extend or add, which pattern,
which component owns the state. 2–3 options each, grounded in a step 1 fact.

A documented convention is not a question: follow it. An undocumented one
that matters is asked once and recorded as a decision; it is a candidate for
the repo's standards, which `meduza:retro` picks up later.

## 4. Slice

A slice is one repo, one PR, one task. Cut by behaviour, not by layer:

- **Demonstrable on its own.** Someone can check the slice without the
  others: an endpoint, an admin action, a screen against a ready contract,
  or logic proved by its own tests.
- **Floor.** A piece with no behaviour of its own (a model nothing uses yet,
  a serializer alone, a constant) joins the slice that first uses it.
- **Ceiling.** A reviewer reads it in one sitting and an agent builds it in
  one fresh context. A slice spanning several providers, integrations or
  subsystems is split along them.
- **When floor and ceiling collide, the ceiling wins.** A reader joins its
  first consumer, and if that makes the slice too big, cut the consumer
  thinner (one provider path, or the core logic as a pure function proved
  by tests) rather than shipping the reader alone.
- **Prefactor first, and behaviour-neutral.** "Make the change easy, then
  make the easy change." Its test scenarios prove equivalence (same amounts,
  same states, same calls as before). If it needs a behaviour change, that
  part is a feature slice with its own decisions.
- **Contract first across repos.** The repo that owns the contract ships
  first; the client slice is blocked by it.
- **Wide mechanical change**: expand (new form beside the old) → migrate in
  batches → contract (remove the old).
- **What must land together stays together.** Two pieces that are not
  green apart are one slice.

Per slice: a verb-first title saying what changes, what it delivers in one
or two sentences, the decisions it relies on (by number), the test scenarios
that prove it (behaviours, not test code), and its blockers.

## 5. Stack

Group slices into stacks, using GitHub native stacks (`gh stack`) when
available:

- A stack is a chain of dependent slices in **one repo**, bottom to top,
  **1 to 5 PRs**; shorter is better. It is reviewed and merged in order.
- Every slice sits in exactly one stack; a slice nothing depends on is a
  one-PR stack.
- **No stack branches off another.** Two chains needing the same base slice →
  that base is its own one-PR stack that merges first; both chains then start on
  trunk after it.
- Independent slices are separate stacks, buildable in parallel.
- A dependency across repos is never a stack; it is a merge-order edge.

Order the stacks into merge waves: wave 1 has no blockers, wave N needs only
waves before it.

## 6. Approve once

Assemble the plan document (below), with its visuals made by
`meduza:show-me`, and show the user **exactly what will be saved**: the
picture they approve is the picture builders and reviewers later read. Ask:
approve, or change. Revise and re-show until approved. Not unit by unit: the
user judges the whole.

Then one fresh reviewer with the plan inline and the spec,
using `references/plan-reviewer-prompt.md`. Anything it changes is shown to
the user before saving.

## 7. Save and file

Save the plan where the spec lives: a tracker project → a project document;
an issue → a document on it; a repo file → the repo's docs folder per its
convention, not committed.

File one task per slice **following the workspace's documented process**
(statuses, labels, estimates, templates, QA tasks: the company's rules win;
this skill supplies the content). Each task carries its title and what it
delivers, a link to its plan section, its stack and position, and its
blockers as tracker relations, never as text. Blockers first, so relations
point at real IDs. Nothing is filed before approval.

If filing reveals the plan was wrong (a slice needs re-cutting), change the
plan, then the tasks. The plan stays the source.

## Plan document

The plan is read far more than it is written: by the user now, by every
builder and reviewer later. A picture carries the parts that are about
shape; text carries the reasons. Every visual comes from `meduza:show-me`
as markdown that the saved document renders (Mermaid, or a text tree where
the destination has no Mermaid):

| Section | Visual |
|---|---|
| Responsibilities and flow | call tree or sequence diagram of the new and changed components |
| States, if the work has any | state diagram with every transition and terminal state |
| Slices, stacks and merge order | one graph: a subgraph per stack, PRs bottom to top, cross-stack and cross-repo edges, waves |

Decisions stay a table: they are reasons, not shapes.

```markdown
# <Project>: plan
Spec: <link> · Approved <date>

## Goal
One or two sentences.

## Decisions
| # | Decision | Why | Instead of |

## Facts
External contracts each slice relies on, one line each, with the source link.

## Responsibilities and flow
<call tree or sequence diagram> then one line per component: what it owns.

## States
<state diagram>, when the work has states.

## Out of scope
What the spec mentions that this project does not build, and why.

## Slices
### S1 <verb-first title> · <repo> · stack A/1
Delivers: … · Relies on: D2, D5 · Blocked by: — 
Test scenarios: …

## Stacks and merge order
<graph of stacks and edges> then waves: 1. A, C · 2. B · 3. D

## Test strategy
What is proved by unit, integration and manual / QA tests, and which
behaviours carry the most risk.
```

## Common mistakes

- Files, signatures or field tables in the project plan → `plan-task`.
- Approving the plan piece by piece → one view, one approval.
- Showing a different view than the one saved, or a wall of text where a
  flow or state diagram would do → the saved document is the approved picture.
- Asking about a convention the repo documents → read it, follow it.
- "Confirm the vendor's response shape during build" → verify now or block.
- Narrowing scope silently (one customer type, one path) → a spec gap; ask
  and write it back.
- One slice per plan section, or per layer → slice by behaviour.
- A model-only or serializer-only slice → it joins its first consumer.
- A ten-PR stack, or a stack forking off another → 1–5 PRs, separate stacks.
- Filing before approval, or blockers written as text.
