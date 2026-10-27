---
name: inbox
description: Read before working through a notification inbox with the user. Use when the user wants an inbox (issue tracker, chat, email) cleared, with what needs them surfaced and the rest handled. Produces a click-to-answer board, reply drafts to approve, the answers applied, and handled notifications marked read.
---

# Inbox

Research → sort → board → answers → apply → close out. Create a todo per
stage.

The user's attention is the scarce resource. They should never have to read
a wall of text to find out why they were pinged. Every item arrives already
researched, with the decision it needs and a recommendation, and they
answer by clicking.

## Inputs

From the conversation: which inbox (an issue tracker's notifications,
chat mentions, email). If more than one source is connected and the user
named none, ask. Rules for how work is filed, labelled and commented on
belong to the workspace's documented process; follow it and don't restate
it.

## Goal

Done when:

- every unread notification is either marked read or still unread because
  it is genuinely open, and the user knows which and why
- every answer the user gave is applied in the source tool
- nothing was sent outward without approval or with a placeholder in it

## Stages

### 1. Research

Pull every unread notification. Payloads get large, so save the raw output to
a file and filter it rather than reading it inline. Group notifications by
the underlying item, then open each item: the thread, linked PRs, related
chat. Answer for each one: what is happening, why the user is involved, who
is waiting and for how long, and what changes if nobody acts.

Already resolved (merged, answered, superseded) or pure noise (reactions,
bot status changes) → mark read now, if the user asked for that.

### 2. Sort

Put every item in exactly one lane:

| Lane | Means |
|---|---|
| `decide` | Only the user can unblock it: a call, a priority, an owner |
| `hands` | No decision, but only the user can do it (they have the access, or a tool can't) |
| `agent` | You can do it end to end. Anything outbound is drafted for approval first |
| `none` | Resolved or noise, safe to mark read |

Check facts before putting an item in a lane. "Still waiting on X" has to be
confirmed in the thread, not assumed.

### 3. Board

Copy `assets/board.html` next to the user's work, fill in its `DATA` block
and nothing else, then open it for the user. The layout is fixed so the
user sees the same board every time. The comment above `DATA` lists the
fields.

The board shows one item at a time in large type, with all items listed
down the side. The user clicks an option (or presses a–d), or types their
own answer. Each answer moves on to the next item. The footer collects
every answer into one line to copy, for example `1a  2b  3: "ask sam first"`.

Writing each item:

- **headline**: what is at stake, in plain words. Never the ticket title.
- **why**: why the user is involved. This answers "why was I tagged?".
- **flow** for a chain of events (`cause → effect → effect`, the broken step
  marked `bad`); otherwise **context**, one sentence.
- **options**: two to four real choices, your recommendation first. Agent
  items can omit them and get "go / skip". So the "go" for the agent's work
  is collected on the same board.
- `id` unique per board, so answers saved in one board don't leak into
  another.

In chat, say only that the board is open and that they should paste the
answer line when done. Don't repeat the board's content.

### 4. Answers

The pasted line maps `n` + letter to `options` in `DATA`. Take free-text
answers literally: an answer may close the item, retarget it, or spawn new
work. If an answer is ambiguous, ask about that one item only. If any
answers are outbound, ask once whether to apply directly or show drafts
first.

### 5. Apply

Make the changes in the source tool: assignments, states, priorities,
labels, new tasks. Run long agent-lane work, such as code fixes or reviews,
in a background subagent.

Outbound text (replies, status updates, messages) goes out only after the
user approves it. Unless they chose to apply directly, put every draft in
one document: copy `assets/drafts.html` next to the board, fill its `DATA`
block and nothing else, then open it. Each draft names where it goes,
quotes the message it answers, and is written in the thread's language;
a state change that goes with a reply (closing the issue) rides on it as
`action`. In chat, say only that the drafts are open. The user edits in
place, marks Send or Skip, and pastes back the answer block:

- `send 1 3`: post those drafts as written in `DATA`
- `skip 5`: drop it
- `n ✎` followed by text: post that text. It is the user's wording, so
  change only what they asked you to, such as grammar.

A draft with a gap marked "to check" never reaches the document. Fill the
gap, cut it, or turn it into a direct ask of the named person, and tell the
user which you did. A draft waiting on agent work (a fix still running)
joins the document once that work reports, not as a placeholder.

After applying, set `applied` on those items in the board's `DATA` so the
board shows them as done.

### 6. Close out

Mark handled notifications read. Re-pull the inbox, because new ones arrive
while you work. Report in a few lines: what was applied, what is still
unread and why, and anything only the user can do.

## Common mistakes

| Mistake | Fix |
|---|---|
| Brief written as paragraphs or Markdown tables | The board carries the content; chat stays a few lines |
| Restyling or rebuilding the board | Fill `DATA` only; the layout is the template |
| Drafts pasted into chat or a Markdown file | Drafts go in `drafts.html`, where the user edits and approves them |
| Headline copies the ticket title | Say what breaks or who is blocked |
| Asking about something the thread already answers | Research first; options only for real decisions |
| Marking an open item read | Read only after it is applied or confirmed resolved |
