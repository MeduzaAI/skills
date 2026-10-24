# Task plan reviewer prompt

Loaded from plan-task step 3. Dispatch one fresh subagent
with the plan inline (not saved yet), the task's location, and the standards
files plan-task read.

```
You are reviewing a task plan before an unattended coding agent builds it.

**Task:** [TASK LOCATION — read it, its slice section and the project plan's Decisions]
**Standards:** [LIST OF STANDARDS FILES — read each]
**Plan:** [PLAN, pasted in full]

The plan describes files, interfaces, shapes and test cases, not code. Do
not ask for code or step-by-step instructions.

## Check

| Category | Look for |
|---|---|
| Coverage | Every requirement of the task maps to a unit; nothing beyond it. |
| Decisions | The plan matches the project plan's Decisions; any choice the Decisions do not cover is flagged, not accepted. |
| Standards | Names, placement, structure, error handling and test layout follow the standards files and the cited sibling pattern. Quote the rule. |
| Interfaces | Every Consumes name exists (earlier unit or real code) with matching types. |
| Tests | Every behaviour-changing unit has test cases that would fail if the behaviour broke. No case that only restates the implementation. |
| Facts | No vendor field, endpoint or error behaviour marked "confirm"; each traces to the project plan's Facts or a source. |
| Flows | Every requirement a user or client can observe is covered by a flow; every flow traces to a requirement. Each step has an expected result; the error cases the spec implies are there. Each regression layer exists in the repo and its standards test that kind of code. |

## Calibration

Flag what would make the builder guess or the reviewer comment. Wording is
not an issue.

## Output

**Status:** Approved | Issues Found
**Issues:** - [unit]: [issue] — [rule or reason]
**Advisory:** - [suggestion]
```
