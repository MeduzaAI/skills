---
name: plan
description: Read before deciding how to build an issue, a spec or a change the user describes. Use when the user wants to agree on what gets built, in which slices and how each is tested, before any code is written. Produces an approved plan sized to the change, and its slices.
metadata:
  inspired-by: "Dex Horthy and HumanLayer, https://github.com/humanlayer/advanced-context-engineering-for-coding-agents/blob/main/wsff.md"
---

Agree with the user what gets built, in which slices, and how each slice is tested, before any code exists. The user reads diagrams, trees, signatures, cases and flows, and skips prose. A slice's builder reads only its part and has nobody to ask. So the plan is sections in `meduza:show-me` shapes with nothing between them: fragments over sentences, brevity over grammar, every name exact. Size it, and its research, to the change: a one-slice bug fix is a line of what and why, the file it touches and its `Cases`.

**Consumes** what to build, from the conversation: an issue, a spec or the user's description; nothing yet → ask. **Produces** the approved `plan.md`, saved where the issue or spec lives: a tracker document, or beside a repo-file spec, uncommitted. A description alone → it stays in the working folder, with the answers that settle scope as its spec.

## 1. Facts

Research in parallel with `meduza:research`: the code the change touches, each third-party API per its docs, and every involved repo's layout, naming and testing rules. Every external contract a slice relies on goes in the plan with its primary source, never "confirm during build".

## 2. Decisions

The user decides, before code, every choice that shapes the flow. Ask each of these the change touches, however obvious a default looks:

- Exclusion: what stops two callers doing the same work.
- Data model: a new table, or a field or status on one that exists.
- Where each slow or external call sits relative to transactions.
- Which function owns each state change, and every path that reaches it.
- Reuse boundary: when a second consumer is known or named, what is shared and what stays specific to each.
- Restriction: every allow list, limit, filter or permission the plan adds that the user did not ask for.
- Visible result: what the user will read or see, shown as a sample and agreed before it is built.

Simplest design first. Every component, endpoint, state, retry, timer and loop serves a case or flow in a slice; one with no case is cut. A flow with a loop, a retry or a race is first five to ten plain steps, the simplest that meets its cases; its call tree follows them.

Then what else the spec leaves open that would change behaviour. A documented rule is not a question; follow it. A file role, name or route the repo's rules don't cover is one: ask; don't invent it. Ask in rounds with a question tool or plain text: up to four questions whose prerequisites are settled, a few lines each, recommended answer first with its reason. A change to a core function → its call tree is a question, agreed before the rest is written. An answer that changes the spec is written back to it.

## 3. Slices

A slice is one repo, one PR, cut by behaviour, not by layer:

- **Demonstrable on its own**: an endpoint, a screen, or logic proved by its tests.
- **Tracer first**: the thinnest path end to end; across repos, the contract slice, then a tracer in each.
- **Small enough** for one review sitting and one fresh agent; a piece with no behaviour of its own joins the slice that first uses it.
- **Prefactor first**: behaviour-neutral groundwork is its own slice ahead of the tracer.
- **Stacked**: a stack is a chain of dependent slices in one repo, 1 to 5 PRs, never branching off another stack. Across repos, a dependency is a merge-order edge.

## 4. Tests

Agree each slice's tests with the user, placed by the repo's testing docs, under these exact headings:

- `Seams`: the public interfaces the slice is tested through.
- `Cases`: one line each, concrete input → expected output: "`POST /session`, expired token → 401, no session row". A table when inputs vary together.
- `Not tested`, when it matters: what and why.
- `Flows`, for any user-visible or cross-service path: numbered steps, each with its expected result, error paths included.

## 5. Write and review

Write `plan.md`: one line of what and why, then what applies of:

- **Decisions**: a table, one short row each with its id (`D1`) and reason. Only choices the user made and those that bound the work; a detail lives in the section that shows it.
- **Facts**: each contract with its source.
- **Architecture**, when components, contracts, data or states change: an architecture or sequence diagram; a state diagram with every transition; each endpoint's method, path, request and response; changed tables and query shapes.
- **Slices**: a heading per slice with its id (`### S1 Tracer: …`), a line on what it delivers, then `Files` (a file-tree diff, a few words per file on its role), `Call tree`, `Signatures` (each function and type added or changed, as code) and its tests. Ids read S1, S2, S3 in build order: renumber when a slice is merged into another, split or removed, between review rounds, never within one.
- **Stacks**, when there is more than one slice.

`Call tree` is its own block, never comments beside the file tree: main functions only, a diff where the code exists, transaction boundaries marked.

```text
start
  tx
    insertRun
  launchContainer    # outside tx
```

Keep one `plan.md` in a working folder, uncommitted, edited in place: no backup copies. Build the review page with `cat <this skill's dir>/assets/review.html plan.md > plan.html` and open it; never read it. In chat, say only that it is open and to paste the copied feedback.

The feedback is lines like `S1: split the migration out`, or `approve` alone. Meet each comment in `plan.md`, or answer it; one that reopens a decision goes back to step 2. Anything but `approve` → rebuild the page for another round. After approval, a fresh subagent checks the plan for anything a builder would have to guess, every path, file role, route, table and name against each repo's layout and naming rules, listing each with the rule it meets, and every kind of thing two slices each add one of (a tool, a provider, a handler): the first slice defines its shape and file, the second adds one more. Its changes get the same review, then save.

## Revise

When the user accepts code that differs from its slice, or asks for a change, update `plan.md` (gone → start from the saved plan): that slice to what was built and every later slice that relies on it; the deviation is a decision only if it bounds later work. A merged slice shrinks to its heading and PR link. Review and save the same way.
