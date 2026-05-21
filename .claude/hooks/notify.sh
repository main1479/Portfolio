#!/bin/bash
# Notification hook — native OS notification when Claude needs input.
# macOS-first (matches the user's setup), with Linux / WSL fallbacks.

INPUT=$(cat 2>/dev/null)
MESSAGE="Claude Code needs your attention"
if command -v jq >/dev/null 2>&1 && [ -n "$INPUT" ]; then
  MSG=$(echo "$INPUT" | jq -r '.message // empty' 2>/dev/null)
  [ -n "$MSG" ] && MESSAGE="$MSG"
fi
TITLE="Claude Code — Portfolio"

if command -v osascript >/dev/null 2>&1; then
  # Escape double quotes in the message for AppleScript
  SAFE_MESSAGE=$(printf '%s' "$MESSAGE" | sed 's/"/\\"/g')
  osascript -e "display notification \"$SAFE_MESSAGE\" with title \"$TITLE\" sound name \"Submarine\"" 2>/dev/null
  exit 0
fi

if command -v notify-send >/dev/null 2>&1; then
  notify-send "$TITLE" "$MESSAGE" 2>/dev/null
  exit 0
fi

if command -v powershell.exe >/dev/null 2>&1; then
  powershell.exe -Command "[System.Reflection.Assembly]::LoadWithPartialName('System.Windows.Forms') | Out-Null; \$n = New-Object System.Windows.Forms.NotifyIcon; \$n.Icon = [System.Drawing.SystemIcons]::Information; \$n.Visible = \$true; \$n.ShowBalloonTip(5000, '$TITLE', '$MESSAGE', 'Info')" 2>/dev/null
  exit 0
fi

exit 0
