#!/bin/bash
# PostToolUse hook for Edit|Write — auto-formats with Prettier when configured.
# Silent no-op if Prettier or its config isn't present. Designed for a Next.js +
# SCSS portfolio, so it formats js/jsx/ts/tsx/json/css/scss/md/yaml/html.

INPUT=$(cat)
# Parse the tool_input.file_path with Node (already a project prerequisite) so
# the hook has zero external dependencies — jq isn't installed by default on macOS.
FILE_PATH=$(printf '%s' "$INPUT" | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{try{const i=JSON.parse(d);process.stdout.write(i.tool_input&&i.tool_input.file_path||'')}catch{}})")

[ -z "$FILE_PATH" ] && exit 0
[ ! -f "$FILE_PATH" ] && exit 0

EXTENSION="${FILE_PATH##*.}"

# Find nearest project root (package.json or .git)
find_project_root() {
  local dir="$PWD"
  while [ "$dir" != "/" ]; do
    if [ -f "$dir/package.json" ] || [ -d "$dir/.git" ]; then
      echo "$dir"
      return
    fi
    dir=$(dirname "$dir")
  done
  echo "$PWD"
}

ROOT=$(find_project_root)

# Find local Prettier
PRETTIER_BIN=""
if [ -f "$ROOT/node_modules/prettier/bin/prettier.cjs" ]; then
  PRETTIER_BIN="$ROOT/node_modules/prettier/bin/prettier.cjs"
elif [ -x "$ROOT/node_modules/.bin/prettier" ]; then
  PRETTIER_BIN="$ROOT/node_modules/.bin/prettier"
fi

[ -z "$PRETTIER_BIN" ] && exit 0

# Look for a Prettier config (any common form) or "prettier" key in package.json
HAS_CONFIG=false
for cfg in .prettierrc .prettierrc.json .prettierrc.yml .prettierrc.yaml .prettierrc.js .prettierrc.cjs .prettierrc.mjs prettier.config.js prettier.config.cjs prettier.config.mjs; do
  if [ -f "$ROOT/$cfg" ]; then
    HAS_CONFIG=true
    break
  fi
done
if [ "$HAS_CONFIG" = false ] && [ -f "$ROOT/package.json" ] && grep -q '"prettier"' "$ROOT/package.json" 2>/dev/null; then
  HAS_CONFIG=true
fi
[ "$HAS_CONFIG" = false ] && exit 0

case "$EXTENSION" in
  js|jsx|ts|tsx|json|css|scss|md|yaml|yml|html|mjs|cjs)
    if [[ "$PRETTIER_BIN" == *.cjs ]]; then
      node "$PRETTIER_BIN" --write "$FILE_PATH" 2>/dev/null
    else
      "$PRETTIER_BIN" --write "$FILE_PATH" 2>/dev/null
    fi
    ;;
esac

exit 0
