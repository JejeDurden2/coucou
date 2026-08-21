#!/usr/bin/env bash
# PostToolUse hook (Edit|Write): when a frontend file with motion is touched,
# remind Claude to run the transitions.dev skill's `transitions refine` on it.
# ponytail: grep heuristic, no parser. Tighten the pattern if it fires too often.
FRONTEND_DIR=""   # "" = whole repo is frontend
f=$(jq -r '.tool_input.file_path // empty')
[ -n "$f" ] && [ -f "$f" ] || exit 0
case "$f" in *.tsx|*.jsx|*.ts|*.css|*.scss|*.vue|*.svelte) ;; *) exit 0 ;; esac
[ -z "$FRONTEND_DIR" ] || case "$f" in *"/$FRONTEND_DIR/"*) ;; *) exit 0 ;; esac
grep -qiE 'transition|animat|@keyframes|duration|ease|motion' "$f" || exit 0
jq -n --arg f "$f" '{hookSpecificOutput:{hookEventName:"PostToolUse",additionalContext:("Motion code touched in " + $f + ". Apply the transitions-dev skill (~/.claude/skills/transitions-dev/SKILL.md): run `transitions refine` on this file. Reference the motion tokens (--duration-*, --ease-*, --distance-*, --scale-*, --blur-*) instead of hardcoded durations/easings/distances, match on usage per the skill doctrine, keep open/close asymmetry, and use the verbatim t-* snippets for new modals, dropdowns, accordions, toasts. Leave values with no matching token usage untouched. Keep the diff small.")}}'
