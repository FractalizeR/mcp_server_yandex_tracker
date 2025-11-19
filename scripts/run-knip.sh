#!/usr/bin/env bash

# Run knip with workaround for vitest.workspace.ts loading issue
#
# Knip tries to load vitest.workspace.ts as a config file, but fails
# because it can't properly handle the ESM import of defineWorkspace.
# This script temporarily renames the file to avoid the issue.

set -e

# Change to project root
cd "$(dirname "$0")/.."

# Temporary backup file
BACKUP_FILE="vitest.workspace.ts.knip-backup"

# Cleanup function
cleanup() {
  if [ -f "$BACKUP_FILE" ]; then
    mv "$BACKUP_FILE" "vitest.workspace.ts"
  fi
}

# Set trap to restore file on exit
trap cleanup EXIT INT TERM

# Rename vitest.workspace.ts temporarily
if [ -f "vitest.workspace.ts" ]; then
  mv "vitest.workspace.ts" "$BACKUP_FILE"
fi

# Run knip
knip --strict

# Restore file (will happen in cleanup trap)
