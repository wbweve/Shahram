#!/usr/bin/env bash
# Runs the package.json "test" chain via bash (npm on Windows routes scripts
# through cmd.exe, which rejects the >8191-char chain with "The command line
# is too long"). Behavior is identical: && stops at the first failing suite.
set -o pipefail
CHAIN=$(node -e "process.stdout.write(require('./package.json').scripts.test)")
eval "$CHAIN"
echo "CHAIN_EXIT=$?"
