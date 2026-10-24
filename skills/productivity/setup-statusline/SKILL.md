---
name: setup-statusline
description: Install the personal Claude Code status line (`[model] folder / N% Context`) on this machine. Use when setting up a new computer, or when the user asks to set up, restore, or copy their status line.
---

Make this machine's Claude Code status line run `statusline.sh` from this skill's directory.

- The script needs `jq`. If it's missing, offer to install it.
- Copy the script to `~/.claude/statusline.sh` and make it executable. The plugin cache path changes with every update, so don't point settings at it.
- Set `statusLine` in `~/.claude/settings.json` to `{"type": "command", "command": "~/.claude/statusline.sh"}`. Keep the rest of the file as it is.
- If Vibe Island is installed (`~/.vibe-island/bin/vibe-island-statusline` exists), leave `statusLine` pointing at its script. Its header asks for custom output to go inside that file. Replace whatever sits below its "Add your status line output below" marker with the output part of `statusline.sh`, and keep its bridge block.
- If an existing status line would be replaced, show it and confirm first.

Check it by piping sample JSON into the configured command, e.g. `{"model":{"display_name":"Opus"},"workspace":{"current_dir":"/tmp/x"},"context_window":{"used_percentage":5}}` should print `[Opus] x / 5% Context`. The new line appears on the next message.
