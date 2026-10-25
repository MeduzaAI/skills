---
name: verify
description: Read before claiming a built change works. Use when a branch or draft PR needs its key flows walked on a running deployment and shown with evidence. Produces recorded proof per flow, regression tests for what was walked, and a QA plan for what could not be.
---

# Verify

Prove a change does what its spec asked by using it the way a user or a
client would, and show the proof so the user can see it without running
anything: a video of the flow, screenshots of a visual change, a table of
API calls with their errors. Then turn each walked flow into a regression
test, so nobody has to walk it again.

Tests passing is not proof here. `implement` already ran them; this skill
checks that the assembled change behaves as asked on a real deployment.

## Inputs

- **Consumes**: the task and its saved plan from `meduza:plan`, with the
  slice's **flows**, the branch, its worktree and its draft PR, from the
  conversation or the calling skill. Missing → ask; never guess from the
  branch name.
- **Produces**: evidence saved where the plan lives; regression tests
  committed and pushed to the PR branch; the PR body's testing section
  rewritten; a report.

| Condition | Behaviour |
|---|---|
| The slice has no flows | Write them first, in one fresh agent given the spec but not the code, so they check what was asked rather than restate what was built; save them into the plan. |
| A deployment of the PR exists (the workspace documents preview or stage deploys, or the PR shows one in its checks or comments) | Walk the flows there, once it runs the PR's head commit. |
| No deployment of the PR | Run it locally the way the repo documents. Mock a dependency that cannot run, and label every piece of evidence that relied on it ("mocked backend"). A flow walked against a mock can be Proved for this change; the real integration with what was mocked goes into the human QA plan. |
| The repo or workspace ships its own demo-recording skill, whatever it is called | Record UI videos with it; it knows the app's auth, data and gated flows. |
| The user is in the conversation | Ask before destructive steps; still broken after three rounds → show the failing flows. |
| Nobody to ask (the caller says it runs as a worker) | Destructive steps are Not walkable; still broken → return Unproved with the failing flows. |

## Goal

Done when the PR body shows, for every flow in the plan, one of:

- **Proved**: walked end to end, every step matching its expected result,
  with evidence linked and the regression test that now guards it (or
  "none: the repo does not test this kind of code");
- **Broken**: the change was reached and a step did not match; what was
  expected and what happened, with the evidence;
- **Not walkable**: the environment never got there (the app or a
  dependency would not start and could not be mocked, an auth wall, a step
  that needed approval nobody could give); it is in the human QA plan with
  exact steps and expected results.

And the generated tests pass and have been through the Tests review.

## 1. Read

The plan's Flows, the spec they came from, how the repo runs the app and
where its deployments live (`AGENTS.md`/`CLAUDE.md`, the workspace's documented
process; the built-in `run` skill for launching it locally), and the repo's
testing standards: which test layers exist and which kinds of code it does
not test.

## 2. Walk each flow

Set up the data the flow needs, perform its steps, and check each step's
expected result as you go, not only the end state. A flow's error cases are
part of it: walk them too.

| Change | Evidence |
|---|---|
| A UI flow | A video of the whole flow, one per flow; console and network errors noted. Without a recording skill, browser automation with GIF capture. |
| A static visual change | Screenshots, before and after where a before exists. |
| An API | A table per endpoint: request (method, path, the input that matters) → status and the body excerpt that matters, expected vs actual; happy path, each error, auth. |
| A job, script or internal logic with no surface | The run's log or output showing the effect, and the named tests that prove each behaviour. |

One video can cover several requirements, and should; name each file after
its flow.

Constraints:

- Confirm the deployment runs the PR's head commit before walking; evidence
  from a stale deploy proves nothing.
- On a shared environment, create only the data a flow needs and mark it as
  test data. Destructive actions on data you did not create need the user's
  approval; as a worker, mark that step Not walkable.
- No secrets, tokens or personal data in recordings, screenshots or tables.

## 3. Turn walked flows into regression tests

For each Proved flow, encode it in the test layer its plan entry names:
the repo's end-to-end framework for a UI flow, its API or integration tests
for an endpoint. Only in layers the repo already has, only for code its
standards say is tested, in its test layout and the shape of its sibling
tests. Assert the outcomes you observed, not the calls the implementation
makes. Run them against the same environment the flows were walked on, as
the repo's test config allows. Then run `meduza:code-review` with the
**Tests** axis only, the commit before your first one as the base, and the
Flows these tests encode, so it checks just what you added.

A flow with no suitable layer stays in the PR body as the repeatable QA
script it already is.

## 4. Fix and re-walk

A Broken flow or a blocking Tests finding → one fresh
fixer per repo with the findings verbatim: fix exactly those, verify with
the repo's commands, one commit in its format, push, and report any choice
beyond the finding. A fix to production code then gets the full review the
rest of the change had: `meduza:code-review` (all axes) and the built-in
correctness review on the fix commits; their blocking findings join the
next round. Once the fix is deployed (or the local app restarted), re-walk
the affected flows and rerun their tests. At most three rounds.

## 5. Save and report

Save the evidence where the plan is saved: attachments on the
issue via the workspace's tracker workflow. A repo-file spec has no issue:
save beside it, uncommitted, mark those links "local to the author" in the
table, and keep API tables and results inline so a reviewer still sees the
proof. Never commit recordings to the branch.

Rewrite the PR's testing section (the template's slot when it has one):

1. Where it ran: the deployment URL, or "local", plus anything mocked.
2. One table: flow · requirements it covers · evidence link · status ·
   regression test.
3. Human QA plan: every Not walkable flow, as steps with expected results.

Still broken after three rounds → the PR stays a draft, and the failing
flows with their evidence open the body (the template's first slot when it
has one). Status **Unproved**: the PR is open, but its flows are not.

Report: flows proved / broken / not walkable, the evidence location, the
commits pushed, fix rounds.

## Common mistakes

- Walking only the happy path → each flow's error cases are steps too.
- Calling a flow proved from test output → proof is something the user can
  watch or read without rerunning it.
- Mocked or local evidence presented as if from the deployment → label it.
- Adding a test framework the repo does not have, or tests for code its
  standards leave untested → leave the flow as a QA script.
- Tests that assert the implementation's calls → assert what the user or
  client observed.
- Recording before the deploy picked up the latest push → check the commit.
