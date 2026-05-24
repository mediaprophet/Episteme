#!/bin/bash
# Sets up AI rules for popular IDEs by symlinking the master rules directory

echo "Setting up AI rules for Cursor and Windsurf..."

# Target master directory
RULES_DIR="./.agents/rules"

# IDE Rule Directories
CURSOR_RULES_DIR="./.cursor/rules"
WINDSURF_RULES_DIR="./.windsurf/rules"

# Create IDE directories if they don't exist
mkdir -p "$CURSOR_RULES_DIR"
mkdir -p "$WINDSURF_RULES_DIR"

# Symlink all .md files as .mdc for Cursor
for file in "$RULES_DIR"/*.md; do
  if [ -f "$file" ]; then
    filename=$(basename "$file" .md)
    # Cursor uses .mdc extension
    ln -sf "../../$file" "$CURSOR_RULES_DIR/$filename.mdc"
    echo "Symlinked $filename.mdc for Cursor"
    
    # Windsurf can use .md
    ln -sf "../../$file" "$WINDSURF_RULES_DIR/$filename.md"
    echo "Symlinked $filename.md for Windsurf"
  fi
done

echo "Done! IDE rules configured."
