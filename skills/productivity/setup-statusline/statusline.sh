#!/bin/bash
# Claude Code status line: [model] folder / N% Context, dimmed.
# Receives the session JSON from Claude Code on stdin. Needs jq.
input=$(cat)

model=$(echo "$input" | jq -r '.model.display_name')
cwd=$(basename "$(echo "$input" | jq -r '.workspace.current_dir')")
used=$(echo "$input" | jq -r '.context_window.used_percentage // empty')

DIM='\033[2m'
RESET='\033[0m'

if [ -n "$used" ]; then
  ctx=$(printf '%.0f' "$used")
  printf "${DIM}[%s] %s / %s%% Context${RESET}" "$model" "$cwd" "$ctx"
else
  printf "${DIM}[%s] %s${RESET}" "$model" "$cwd"
fi
