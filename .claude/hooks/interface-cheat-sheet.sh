#!/usr/bin/env bash
# PostToolUse hook (Edit|Write): grep the touched frontend file for the mechanical
# interface-cheat-sheet violations and hand them back to Claude to fix.
# Rules: ~/.agents/skills/interface-cheat-sheet/SKILL.md (Review procedure).
# ponytail: line-level grep heuristics, no parser. Add a rule here only if it is greppable.
f=$(jq -r '.tool_input.file_path // empty')
[ -n "$f" ] && [ -f "$f" ] || exit 0
case "$f" in
  *.tsx|*.jsx|*.ts|*.css|*.scss|*.html|*.vue|*.svelte) ;;
  */messages/*.json|*/locales/*.json|*/i18n/*.json) ;;
  *) exit 0 ;;
esac
case "$f" in *node_modules/*|*/dist/*|*/.next/*|*/build/*|*/infra/skills/*) exit 0 ;; esac

hits=""
add() { [ -n "$1" ] && hits="$hits$1"$'\n'; }

add "$(grep -nE 'transition-all|transition:[[:space:]]*all' "$f" | sed 's/^/transition-all, name the properties that change: /')"
if grep -qE 'outline-none|outline:[[:space:]]*none' "$f" && ! grep -q 'focus-visible' "$f"; then
  add "$(grep -nE 'outline-none|outline:[[:space:]]*none' "$f" | sed 's/^/outline removed with no focus-visible replacement: /')"
fi
add "$(grep -nE 'tabIndex=\{?[1-9]|tabindex="[1-9]' "$f" | sed 's/^/positive tabindex breaks tab order, use 0 or -1: /')"
add "$(grep -nE '\.(ttf|otf)["'"'"')]' "$f" | sed 's/^/use .woff2 on the web: /')"
add "$(grep -nE '<(div|span)[^>]*onClick' "$f" | grep -vE 'role=|aria-hidden' | sed 's/^/clickable div\/span, use <button type="button"> or <a>: /')"
add "$(awk '/<input/{blk="";inb=1} inb{blk=blk $0; if(/>/){inb=0; if(blk ~ /type="(email|tel|number|url|search)"/ && blk !~ /inputMode|inputmode/) print NR": input without inputMode"}}' "$f" | sed 's/^/add the matching inputMode: /')"
case "$(basename "$f")" in
  globals.css|global.css|index.css|app.css|styles.css|layout.tsx) ;;
  *) add "$(grep -nE 'font-smoothing|antialiased' "$f" | sed 's/^/font smoothing belongs on the root once, not per component: /')" ;;
esac
add "$(grep -niE 'click here|cliquez ici' "$f" | sed 's/^/link text must describe the destination: /')"

[ -n "$hits" ] || exit 0
n=$(printf '%s' "$hits" | grep -c .)
jq -n --arg f "$f" --arg n "$n" --arg hits "$hits" '{hookSpecificOutput:{hookEventName:"PostToolUse",additionalContext:("interface-cheat-sheet: " + $n + " issue(s) in " + $f + " (line: rule: source)\n" + $hits + "Fix them now per ~/.agents/skills/interface-cheat-sheet/SKILL.md (House overrides + Review procedure), keep the diff small. If a hit is a deliberate exception, say so in one line and move on.")}}'
