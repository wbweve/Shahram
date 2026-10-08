"use strict";

/* ==========================================================================
   run-tests.js — Unified Test Runner for Leadership App
   
   Runs all test suites by requiring each file (tests execute at load).
   Usage: node run-tests.js [--suite name]
   ========================================================================== */

var SUITES = [
  { name: "autopilot", file: "test/ai-leadership-autopilot.test.js" },
  { name: "autopilot-edge", file: "test/ai-autopilot-edge-cases.test.js" },
  { name: "enhanced", file: "test/enhanced-ai-modules.test.js" },
  { name: "webhook-calendar", file: "test/webhook-calendar-sync.test.js" },
  { name: "tier1", file: "test/tier1-enhancements.test.js" },
  { name: "tier2", file: "test/tier2-enhancements.test.js" },
  { name: "tier3", file: "test/tier3-enhancements.test.js" },
  { name: "dev-convo-mobile", file: "test/dev-loop-convo-mobile.test.js" },
  { name: "e2e", file: "test/e2e-autopilot-pipeline.test.js" }
];

// Parse command line args
var args = process.argv.slice(2);
var filterSuite = null;
for (var i = 0; i < args.length; i++) {
  if (args[i] === "--suite" && args[i + 1]) {
    filterSuite = args[i + 1];
  }
}

var suitesToRun = filterSuite
  ? SUITES.filter(function(s) { return s.name === filterSuite; })
  : SUITES;

if (suitesToRun.length === 0) {
  console.error("No matching suite found for: " + filterSuite);
  console.error("Available suites: " + SUITES.map(function(s) { return s.name; }).join(", "));
  process.exit(1);
}

var hasError = false;

suitesToRun.forEach(function(suite) {
  try {
    require("./" + suite.file);
  } catch (e) {
    console.error("\nSUITE ERROR [" + suite.name + "]: " + e.message);
    hasError = true;
  }
});

console.log("\n" + "=".repeat(60));
if (hasError) {
  console.log("RESULT: Some suites had errors");
  process.exit(1);
} else {
  console.log("RESULT: All suites passed ✓");
}
console.log("=".repeat(60));
