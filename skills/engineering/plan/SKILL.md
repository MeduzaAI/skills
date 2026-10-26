---
name: plan
description: Read before deciding how to build an issue or a spec. Use when the user wants to agree on what gets built, in which slices and how each is checked, before any code is written. Produces an approved plan sized to the change, and its slices.
metadata:
  inspired-by: "Dex Horthy and HumanLayer, https://github.com/humanlayer/advanced-context-engineering-for-coding-agents/blob/main/wsff.md"
---

# Plan

Agree with the user what will be built, in which slices, and how each slice
is checked, before any code exists. A decision made here costs a question;
the same decision made in PR review costs a rewrite. The approved plan is
the builder's brief and the reviewer's yardstick.

The plan serves two readers: the user, who approves it, and the agent that
builds each slice. Size it to the change, the way `meduza:show-me` sizes a
visual: a bug fix is a paragraph and one shape; a project is a few pages.
There is no template. Leave out whatever does not apply.

## Inputs

- **Consumes**: an existing issue or spec, named in the conversation or by
  the caller. Missing → ask.
- **Produces**: the approved plan, saved where the issue or spec lives (a
  document on the issue or project; beside a repo-file spec, uncommitted).

## Goal

Done when the user approved the plan as a whole, it is saved, and it
answers, where they apply:

- **What and why**, in a sentence or two.
- **Decisions**: every choice a builder would otherwise make alone, with its
  reason. A table.
- **Facts**: each external contract a slice relies on, with its primary
  source. No "confirm during build".
- **Architecture**, when the change adds or changes components, contracts
  or data, drawn with `show-me`:
  - *Components and flow*: a sequence diagram of who calls whom, then one
    line per component on what it owns.
  - *Contracts*: each endpoint's method, path, request and response shape;
    each event.
  - *Data*: new or changed tables and fields, and new query shapes.
  - *States*: a state diagram with every transition, when there are states.
- **Slices**: per slice, what it delivers, then its **program design** from
  `show-me`:
  - a file-tree diff, with a note per file on what it is responsible for;
  - a call-tree diff for any orchestration or control-flow change;
  - types and signatures of the key new functions, the ones an agent might
    otherwise get wrong.

  And its **flows**: how it is checked, as steps with expected results, the
  error cases, and the test layer that will keep it.
- **Stacks**, when there is more than one slice: which slices stack on which,
  and which stacks are independent.

## 1. Facts

Research what the plan rests on with `meduza:research`, in parallel: the
code the change touches and its patterns, each third-party API per its docs,
and the standards of every repo involved (`AGENTS.md`/`CLAUDE.md`, path
rules, testing standards). Proposals that ignore house conventions turn
planning into a correction session.

## 2. Decisions

List what the issue or spec leaves open that would change behaviour, then
the technical choices the codebase does not already settle. Ask in rounds
with a question tool or plain text: up to four questions whose prerequisites
are settled, recommended answer first with its reason. A documented
convention is not a question; follow it. An answer that changes the spec is
written back to the spec once the user agrees.

## 3. Slices

A slice is one repo, one PR. Cut by behaviour, not by layer:

- **Demonstrable on its own**: an endpoint, a screen, an admin action, or
  logic proved by its tests.
- **Tracer bullet first**: the first slice is the thinnest path end to end,
  so the first checkpoint shows the design working.
- **Small enough** for one review sitting and one fresh builder; a piece
  with no behaviour of its own joins the slice that first uses it.
- **Prefactor first**, behaviour-neutral. **Contract first** across repos.
- What must land together stays together.

Stacks: a chain of dependent slices in one repo, 1 to 5 PRs, never branching
off another stack. A dependency across repos is a merge-order edge, not a
stack.

## 4. Approve and save

Show the user exactly what will be saved; approve or change, as a whole.
Then one fresh agent checks it against the issue or spec and the standards
for anything a builder would have to guess. Show what that changes, then
save.

## Revise

When the user accepts code that differs from its slice's plan, or asks for
a change: update that slice to what was built, then every later slice that
relies on what changed. Show the changes as a diff; approve; save. A slice
is never built against a plan the code already contradicts.

## Common mistakes

- Filling every section for a small change → only what applies.
- A wall of text where a shape would do → `show-me`.
- Slicing by layer (model, then API, then UI) → by behaviour, tracer first.
- "Confirm the vendor's response during build" → verify now, or ask.
- Narrowing scope silently → a spec gap; ask, write it back.
