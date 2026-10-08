const fs = require('fs');
const readline = require('readline');

const BREAK_LINES = [1680, 1682, 1799, 2015, 2197, 2538, 2551];

async function main() {
  const rl = readline.createInterface({
    input: fs.createReadStream(process.env.AUDIT_JSONL_PATH || './server-data/audit.jsonl'),
    crlfDelay: Infinity,
  });

  const rows = [];
  for await (const line of rl) if (line.trim()) rows.push(JSON.parse(line));

  BREAK_LINES.forEach((lineNum) => {
    const idx = lineNum - 1;
    console.log(`\n========== BREAK AT LINE ${lineNum} ==========`);
    console.log(`--- Line ${lineNum - 1} (previous) ---`);
    console.log(JSON.stringify(rows[idx - 1], null, 2));
    console.log(`--- Line ${lineNum} (BROKEN) ---`);
    console.log(JSON.stringify(rows[idx], null, 2));
    console.log(`--- Line ${lineNum + 1} (next) ---`);
    console.log(JSON.stringify(rows[idx + 1], null, 2));
  });

  const schemes = BREAK_LINES.map(n => rows[n - 1].checksumScheme || 'undefined');
  console.log(`\n\nSCHEME SUMMARY for broken lines: ${JSON.stringify(schemes)}`);

  const surroundingSchemes = BREAK_LINES.map(n => ({
    line: n,
    prevScheme: rows[n - 2]?.checksumScheme || 'undefined',
    thisScheme: rows[n - 1]?.checksumScheme || 'undefined',
    nextScheme: rows[n]?.checksumScheme || 'undefined',
  }));
  console.log('SURROUNDING SCHEME MAP:', JSON.stringify(surroundingSchemes, null, 2));
}

main();