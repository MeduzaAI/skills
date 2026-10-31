---
name: plan
description: Read before deciding how to build an issue or a spec. Use when the user wants to agree on what gets built, in which slices and how each is tested, before any code is written. Produces an approved plan sized to the change, and its slices.
metadata:
  inspired-by: "Dex Horthy and HumanLayer, https://github.com/humanlayer/advanced-context-engineering-for-coding-agents/blob/main/wsff.md"
---

Agree with the user what gets built, in which slices, and how each slice is tested, before any code exists. A decision made here costs a question; the same decision in PR review costs a rewrite.

Each slice is built by a fresh worker that reads only the saved plan and has nobody to ask. Write down everything it would otherwise guess, and nothing it wouldn't.

Size the plan, and the research behind it, to the change. A one-slice bug fix is a paragraph, the file it touches and its `Cases`, with no tables or slice headings. A project gets diagrams, contracts and tables in `meduza:show-me` shapes. Leave out whatever doesn't apply.

**Consumes** an issue or spec named in the conversation or by the caller; missing → ask. **Produces** the approved `plan.md`, saved where the issue or spec lives: a document on the issue or project, or beside a repo-file spec, uncommitted.

## 1. Facts

Research in parallel with `meduza:research`: the code the change touches and its patterns, each third-party API per its docs, and the standards of every repo involved (`AGENTS.md`/`CLAUDE.md`, path rules, testing docs). Every external contract a slice relies on goes in the plan with its primary source, never "confirm during build".

## 2. Decisions

List what the spec leaves open that would change behaviour, then the technical choices the codebase doesn't already settle. A documented convention is not a question; follow it.

Ask in rounds with a question tool or plain text: up to four questions whose prerequisites are settled, recommended answer first with its reason. An answer that changes the spec is written back to the spec once the user agrees.

Settle every decision here, test choices that are judgement calls included, so the review page shows choices already made.

## 3. Slices

A slice is one repo, one PR, cut by behaviour, not by layer:

- **Demonstrable on its own**: an endpoint, a screen, an admin action, or logic proved by its tests.
- **Tracer bullet first**: the thinnest path end to end, so the first review shows the design working. Across repos, the contract slice comes first and the tracer follows it in each repo.
- **Small enough** for one review sitting and one fresh worker; a piece with no behaviour of its own joins the slice that first uses it.
- **Prefactor first**: behaviour-neutral groundwork the reviewer should see apart (a migration, a refactor) is its own slice ahead of the tracer. What must land together stays together.

A stack is a chain of dependent slices in one repo, 1 to 5 PRs, never branching off another stack. A dependency across repos is a merge-order edge, not a stack.

## 4. Tests

Agree each slice's tests with the user from the spec, before any code, under these exact headings, which implement and code-review point at:

- `Seams`: the public interfaces the slice is tested through, one line each on what it catches.
- `Cases`: behaviour with concrete input and expected output.
- `Not tested`, when it matters: what, and why (trivial, covered by types, covered by a flow).
- `Flows`, for any user-visible or cross-service path: end-to-end steps with expected results, and the error cases. They become e2e or API tests, written red first like the cases.

```markdown
**Cases**
- `POST /session` with an expired token → 401, no session row written.
- Two refreshes with the same token → the second gets 409.
```

"Test token validation" is not a case. Place each test in the layer the repo's testing docs give it, and list nothing those docs say not to test.

## 5. Write and review

Write `plan.md`: what and why in a sentence or two, then what applies of:

- **Decisions**: a table, each row opening with its id (`D1`) and giving the reason.
- **Facts**: each contract with its source.
- **Architecture**, when components, contracts, data or states change: a sequence diagram plus one line per component on what it owns; each endpoint's method, path, request and response; changed tables and query shapes; a state diagram with every transition.
- **Slices**: a heading per slice opening with its id (`### S1 Tracer: …`), kept stable across rounds, a new slice taking the next free number; what it delivers; a file-tree diff with each file's responsibility, a call-tree diff for control-flow changes, and the signatures a worker might get wrong; then its tests.
- **Stacks**, when there is more than one slice.

Keep `plan.md` in a working folder for this issue, uncommitted. Build the review page beside it with `cat <this skill's dir>/assets/review.html plan.md > plan.html` and open it; if you can't, give the user its path. The shell renders the Markdown and Mermaid and adds a comment box per heading and table row; never read it. In chat, say only that the plan is open and to paste the copied feedback.

The feedback is lines like `S1: split the migration out`, or `approve` alone. Change `plan.md` to meet each comment, or answer it if it asks something; one that reopens a decision without settling it goes back to step 2; either way, redraw what rests on that decision. Anything but `approve` → rebuild the page for another round.

After approval, a fresh subagent checks the plan against the spec and the standards for anything a worker would have to guess. Put any change it makes through the same review, then save.

## Revise

When the user accepts code that differs from its slice, or asks for a change, update `plan.md` (gone → start from the saved plan): that slice to what was built, every later slice that relies on it, and the deviation as a new decision. Review and save it the same way. A slice is never built against a plan the code already contradicts.
