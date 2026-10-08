/**
 * finalChainCheck.js — outputs ONE line. No interpretation allowed.
 */
const fs = require('fs');
const readline = require('readline');
const crypto = require('crypto');

function legacyChecksum(previous, entry) {
  return crypto.createHash("sha256").update([
    previous || "GENESIS", entry.ts, entry.action, entry.detail, entry.id
  ].join("|")).digest("hex");
}
function fullChecksum(previous, entry) {
  const value = { ...entry };
  delete value.checksum;
  return crypto.createHash("sha256").update([
    previous || "AUDIT-GENESIS", JSON.stringify(value)
  ].join("|")).digest("hex");
}

async function main() {
  const rl = readline.createInterface({
    input: fs.createReadStream(process.env.AUDIT_JSONL_PATH || './server-data/audit.jsonl'),
    crlfDelay: Infinity,
  });
  const rows = [];
  for await (const line of rl) if (line.trim()) rows.push(JSON.parse(line));

  let prev = "";
  const breaks = [];
  rows.forEach((entry, i) => {
    const fn = entry.checksumScheme === "full" ? fullChecksum : legacyChecksum;
    if (fn(prev, entry) !== entry.checksum) breaks.push(i + 1);
    prev = entry.checksum;
  });

  console.log(breaks.length === 0
    ? `CHAIN_VERIFIED: PASS (0 breaks across ${rows.length} records)`
    : `CHAIN_VERIFIED: FAIL (${breaks.length} breaks at lines: ${breaks.join(',')})`);
}
main();
