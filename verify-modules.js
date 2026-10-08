"use strict";

/* ==========================================================================
   verify-modules.js — Module Verification Script
   Ensures all production modules load without errors.
   ========================================================================== */

var MODULES = [
  "js/ai-leadership-autopilot.js",
  "js/morning-autopilot.js",
  "js/calendar-intelligence.js",
  "js/proactive-email-digest.js",
  "js/smart-delegation-recommender.js",
  "js/nlu-register-parser.js",
  "js/notification-intelligence.js",
  "js/predictive-intelligence.js",
  "js/webhook-engine.js",
  "js/calendar-sync.js",
  "js/proactive-background-monitor.js",
  "js/meeting-followup-engine.js",
  "js/smart-nudge-engine.js",
  "js/leadership-style-coach.js",
  "js/predictive-risk-radar.js",
  "js/oauth2-calendar.js",
  "js/relationship-graph.js",
  "js/energy-time-optimizer.js",
  "js/realtime-push.js",
  "js/leadership-dev-loop.js",
  "js/conversation-intelligence.js",
  "js/mobile-push-firebase.js",
  "lib/people-memory.js"
];

var ok = 0;
var fail = 0;

MODULES.forEach(function(mod) {
  try {
    require("./" + mod);
    console.log("  ✓ " + mod);
    ok++;
  } catch (e) {
    console.log("  ✗ " + mod + " — " + e.message);
    fail++;
  }
});

console.log("\n---");
console.log(ok + " loaded, " + fail + " failed");

if (fail > 0) {
  process.exit(1);
}
