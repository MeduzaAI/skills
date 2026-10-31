---
name: tdd
description: Write tests red-first for new or changed behaviour, unit or end-to-end, and judge whether existing tests actually prove what they claim. Read before writing any test, including when the seams and cases are already given, and before reviewing test quality. It is the one standard for both writing and reviewing tests.
metadata:
  inspired-by: "Matt Pocock, https://github.com/mattpocock/skills; Kent Beck, https://testdesiderata.com; Simon Willison, https://simonwillison.net/guides/agentic-engineering-patterns/red-green-tdd/"
---

Build behaviour test-first, so every test has been seen to fail for the right reason before code makes it pass.
Done means each case has a test that would fail if its behaviour broke, the suite is green, and the report shows each test's red output.

Reviewing tests instead of writing them → judge them against the same rules below, and for each finding quote the assertion and name the break it would miss.

## Where to test

Seams and cases given in the conversation (a plan, a ticket, the user) → test exactly those cases, through exactly those seams. Items marked not tested stay untested.

None given → choose the public interfaces and the cases yourself and list them before the first test. Ambiguous and a user is present → propose them in a few lines and wait.

Read the repo's testing docs and the nearest existing tests first: runner, layout, fakes, fixtures, and what the repo doesn't test. They win over any default here.

Spend tests by kind of code:

- Business logic and domain rules → unit tests, many cases, edges included.
- Orchestration and wiring → a few integration tests: the main path and the failures that matter.
- Trivial code, type-guaranteed behaviour, framework or library behaviour → no test.
- Logic tangled with I/O → separate the logic first; if that is outside the task, say so instead of testing through the tangle.

## The loop

One case at a time, never all tests first:

1. Write one test for the next case.
2. Run it and watch it fail on the assertion the case predicts. A typo, import error or missing fixture is not red yet: add the empty stub or fixture and run again. Keep the failure line for the report.
3. Write only enough code to pass it, then run the suite.
4. Refactor with the suite green, then take the next case.

A new test that passes at once is suspect: the behaviour already exists or the test checks nothing. Break the code briefly to see it fail, or fix the test.

A bug fix starts with a test that reproduces the bug. A flow's end-to-end or API regression test goes through the same loop: red at the step not yet built.

## A good test

- **Behaviour through the public interface.** It survives any refactor that keeps behaviour. Its name says what the caller gets ("rejects an expired coupon"), not how.
- **Independent oracle.** The expected value is a literal, a worked example or the spec's number, never recomputed the way the code computes it. Assert the value, not that something exists, is defined, or didn't throw.
- **Mocks only at system boundaries**: network, clock, randomness, third-party services. Prefer the repo's fakes and test databases; wrap an SDK you don't own in a thin interface and fake that. What a boundary fake received (the email sent, the quote requested) is behaviour, and fine to assert.
- **Deterministic and isolated.** Same result in any order, with no real time or shared state.

Red flags, each a test that passes with the behaviour broken or fails with it intact:

- mocks an internal collaborator, or the unit under test
- calls a private function
- asserts call counts or call order
- checks through a side channel, such as querying the database instead of reading back through the interface
- snapshot or expected value nobody checked by hand

Good and bad pairs: [references/tests.md](references/tests.md), and [references/mocking.md](references/mocking.md) for where a boundary is. Read them before reviewing, or when unsure whether a test or mock crosses a line.

## Existing tests

Never delete, skip or loosen an existing test to get green: that hides the regression it exists to catch.

A test that encodes behaviour the change deliberately replaces gets updated, and listed in the report with its reason.

## Report

Per case: the test name and its red failure line. Then tests changed and why, and any case you could not make red, with why.
