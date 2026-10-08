#!/usr/bin/env bash
# TEMPORARY forensic tool (safe to delete): reproduces the test chain's
# pre-llm window suite-by-suite with ANOMALY_TRACE_WRITES=1, checking for a
# leaked ./db after every suite so the offending suite is named precisely.
cd "$(dirname "$0")" || exit 1
export ANOMALY_TRACE_WRITES=1
mkdir -p /tmp/redesign-keep/residue-3
TRACE_LOG="$(node -e 'console.log(require("path").join(require("os").tmpdir(),"anomaly-write-trace.log"))')"
echo "trace file: $TRACE_LOG"
: > "$TRACE_LOG"

CMDS=$(node -e '
const t = require("./package.json").scripts.test;
const parts = t.split(" && ");
const out = [];
for (const p of parts) {
  if (p.includes("llm-providers.test.js")) break;
  out.push(p);
}
console.log(out.join("\n"));
')

n=0
while IFS= read -r cmd; do
  [ -z "$cmd" ] && continue
  n=$((n+1))
  echo "=== [$n] $(date -u +%H:%M:%SZ) RUN: $cmd"
  eval "$cmd" > /tmp/redesign-keep/forensic-out.log 2>&1
  code=$?
  tail -2 /tmp/redesign-keep/forensic-out.log | sed 's/^/    /'
  if [ -d db ]; then
    echo "    >>> LEAK after: $cmd  (db/ created $(date -u +%H:%M:%SZ))"
    mv db "/tmp/redesign-keep/residue-3/db-leak-$n" 2>/dev/null || mv db "./db-leak-$n"
    echo "    >>> moved aside to residue-3/db-leak-$n"
  fi
  if [ -s "$TRACE_LOG" ]; then
    echo "    >>> TRACE ENTRIES:"
    sed 's/^/    /' "$TRACE_LOG"
  fi
done <<< "$CMDS"

echo "=== loop done. final trace:"
[ -s "$TRACE_LOG" ] && sed 's/^/  /' "$TRACE_LOG"
echo "LOOP_EXIT=0"
