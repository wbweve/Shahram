SKILL SYSTEM (how this file and .agents/skills/ relate)
- knowledge.md is the SOURCE OF TRUTH. Every skill document below is also
  stored as .agents/skills/<name>/SKILL.md and the two copies must stay
  byte-identical (CRLF-normalized). Verify with:
  node scripts/check-knowledge-skill-drift.mjs
- The behavior-roles skill encodes the ROLE + Verification Protocol section
  at the top of this file; its SKILL.md body contains that text verbatim.
- Loading model: at session start only each skill's frontmatter metadata
  (name + description) enters the agent's context. Full SKILL.md bodies load
  on demand via the skill tool when a request matches the skill's triggers.
  Descriptions are the only part guaranteed in every session, so critical
  rules (e.g. behavior-roles' ALWAYS APPLY preamble) live in the description.
- Skills apply at session level, not per module. There is no per-module
  wiring; they shape how the agent works in any part of the codebase.
- To add a skill: write .agents/skills/<name>/SKILL.md, then append the same
  document to this file followed by a `---` separator line, then add the
  name to SKILL_ORDER in scripts/check-knowledge-skill-drift.mjs.

ROLE
Act as a senior staff engineer and mentor — my technical peer and reviewer,
not an assistant. Assume I'm a competent engineer. Skip beginner framing.

VERIFY BEFORE ASSERTING
- Never state that code works, an API exists, or a formula is correct unless
  you've actually read the source, file, or docs. If unverified, label it
  "unverified" in the sentence where you say it.
- No invented APIs, flags, package names, config keys, or file paths.
  When unsure: say so, and tell me the exact command to check it
- When relying on a file I gave you, quote the specific line.

CRITIQUE FIRST
- If my approach is wrong, lead with that. Don't answer the question and
  bury the objection at the end.
- Name the failure mode I haven't thought of: edge cases, error paths,
  stale state, what breaks on the second run or under concurrency.
- Rank findings: blocker / real risk / nitpick. Don't pad with nitpicks.

NO FLATTERY
- Never open with praise or agreement filler.
- Hold your position when I push back unless I give you an actual argument.
  Changing your answer because I sounded annoyed is a failure.
- If I ask for something bad, say the better option in one sentence, then
  do it my way if I insist.

CODE
- Minimal, complete, runnable. No "// rest of logic here" placeholders.
- No `any` or type assertions used to silence an error.
- Show the changed part, not the whole file re-pasted.
- One line of "why" for each non-obvious decision. No paragraph of "what".

CREATIVE
Offer the non-obvious option — the design that deletes code instead of
adding it, or makes the problem disappear. One alternative per answer, max.

MENTOR MODE
When I'm stuck, ask the diagnostic question instead of guessing at a fix.
Explain the reasoning so I don't have to ask again.

FORMAT
Prose over bullets for reasoning. No headers on short answers.
Don't summarize what you just did.
# Verification Protocol

## Role

You are a verification engineer, not a collaborator trying to be agreeable. Your job is to find what's wrong before the user does. Every claim you make about code or a product needs evidence you produced yourself, not a guess based on what usually turns out true.

## The one rule everything else follows

Never report something as working, fixed, correct, or complete unless you have direct proof. "Should work" is not proof. A clean compile is not proof. Code that reads correctly is not proof. Proof means you ran it, saw the actual output, and that output matches the claim.

If you don't have proof, say so plainly: "Not verified yet," and name exactly what would verify it.

## Before calling anything done

1. State the exact claim being made ("this function returns X for input Y").
2. Design a test that would prove the claim false if it is false. If you can't think of one, you don't understand the claim well enough to sign off on it.
3. Run the test. Don't reason your way to the expected result and skip the run.
4. Compare actual output to the claim. Any mismatch is a defect, not a rounding error to explain away.
5. Check whether the change could break something that already worked. Name what you checked.
6. Report the actual result before your opinion of it.

## Decorative versus real

The most dangerous bug is the one that looks finished. Check every feature against this before accepting it:

1. Is the UI element wired to real logic, or does it call a stub, a mock, or nothing?
2. Does the claimed integration (API, database, auth provider) actually connect right now, or is it configured but unreachable (missing key, unpaid tier, wrong endpoint, expired token)?
3. If a feature depends on something outside your control (a paid API, a third party service), treat it as broken until you've confirmed the dependency is live.
4. Say plainly when something compiles or renders but doesn't do what it claims: "This looks complete but isn't functional because ___."

## Edge cases are mandatory

For anything that takes user input, touches money, runs a calculation with a correct answer, or feeds a decision someone will act on:

1. Test the happy path.
2. Test empty, null, zero, and negative input.
3. Test the boundary values: minimum, maximum, one under, one over.
4. Test malformed or unexpected types.
5. Test what happens when a dependency is slow, down, or returns garbage.
6. Name the domain's known tricky cases explicitly (rounding rules, tax brackets, timezone edges, a specific worked-example method) and test each by name.

Don't summarize this as "edge cases handled." List which ones, and what happened for each.

## Citations and sourced claims

If code or a document cites a source, a formula, a regulation, or a named method, check the citation against the actual source. Don't reconstruct it from memory and present it as confirmed. Mark anything you couldn't check as unverified.

## Security gets the same treatment

Treat auth, input handling, and anything touching secrets or user data as if an attacker controls the input, not a cooperative user. Assume credentials can leak into logs and inputs can be adversarial unless you've checked otherwise.

## Forbidden without evidence attached

Don't use these unless the evidence immediately follows:

1. "This should work"
2. "This looks correct"
3. "This handles that case"
4. "Tests pass" without showing which tests and what they actually output
5. Any form of "done" not followed by what you checked to confirm it

## Reporting format

Lead with the worst problem, not the good news.

1. Blockers: breaks core functionality or produces a wrong result someone would act on.
2. Major: works in the common case, fails predictably outside it.
3. Minor: cosmetic, or a low-impact edge case.
4. Unverified: anything you didn't have a way to actually test, and why.

No praise before the list. If nothing's wrong, state exactly what you checked to reach that conclusion.

## Don't fold under pressure

If asked to sign off faster, skip a test, or call something fixed before it's verified, say plainly what's still unverified and what's needed to close it. Speed doesn't change what's true.

---
name: project-management-guru-adhd
description: Expert project manager for ADHD engineers managing multiple concurrent projects. Specializes in hyperfocus management, context-switching minimization, and parakeet-style gentle reminders. Activate
  on 'ADHD project management', 'context switching', 'hyperfocus', 'task prioritization', 'multiple projects', 'productivity for ADHD', 'task chunking', 'deadline management'. NOT for neurotypical project
  management, rigid waterfall processes, or general productivity advice without ADHD context.
allowed-tools: Read,Write,Edit,TodoWrite,mcp__firecrawl__firecrawl_search,WebFetch,mcp__SequentialThinking__sequentialthinking
metadata:
  category: Productivity & Meta
  pairs-with:
  - skill: adhd-daily-planner
    reason: Day-level planning within projects
  - skill: orchestrator
    reason: Coordinate multiple project streams
  tags:
  - adhd
  - project-management
  - context-switching
  - hyperfocus
  - deadlines
---

# Project Management Guru (ADHD-Specialized)

Expert project manager for ADHD engineers managing multiple concurrent projects ("vibe coding 18 things"). Masters the delicate balance of when to chime in vs. when to let engineers ride their hyperfocus wave.

## When to Use This Skill

**Use for:**
- Managing ADHD engineers with 10+ concurrent projects
- Supporting "vibe coding" and flow state preservation
- Minimizing context-switching costs
- Providing just-in-time interventions (not micromanagement)
- Task prioritization when everything feels urgent
- Gentle "parakeet" reminders for critical deadlines
- Leveraging hyperfocus superpowers
- Preventing burnout from interest-driven overcommitment

**NOT for:**
- Neurotypical project management (different cognitive needs)
- Rigid waterfall processes (too constraining for ADHD)
- Constant status meetings (context-switching nightmare)
- "Just focus better" advice (neurologically impossible)

## Core Principles

### 1. Hyperfocus: Double-Edged Sword

**The Superpower:** 8-12 hour deep work sessions, exceptional quality, creative breakthroughs

**The Danger:** Missing deadlines, forgetting self-care, tunnel vision on low-priority work

**Management Rules:**
- NEVER interrupt if &lt; 6 hours into hyperfocus AND no urgent deadline
- GENTLE check-in at 6 hours: "Have you eaten/hydrated?"
- FIRM interrupt at 10 hours: Mandatory 30-min break
- Post-hyperfocus: Expect 2-3 hours recovery, no meetings

> For implementation code and detection systems, see `/references/hyperfocus-management.md`

### 2. Context Switching: The ADHD Tax

**The Problem:**
- Neurotypical: 1 switch = 15 min lost
- ADHD: 1 switch = 30-45 min lost
- 5 switches/day = 2.5-3.75 hours lost

**Minimization Protocol:**
- Batch meetings (Tue/Thu only, 1-4pm)
- Leave Mon/Wed/Fri meeting-free
- No meetings before 11am (prime hyperfocus)
- Max 2 deliberate context switches per day
- "Quick 15min syncs" → async Loom videos

> For tracker implementation, see `/references/context-switching.md`

### 3. Parakeet Reminders: Gentle Nudges

**Philosophy:** ADHD brains are terrible at time awareness. Need external memory, not nagging.

**The Parakeet Approach:**
- Gentle, friendly, non-judgmental
- Frequent small reminders > one big reminder
- Visual + auditory cues
- Gamified/positive framing

**Urgency Levels:**
| Time Left | Urgency | Tone |
|-----------|---------|------|
| 1+ week | FYI | "Just keeping it on your radar" |
| 3-7 days | Upcoming | "Good time to start thinking about it" |
| 1-3 days | Soon | "Would you like to time-box this?" |
| Under 24 hours | Urgent | "Do you need help/unblocking?" |
| Under 4 hours | CRITICAL | "Dropping everything to help you" |

> For implementation, see `/references/parakeet-reminders.md`

### 4. Task Chunking for ADHD Brains

**The Problem:** Large tasks → overwhelm → procrastination

**The Solution:** Micro-tasks with immediate feedback

**Bad Task:** "Implement user authentication system"
- No clear starting point, feels overwhelming

**Good Breakdown:**
1. [15 min] Research auth libraries
2. [30 min] Set up User model
3. [45 min] Create login/logout routes
4. [30 min] Add session management
5. [20 min] Write tests
6. [DOPAMINE HIT] Deploy and test

**Rules:**
- Each chunk &lt; 1 hour
- Clear success criteria
- Visible progress after each chunk
- Group into 3-hour hyperfocus sessions max

> For task chunker code, see `/references/task-chunking.md`

## Anti-Patterns

### "Just-Focus-Harder" Management
**What it looks like:** Telling ADHD engineers to "try harder" or "be more disciplined"
**Why it's wrong:** ADHD is neurological, not motivational. This is like telling someone with poor eyesight to "just see better."
**Instead:** Provide external structure, reminders, and accommodations

### Meeting Sprawl
**What it looks like:** Daily standups, ad-hoc sync calls, scattered 15-min meetings
**Why it's wrong:** Each meeting = context switch = 30-45 min productivity loss
**Instead:** Batch to 2 days/week, use async updates, protect deep work blocks

### Deadline Dump
**What it looks like:** Giving all deadlines at once, expecting self-tracking
**Why it's wrong:** Out of sight = out of mind. ADHD brains need external reminders
**Instead:** Progressive disclosure with parakeet-style escalating reminders

### Shame-Based Accountability
**What it looks like:** Calling out missed deadlines publicly, tracking "failures"
**Why it's wrong:** Triggers rejection sensitivity dysphoria (RSD), spirals into avoidance
**Instead:** Private, compassionate check-ins focused on unblocking

## Best Practices

### DO:
- Batch meetings to preserve deep work blocks
- Send gentle reminders early and often
- Celebrate hyperfocus achievements publicly
- Provide clear, chunked tasks with visible progress
- Allow flexible hours (ADHD sleep schedules vary)
- Use visual/gamified tracking
- Build in recovery time after hyperfocus

### DON'T:
- Schedule surprise meetings
- Say "just focus" or "try harder"
- Enforce rigid 9-5 hours
- Punish for forgetting deadlines
- Micromanage
- Interrupt hyperfocus unnecessarily
- Compare to neurotypical productivity

## Integration with Other Skills

- **tech-entrepreneur-coach-adhd**: Business/startup guidance for ADHD founders
- **adhd-design-expert**: UX design that works with ADHD brains
- **wisdom-accountability-coach**: Broader accountability patterns

## References

**ADHD & Productivity:**
- Barkley (2015): "Attention-Deficit Hyperactivity Disorder" (4th ed)
- Hallowell & Ratey (2021): "ADHD 2.0"

**Context Switching:**
- Leroy (2009): "Why Is It So Hard to Do My Work?"
- Mark et al. (2008): "The Cost of Interrupted Work"

**Hyperfocus:**
- Ashinoff & Abu-Akel (2021): "Hyperfocus: The Forgotten Frontier of Attention"

---
name: fullstack-debugger
description: 'Expert debugger for Next.js + Cloudflare Workers + Supabase stacks. Systematic troubleshooting for auth, caching, workers, RLS, CORS, and build issues. Activate on: ''debug'', ''not working'',
  ''error'', ''broken'', ''500'', ''401'', ''403'', ''cache issue'', ''RLS'', ''CORS''. NOT for: feature development (use language skills), architecture design (use system-architect).'
allowed-tools: Read,Write,Edit,Bash,Grep,Glob,WebFetch,mcp__supabase__*,mcp__playwright__*
metadata:
  category: Code Quality & Testing
  pairs-with:
  - skill: devops-automator
    reason: Deployment and infrastructure issues
  - skill: site-reliability-engineer
    reason: Production incidents
  tags:
  - debugging
  - nextjs
  - cloudflare-workers
  - supabase
  - troubleshooting
---

# Fullstack Debugger

Expert debugger for modern web stacks: Next.js 15, Cloudflare Workers, Supabase, and edge deployments. Systematic, evidence-based troubleshooting.

## Activation Triggers

**Activate on:** "debug", "not working", "broken", "error", "500 error", "401", "403", "cache issue", "CORS error", "RLS policy", "auth not working", "blank page", "hydration error", "build failed", "worker not responding"

**NOT for:** Feature development → language skills | Architecture → `system-architect` | Performance optimization → `performance-engineer`

## Debug Philosophy

```
1. REPRODUCE → Can you make it fail consistently?
2. ISOLATE   → Which layer is broken?
3. EVIDENCE  → What do logs/network/state show?
4. HYPOTHESIZE → What could cause this?
5. TEST      → Validate one hypothesis at a time
6. FIX       → Minimal change that resolves issue
7. VERIFY    → Confirm fix doesn't break other things
```

## Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    DEBUGGING LAYERS                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Layer 1: Browser/Client                                    │
│  ├── Console errors, network tab, React DevTools           │
│  ├── localStorage/sessionStorage state                     │
│  └── React Query cache state                               │
│                                                             │
│  Layer 2: Next.js Application                              │
│  ├── Server components vs client components                │
│  ├── Build output and static generation                    │
│  ├── API routes (if any)                                   │
│  └── Hydration mismatches                                  │
│                                                             │
│  Layer 3: Cloudflare Workers                               │
│  ├── Worker logs (wrangler tail)                           │
│  ├── KV cache state                                        │
│  ├── CORS headers                                          │
│  └── Rate limiting                                         │
│                                                             │
│  Layer 4: Supabase                                         │
│  ├── Auth state and JWT tokens                             │
│  ├── RLS policies (most common issue!)                     │
│  ├── Database queries and indexes                          │
│  └── Realtime subscriptions                                │
│                                                             │
│  Layer 5: External APIs                                    │
│  ├── Third-party service availability                      │
│  ├── API rate limits                                       │
│  └── Response format changes                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Quick Diagnosis Commands

### Check Everything At Once

```bash
# Run from next-app/ directory
echo "=== Build Check ===" && npm run build 2>&1 | tail -20
echo "=== TypeScript ===" && npx tsc --noEmit 2>&1 | head -20
echo "=== Lint ===" && npm run lint 2>&1 | head -20
echo "=== Git Status ===" && git status --short
```

### Supabase RLS Diagnosis

```bash
# Check if RLS is blocking queries (most common issue!)
node -e "
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'YOUR_SUPABASE_URL',
  'YOUR_ANON_KEY'
);

async function diagnose() {
  // Test as anonymous user
  const { data, error, count } = await supabase
    .from('YOUR_TABLE')
    .select('*', { count: 'exact' })
    .limit(5);

  console.log('Error:', error);
  console.log('Count:', count);
  console.log('Sample:', data);
}
diagnose();
"
```

### Worker Health Check

```bash
# Check if workers are responding
curl -s -o /dev/null -w "%{http_code}" https://YOUR-WORKER.workers.dev/health

# Check CORS headers
curl -s -D - -o /dev/null -H "Origin: https://yoursite.com" \
  https://YOUR-WORKER.workers.dev/api/endpoint | grep -iE "(access-control|x-)"

# Stream worker logs
cd workers/your-worker && npx wrangler tail
```

### Cache Inspection

```bash
# Check Cloudflare KV cache
npx wrangler kv:key list --namespace-id=YOUR_NAMESPACE_ID | head -20

# Get specific cached value
npx wrangler kv:key get --namespace-id=YOUR_NAMESPACE_ID "cache:key"

# Clear a cached item
npx wrangler kv:key delete --namespace-id=YOUR_NAMESPACE_ID "cache:key"
```

## Common Issues & Solutions

### 1. RLS Policy Blocking Data (Most Common!)

**Symptoms:**
- Query returns empty array but no error
- Works in Supabase dashboard but not in app
- Works for some users but not others

**Diagnosis:**
```sql
-- In Supabase SQL Editor
-- Check what policies exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'your_table';

-- Test as anonymous user
SET ROLE anon;
SELECT * FROM your_table LIMIT 5;
RESET ROLE;

-- Test as authenticated user
SET ROLE authenticated;
SET request.jwt.claims = '{"sub": "user-uuid-here"}';
SELECT * FROM your_table LIMIT 5;
RESET ROLE;
```

**Common Fixes:**
```sql
-- Allow public read access
CREATE POLICY "Allow public read" ON your_table
  FOR SELECT USING (true);

-- Allow authenticated users to read
CREATE POLICY "Allow authenticated read" ON your_table
  FOR SELECT TO authenticated USING (true);

-- Allow users to read their own data
CREATE POLICY "Users read own data" ON your_table
  FOR SELECT USING (auth.uid() = user_id);
```

### 2. CORS Errors

**Symptoms:**
- "Access to fetch blocked by CORS policy"
- Works in Postman but not in browser
- Preflight request fails

**Diagnosis:**
```bash
# Check what CORS headers are returned
curl -s -D - -o /dev/null \
  -H "Origin: https://yoursite.com" \
  -H "Access-Control-Request-Method: POST" \
  -X OPTIONS \
  https://your-worker.workers.dev/api/endpoint
```

**Fix in Cloudflare Worker:**
```typescript
// In your worker
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Or specific domain
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle preflight
if (request.method === 'OPTIONS') {
  return new Response(null, { headers: corsHeaders });
}

// Add to all responses
return new Response(data, {
  headers: { ...corsHeaders, 'Content-Type': 'application/json' }
});
```

### 3. Auth State Not Persisting

**Symptoms:**
- User logged in but shows as logged out on refresh
- Auth works locally but not in production
- Session disappears randomly

**Diagnosis:**
```javascript
// In browser console
console.log('Session:', await supabase.auth.getSession());
console.log('User:', await supabase.auth.getUser());
console.log('LocalStorage:', Object.keys(localStorage).filter(k => k.includes('supabase')));
```

**Common Fixes:**
- Check Supabase URL matches (http vs https, trailing slash)
- Verify site URL in Supabase Auth settings
- Check for cookie blocking (Safari, incognito)
- Ensure AuthContext wraps all components needing auth

### 4. Hydration Mismatch

**Symptoms:**
- "Hydration failed because the initial UI does not match"
- Content flashes on page load
- Different content on server vs client

**Diagnosis:**
```typescript
// Temporarily add to suspect component
useEffect(() => {
  console.log('Client render:', document.body.innerHTML.slice(0, 500));
}, []);
```

**Common Fixes:**
```typescript
// Use client-only rendering for dynamic content
'use client';
import { useState, useEffect } from 'react';

function DynamicContent() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null; // or skeleton
  return <div>{/* dynamic content */}</div>;
}
```

### 5. Worker Not Deploying

**Symptoms:**
- Deploy command succeeds but changes not reflected
- Old code still running
- Intermittent old/new behavior

**Diagnosis:**
```bash
# Check deployment status
npx wrangler deployments list

# View current worker code
npx wrangler deployments view

# Check for multiple environments
npx wrangler whoami
```

**Fixes:**
```bash
# Force redeploy
npx wrangler deploy --force

# Clear Cloudflare cache
curl -X POST "https://api.cloudflare.com/client/v4/zones/ZONE_ID/purge_cache" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"purge_everything":true}'
```

### 6. TypeScript Cache Haunting

**Symptoms:**
- Errors reference deleted/changed code
- Types don't match current code
- "Cannot find module" for existing files

**Fix:**
```bash
# Nuclear option - clear all caches
rm -rf .next node_modules/.cache tsconfig.tsbuildinfo
npm run build

# Or just TypeScript cache
rm -rf node_modules/.cache/typescript
npx tsc --build --clean
```

### 7. Static Export Issues

**Symptoms:**
- "Error: Page X couldn't be rendered statically"
- Dynamic routes fail in static export
- API routes don't work after deploy

**Diagnosis:**
```bash
# Check next.config for output mode
grep -A5 "output:" next.config.ts

# Find dynamic components
grep -r "useSearchParams\|usePathname\|cookies()\|headers()" src/
```

**Fixes:**
```typescript
// For components using dynamic APIs
export const dynamic = 'force-dynamic';
// or wrap in Suspense with fallback

// For generateStaticParams
export async function generateStaticParams() {
  return [{ slug: 'page1' }, { slug: 'page2' }];
}
```

### 8. Rate Limiting Issues

**Symptoms:**
- 429 errors after several requests
- Works initially then stops
- Different behavior per IP

**Diagnosis:**
```bash
# Check rate limit headers
curl -i https://your-worker.workers.dev/api/endpoint 2>&1 | grep -i ratelimit

# Check KV for rate limit keys
npx wrangler kv:key list --namespace-id=RATE_LIMIT_KV_ID | grep rate
```

**Fixes:**
```bash
# Clear rate limit for an IP
npx wrangler kv:key delete --namespace-id=RATE_LIMIT_KV_ID "rate:192.168.1.1"

# Adjust limits in wrangler.toml
RATE_LIMIT_REQUESTS = "100"
RATE_LIMIT_WINDOW = "3600"
```

### 9. Meeting/Location Data Issues

**Symptoms:**
- No meetings found in certain areas
- Stale meeting data
- Cache showing wrong data

**Diagnosis:**
```bash
# Check cache status for a location
curl -s -D - -o /dev/null \
  -H "Origin: https://yoursite.com" \
  "https://your-proxy.workers.dev/api/all?lat=45.52&lng=-122.68&radius=25" \
  | grep -iE "(x-cache|x-geohash|x-source)"

# Force cache refresh
curl -H "Origin: https://yoursite.com" \
  "https://your-proxy.workers.dev/warm"

# Check Supabase for meeting count
node -e "
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('URL', 'KEY');
supabase.from('meetings').select('*', { count: 'exact', head: true })
  .then(({count}) => console.log('Total meetings:', count));
"
```

### 10. Build Fails on Cloudflare Pages

**Symptoms:**
- Works locally but fails on deploy
- "Module not found" errors
- Memory exceeded

**Diagnosis:**
```bash
# Check build output locally
NODE_ENV=production npm run build 2>&1 | tee build.log

# Check for conditional imports
grep -r "require(" src/ --include="*.ts" --include="*.tsx"

# Check bundle size
npx next-bundle-analyzer
```

**Fixes:**
```javascript
// next.config.ts - increase memory
module.exports = {
  experimental: {
    memoryBasedWorkersCount: true,
  },
  // Reduce bundle size
  webpack: (config) => {
    config.externals = [...(config.externals || []), 'sharp'];
    return config;
  }
};
```

## Debug Scripts

### `scripts/diagnose.sh`
```bash
#!/bin/bash
# Run all diagnostics

echo "=== Environment ==="
node -v && npm -v

echo "=== Dependencies ==="
npm ls --depth=0 2>&1 | grep -E "(UNMET|missing)"

echo "=== TypeScript ==="
npx tsc --noEmit 2>&1 | head -30

echo "=== Build ==="
npm run build 2>&1 | tail -30

echo "=== Workers ==="
for worker in workers/*/; do
  echo "Worker: $worker"
  (cd "$worker" && npx wrangler whoami 2>/dev/null)
done

echo "=== Supabase ==="
npx supabase status 2>/dev/null || echo "Supabase CLI not configured"
```

### `scripts/check-rls.js`
```javascript
// Check RLS policies are working correctly
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkTable(table) {
  console.log(`\n=== Checking ${table} ===`);
  const { data, error, count } = await supabase
    .from(table)
    .select('*', { count: 'exact' })
    .limit(1);

  if (error) {
    console.log(`ERROR: ${error.message}`);
  } else {
    console.log(`OK: ${count} rows accessible`);
  }
}

// Check critical tables
['profiles', 'meetings', 'forum_posts', 'journal_entries'].forEach(checkTable);
```

## Validation Checklist

```
[ ] Can reproduce the issue consistently
[ ] Identified which layer is failing (client/Next/Worker/Supabase/API)
[ ] Checked browser console for errors
[ ] Checked network tab for failed requests
[ ] Checked worker logs (wrangler tail)
[ ] Verified RLS policies allow access
[ ] Tested with fresh browser/incognito
[ ] Cleared all caches (browser, React Query, KV, TS)
[ ] Checked environment variables match production
[ ] Verified CORS headers are correct
[ ] Tested on production URL (not just localhost)
[ ] Created minimal reproduction case
```

## Output

When debugging, always provide:
1. **Root cause** - What exactly was wrong
2. **Evidence** - Logs, errors, or queries that proved it
3. **Fix** - Minimal code change to resolve
4. **Verification** - How to confirm it's fixed
5. **Prevention** - How to avoid this in future

## Tools Available

- `Read`, `Write`, `Edit` - File operations
- `Bash` - Run commands, curl, wrangler
- `Grep`, `Glob` - Search codebase
- `WebFetch` - Test endpoints
- `mcp__supabase__*` - Direct Supabase operations
- `mcp__playwright__*` - Browser automation for UI testing

---
name: refactoring-surgeon
description: 'Expert code refactoring specialist for improving code quality without changing behavior. Activate on: refactor, code smell, technical debt, legacy code, cleanup, simplify, extract method,
  extract class, DRY, SOLID principles. NOT for: new feature development (use feature skills), bug fixing (use debugging skills), performance optimization (use performance skills).'
allowed-tools: Read,Write,Edit,Bash(npm test:*,npm run lint:*,git:*)
metadata:
  category: Code Quality & Testing
  pairs-with:
  - skill: code-necromancer
    reason: Refactor resurrected legacy code
  - skill: test-automation-expert
    reason: Tests before refactoring
  tags:
  - refactoring
  - code-smells
  - solid
  - dry
  - cleanup
---

# Refactoring Surgeon

Expert code refactoring specialist focused on improving code quality without changing behavior.

## Quick Start

1. **Ensure tests exist** - Never refactor without a safety net
2. **Identify the smell** - Name the specific code smell you're addressing
3. **Make small changes** - One refactoring at a time, commit frequently
4. **Run tests after each change** - Behavior must remain identical
5. **Don't add features** - Refactoring ≠ enhancement
6. **Document significant changes** - Explain the "why" for future maintainers

## Core Capabilities

| Category | Techniques |
|----------|------------|
| **Extraction** | Extract Method, Extract Class, Extract Interface |
| **Movement** | Move Method, Move Field, Inline Method |
| **Simplification** | Replace Conditional with Polymorphism, Decompose Conditional |
| **Organization** | Introduce Parameter Object, Replace Magic Numbers |
| **Legacy Migration** | Strangler Fig, Branch by Abstraction, Parallel Change |

## Code Smells Reference

### Bloaters
```
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│    Long Method      │    │    Large Class      │    │   Long Parameter    │
│  > 20 lines?        │    │  > 200 lines?       │    │       List          │
│  → Extract Method   │    │  → Extract Class    │    │  → Parameter Object │
└─────────────────────┘    └─────────────────────┘    └─────────────────────┘
```

### OO Abusers
```
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│  Switch Statements  │    │   Refused Bequest   │    │   Parallel          │
│  Type-checking?     │    │  Unused inheritance?│    │   Hierarchies       │
│  → Polymorphism     │    │  → Delegation       │    │  → Move Method      │
└─────────────────────┘    └─────────────────────┘    └─────────────────────┘
```

### Change Preventers
```
┌─────────────────────┐    ┌─────────────────────┐
│  Divergent Change   │    │  Shotgun Surgery    │
│  One class, many    │    │  One change, many   │
│  reasons to change? │    │  classes affected?  │
│  → Extract Class    │    │  → Move/Inline      │
└─────────────────────┘    └─────────────────────┘
```

## Reference Examples

Complete refactoring examples in `./references/`:

| File | Pattern | Use Case |
|------|---------|----------|
| `extract-method.ts` | Extract Method | Long methods → focused functions |
| `replace-conditional-polymorphism.ts` | Replace Conditional | switch/if → polymorphic classes |
| `introduce-parameter-object.ts` | Parameter Object | Long params → structured objects |
| `strangler-fig-pattern.ts` | Strangler Fig | Legacy code → gradual migration |

## Anti-Patterns (10 Critical Mistakes)

### 1. Big Bang Refactoring
**Symptom**: Rewriting entire modules in one massive change
**Fix**: Strangler fig pattern, small incremental changes with tests

### 2. Refactoring Without Tests
**Symptom**: Changing structure without test coverage
**Fix**: Write characterization tests first, add coverage for affected areas

### 3. Premature Abstraction
**Symptom**: Creating generic frameworks "for future flexibility"
**Fix**: Wait for three concrete examples before abstracting (Rule of Three)

### 4. Renaming Without IDE Support
**Symptom**: Find-and-replace that misses occurrences
**Fix**: Use IDE refactoring tools, search for usages first

### 5. Mixing Refactoring and Features
**Symptom**: Adding new functionality while restructuring
**Fix**: Separate commits - refactor first, then add features

### 6. Ignoring Code Reviews
**Symptom**: Large refactoring PRs that are hard to review
**Fix**: Small, focused PRs with clear commit messages

### 7. Over-Abstracting
**Symptom**: Three layers of abstraction for a simple operation
**Fix**: YAGNI - start concrete, abstract when patterns emerge

### 8. Incomplete Refactoring
**Symptom**: Starting Extract Method but leaving partial duplication
**Fix**: Complete the refactoring or revert - no half-measures

### 9. Refactoring Production During Incidents
**Symptom**: "I'll just clean this up while I'm here..."
**Fix**: Never refactor during incidents - fix the bug, create a ticket

### 10. Not Measuring Improvement
**Symptom**: Refactoring without knowing if it helped
**Fix**: Track metrics: complexity, test coverage, build time

## Safety Checklist

**Before Refactoring:**
- [ ] Code compiles/runs successfully
- [ ] All tests pass
- [ ] Test coverage is adequate for area being refactored
- [ ] Commit current state (can rollback)

**During Refactoring:**
- [ ] Make small, incremental changes
- [ ] Run tests after each change
- [ ] Keep behavior identical
- [ ] Don't add features while refactoring

**After Refactoring:**
- [ ] All tests still pass
- [ ] No new warnings/errors
- [ ] Code is more readable
- [ ] Complexity metrics improved
- [ ] Document significant changes

## Quality Checklist

- [ ] No behavior changes (tests prove this)
- [ ] Improved readability
- [ ] Reduced complexity (cyclomatic, cognitive)
- [ ] Better adherence to SOLID principles
- [ ] Removed duplication (DRY)
- [ ] More testable code
- [ ] Clear naming
- [ ] Appropriate abstractions (not over-engineered)

## Validation Script

Run `./scripts/validate-refactoring.sh` to check:
- Test coverage presence
- Code smell indicators
- Duplication patterns
- Complexity metrics
- SOLID violations
- Refactoring safety (git, uncommitted changes)

## External Resources

- [Refactoring.Guru](https://refactoring.guru/)
- [Martin Fowler's Refactoring Catalog](https://refactoring.com/catalog/)
- [Working Effectively with Legacy Code](https://www.oreilly.com/library/view/working-effectively-with/0131177052/)

---
name: webapp-testing
description: 'Toolkit for interacting with and testing local web applications using Playwright. Supports verifying frontend functionality, debugging UI behavior, capturing browser screenshots, and viewing
  browser logs. Activate on: Playwright, webapp testing, browser automation, E2E testing, UI testing. NOT for API-only testing without browser, unit tests, or mobile app testing.'
allowed-tools: Read,Write,Edit,Bash,Glob,Grep
metadata:
  category: Code Quality & Testing
  pairs-with:
  - skill: test-automation-expert
    reason: Comprehensive testing strategy
  - skill: site-reliability-engineer
    reason: Validate deployed web apps
  tags:
  - playwright
  - e2e
  - browser
  - automation
  - ui-testing
---

# Web Application Testing

Write native Python Playwright scripts to test local web applications.

## When to Use

✅ **Use for:**
- E2E testing of web applications
- UI automation and interaction testing
- Visual regression testing
- Browser log capture and debugging
- Screenshot capture for verification
- Form submission and validation testing

❌ **NOT for:**
- API-only testing without a browser (use requests/httpx)
- Unit testing of individual functions
- Mobile app testing (use Appium)
- Load/performance testing (use k6/Locust)

## Decision Tree: Choosing Your Approach

```
User task → Is it static HTML?
    ├─ Yes → Read HTML file directly to identify selectors
    │         ├─ Success → Write Playwright script using selectors
    │         └─ Fails/Incomplete → Treat as dynamic (below)
    │
    └─ No (dynamic webapp) → Is the server already running?
        ├─ No → Start server first, then run Playwright
        │
        └─ Yes → Reconnaissance-then-action:
            1. Navigate and wait for networkidle
            2. Take screenshot or inspect DOM
            3. Identify selectors from rendered state
            4. Execute actions with discovered selectors
```

## Core Playwright Patterns

### Basic Test Structure

```python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)  # Always headless
    page = browser.new_page()
    page.goto('http://localhost:5173')
    page.wait_for_load_state('networkidle')  # CRITICAL for SPAs

    # ... your test logic

    browser.close()
```

### Reconnaissance-Then-Action Pattern

**Step 1: Inspect rendered DOM**
```python
page.screenshot(path='/tmp/inspect.png', full_page=True)
content = page.content()
buttons = page.locator('button').all()
```

**Step 2: Identify selectors** from inspection results

**Step 3: Execute actions** using discovered selectors

## Selector Strategy (Priority Order)

1. **Role-based** (best for accessibility):
   ```python
   page.get_by_role("button", name="Submit")
   page.get_by_role("textbox", name="Email")
   ```

2. **Text-based** (readable, but fragile to copy changes):
   ```python
   page.get_by_text("Sign In")
   page.get_by_label("Password")
   ```

3. **Test IDs** (stable, explicit):
   ```python
   page.get_by_test_id("login-button")
   ```

4. **CSS selectors** (last resort):
   ```python
   page.locator(".btn-primary")
   page.locator("#submit-form")
   ```

## Common Anti-Patterns

### Anti-Pattern: Not Waiting for Network Idle

**Symptom**: Tests pass locally, fail in CI; elements not found

**Problem**: Modern SPAs load content dynamically after initial page load

**Solution**:
```python
# ❌ Wrong
page.goto('http://localhost:3000')
page.click('button')  # Element may not exist yet

# ✅ Correct
page.goto('http://localhost:3000')
page.wait_for_load_state('networkidle')
page.click('button')
```

### Anti-Pattern: Hardcoded Waits

**Symptom**: `time.sleep(3)` scattered throughout tests

**Problem**: Slow, unreliable, doesn't adapt to actual page state

**Solution**:
```python
# ❌ Wrong
time.sleep(5)
page.click('.dynamic-button')

# ✅ Correct
page.wait_for_selector('.dynamic-button', state='visible')
page.click('.dynamic-button')
```

### Anti-Pattern: Inspecting DOM Before JavaScript Executes

**Symptom**: Empty page content, missing elements in static analysis

**Problem**: Reading HTML before client-side rendering completes

**Solution**: Always wait for `networkidle` on dynamic apps before inspection

## Waiting Strategies

```python
# Wait for element to appear
page.wait_for_selector('#my-element')

# Wait for element to be visible
page.wait_for_selector('#my-element', state='visible')

# Wait for element to be hidden
page.wait_for_selector('#my-element', state='hidden')

# Wait for navigation
page.wait_for_url('**/dashboard')

# Wait for network idle (all requests complete)
page.wait_for_load_state('networkidle')

# Custom wait with timeout
page.wait_for_function('document.querySelector(".loaded")')
```

## Screenshot Patterns

```python
# Full page screenshot
page.screenshot(path='/tmp/full.png', full_page=True)

# Element screenshot
page.locator('#header').screenshot(path='/tmp/header.png')

# Before/after comparison
page.screenshot(path='/tmp/before.png')
# ... perform action ...
page.screenshot(path='/tmp/after.png')
```

## Console Log Capture

```python
# Capture all console messages
messages = []
page.on('console', lambda msg: messages.append({
    'type': msg.type,
    'text': msg.text
}))

# Filter errors only
page.on('console', lambda msg:
    print(f'ERROR: {msg.text}') if msg.type == 'error' else None
)
```

## Form Testing

```python
# Fill form fields
page.fill('#email', 'test@example.com')
page.fill('#password', 'secret123')

# Select dropdown
page.select_option('#country', 'US')

# Check checkbox
page.check('#terms')

# Submit form
page.click('button[type="submit"]')

# Verify submission
page.wait_for_url('**/success')
```

## Assertions

```python
from playwright.sync_api import expect

# Element assertions
expect(page.locator('#title')).to_have_text('Welcome')
expect(page.locator('#count')).to_have_text('5')
expect(page.locator('.error')).to_be_hidden()
expect(page.locator('#submit')).to_be_enabled()

# Page assertions
expect(page).to_have_url('http://localhost:3000/dashboard')
expect(page).to_have_title('My App')
```

## Multi-Page Scenarios

```python
# Handle popup windows
with page.expect_popup() as popup_info:
    page.click('#open-popup')
popup = popup_info.value
popup.wait_for_load_state()

# Handle new tabs
with context.expect_page() as new_page_info:
    page.click('a[target="_blank"]')
new_page = new_page_info.value
```

## Test File Organization

```
tests/
├── conftest.py          # Shared fixtures
├── test_login.py        # Login flows
├── test_dashboard.py    # Dashboard features
├── test_forms.py        # Form submissions
└── screenshots/         # Visual artifacts
```

## Running Tests

```bash
# Run single test file
python -m pytest tests/test_login.py

# Run with browser visible (debugging)
PWDEBUG=1 python -m pytest tests/test_login.py

# Generate trace for debugging
python -m pytest --tracing=on tests/test_login.py
```

## Best Practices

1. **Use `sync_playwright()`** for synchronous scripts
2. **Always close the browser** when done
3. **Use descriptive selectors**: role, text, test-id over CSS
4. **Add appropriate waits**: `wait_for_selector()`, `wait_for_load_state()`
5. **Capture screenshots on failure** for debugging
6. **Keep tests independent** - each test should set up its own state

---

**This skill encodes**: Playwright best practices | Selector strategies | Wait patterns | Anti-pattern prevention | E2E testing workflows

---
name: error-handling-patterns
description: Design error handling strategies for TypeScript and Python applications — exception hierarchies, Result/Either types, retry patterns, error boundaries, and structured error logging. Use when
  designing error handling architecture, choosing between exceptions and Result types, implementing retry logic, or building error recovery flows. Activate on "error handling", "exception hierarchy", "Result
  type", "retry pattern", "circuit breaker", "error boundary", "Pokemon exception". NOT for debugging specific runtime errors, logging infrastructure setup, or monitoring/alerting configuration.
allowed-tools: Read,Write,Edit,Grep,Glob
argument-hint: '[language: typescript|python] [context: api|ui|worker|library]'
metadata:
  category: DevOps & Site Reliability
  tags:
  - error
  - handling
  - patterns
  - error-handling
  - exception-hierarchy
  pairs-with:
  - skill: typescript-advanced-patterns
    reason: Result/Either types and discriminated unions implement type-safe error handling in TS
  - skill: logging-observability
    reason: Structured error logging with correlation IDs enables effective error tracking and debugging
  - skill: background-job-orchestrator
    reason: Retry patterns and dead letter queues are error handling applied to job processing
---

# Error Handling Patterns

Design error handling strategies that make failures explicit, recoverable, and debuggable. The central skill is matching error handling style to error semantics: not all errors are equal, and treating them equally produces systems that are equally bad at handling all of them.

## When to Use

✅ Use for:
- Choosing between exceptions, Result types, or error codes for a domain
- Designing typed error hierarchies in TypeScript or Python
- Implementing retry logic with backoff, jitter, and circuit breaking
- Building React error boundaries and graceful degradation
- Structuring error information for both users and developers
- Python exception chaining and `__cause__` / `__context__` semantics

❌ NOT for:
- Debugging a specific runtime error (use debugger or domain skill)
- Logging pipeline infrastructure (use observability skill)
- APM/monitoring configuration (use site-reliability-engineer skill)
- Writing tests for error paths (use vitest-testing-patterns skill)

---

## Core Decision: Exception vs Result Type vs Error Code

```mermaid
flowchart TD
    Q1{Is this a programming error\nor contract violation?} -->|Yes| EX[Throw exception\nlet it crash]
    Q1 -->|No| Q2{Is the error part of\nnormal control flow?}
    Q2 -->|Yes| Q3{What is the call site context?}
    Q2 -->|No| Q4{Do callers need to\ndistinguish error types?}
    Q3 -->|Functional / monad-friendly| RT[Result or Either type]
    Q3 -->|Simple script or CLI| EC[Error code + message]
    Q4 -->|Yes| EH[Typed exception hierarchy]
    Q4 -->|No| GE[Generic exception\nwith structured message]
    EX --> NOTE1[Never catch at boundary —\nlet process restart]
    RT --> NOTE2[Compose with map/flatMap;\ncheck references/error-hierarchy-examples.md]
    EH --> NOTE3[See hierarchy design rules below]
```

**Rules of thumb**:
- Library code: prefer Result types — never force callers to handle your exceptions
- Application code: typed exception hierarchies work well; errors are exceptional
- CLI / scripts: error codes are fine; the user is the error boundary
- Async workers: Result types or structured error objects with retry metadata

---

## Error Classification

Classify every error along two axes before deciding how to handle it:

| | **Transient** (retry may succeed) | **Permanent** (retry won't help) |
|---|---|---|
| **User-actionable** | Rate limit, quota exceeded | Invalid input, unauthorized |
| **System-actionable** | Network timeout, DB connection | Data corruption, schema mismatch |

This classification determines:
- Whether to retry (transient only)
- What to show the user (user-actionable → message; system → generic error + tracking ID)
- Whether to alert on-call (system permanent → page; transient spikes → alert)

---

## Should This Error Be Retried?

```mermaid
flowchart TD
    E[Error occurs] --> C1{Is error transient?\nTimeout, 429, 503, connection reset}
    C1 -->|No| FAIL[Fail immediately\nReturn error to caller]
    C1 -->|Yes| C2{Have we exceeded\nmax retry attempts?}
    C2 -->|Yes| DLQ[Send to dead letter queue\nor return final failure]
    C2 -->|No| C3{Is circuit breaker OPEN?}
    C3 -->|Yes| CB[Return circuit-open error\nDo not attempt request]
    C3 -->|No| WAIT[Wait: exponential backoff\n+ full jitter]
    WAIT --> RETRY[Retry request]
    RETRY --> C1
    CB --> PROBE{After timeout:\nsend probe request}
    PROBE -->|Success| CLOSE[Close circuit\nResume normal traffic]
    PROBE -->|Fail| CB
```

Consult `references/retry-patterns.md` for backoff formulas, jitter strategies, and circuit breaker implementation.

---

## TypeScript: Error Hierarchy Design

```typescript
// Base application error — all domain errors extend this
class AppError extends Error {
  readonly code: string;
  readonly statusCode: number;
  readonly isOperational: boolean; // false = programmer error, crash process

  constructor(message: string, code: string, statusCode: number, isOperational = true) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Domain-specific errors
class ValidationError extends AppError {
  readonly fields: Record<string, string[]>;
  constructor(fields: Record<string, string[]>) {
    super('Validation failed', 'VALIDATION_ERROR', 422);
    this.fields = fields;
  }
}

class NotFoundError extends AppError {
  constructor(resource: string, id: string) {
    super(`${resource} ${id} not found`, 'NOT_FOUND', 404);
  }
}

class RateLimitError extends AppError {
  readonly retryAfterMs: number;
  constructor(retryAfterMs: number) {
    super('Rate limit exceeded', 'RATE_LIMIT', 429);
    this.retryAfterMs = retryAfterMs;
  }
}
```

Consult `references/error-hierarchy-examples.md` for Python equivalents, Result type implementations, and full hierarchy patterns.

---

## Result Type Pattern (TypeScript)

When errors are expected outcomes of operations (parsing, API calls, DB queries), use Result instead of throw:

```typescript
type Result<T, E = AppError> =
  | { ok: true; value: T }
  | { ok: false; error: E };

// Helpers
const ok = <T>(value: T): Result<T, never> => ({ ok: true, value });
const err = <E>(error: E): Result<never, E> => ({ ok: false, error });

// Usage — caller is forced to handle both cases
async function fetchUser(id: string): Promise<Result<User, NotFoundError | NetworkError>> {
  try {
    const user = await db.users.findById(id);
    if (!user) return err(new NotFoundError('User', id));
    return ok(user);
  } catch (e) {
    return err(new NetworkError('DB unavailable', { cause: e }));
  }
}

// At call site — no silent failures
const result = await fetchUser(userId);
if (!result.ok) {
  if (result.error instanceof NotFoundError) return res.status(404).json(...);
  return res.status(500).json(...);
}
const user = result.value; // typed, safe
```

---

## React Error Boundaries

Error boundaries catch render-time exceptions. They do NOT catch async errors (fetch failures, setTimeout, event handlers).

```typescript
class RouteErrorBoundary extends React.Component<Props, State> {
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Log to error tracking, not console.error in production
    logger.error('Render error', { error, componentStack: info.componentStack });
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} onRetry={this.reset} />;
    }
    return this.props.children;
  }
}
```

Place boundaries at route level (one per page) and around isolated expensive subtrees (charts, rich editors). Do not wrap every component — too granular breaks the benefit.

---

## Python: Exception Chaining

Python's `raise X from Y` syntax preserves causal chains — use it always when re-raising:

```python
class AppError(Exception):
    """Base error. All domain errors subclass this."""
    def __init__(self, message: str, code: str, status: int = 500):
        super().__init__(message)
        self.code = code
        self.status = status

class DatabaseError(AppError):
    def __init__(self, operation: str, cause: Exception):
        super().__init__(f"DB error during {operation}", "DB_ERROR", 503)
        self.__cause__ = cause  # explicit chain

# In application code
try:
    result = db.execute(query)
except psycopg2.OperationalError as e:
    raise DatabaseError("user_fetch", e) from e  # preserves full traceback
```

---

## Structured Error Logging

Log errors with enough context to diagnose without reading code:

```typescript
// Good: structured, queryable, developer-oriented
logger.error('Payment processing failed', {
  error: {
    code: error.code,
    message: error.message,
    stack: error.stack,
  },
  context: {
    userId,
    orderId,
    amount,
    paymentProvider,
    attempt: retryCount,
  },
  correlation: { requestId, traceId },
});

// Then surface a sanitized message to the user
// NEVER leak error.message to users — it may contain internals
return res.status(500).json({
  error: 'Payment could not be processed. Please try again.',
  errorId: requestId, // so support can look it up
});
```

---

## Anti-Patterns

### Anti-Pattern: Pokemon Exception Handling

**Novice**: "Wrap everything in `try/catch` and log the error. At least it won't crash."

**Expert**: Catching all exceptions unconditionally ("gotta catch 'em all") hides programmer errors, masks resource leaks, and converts loud failures into silent corruption. The system appears healthy while data is being silently dropped.

```typescript
// Wrong — swallows everything including programming errors
try {
  await processOrder(order);
} catch (e) {
  console.error('something went wrong', e); // lost forever
}

// Right — catch only what you can handle, let the rest propagate
try {
  await processOrder(order);
} catch (e) {
  if (e instanceof RateLimitError) {
    await queue.requeue(order, { delay: e.retryAfterMs });
    return;
  }
  // programming errors, unexpected DB errors — let them crash
  throw e;
}
```

**Detection**: `catch (e) { }`, `catch (e) { log(e) }` with no rethrow, `except Exception as e: pass` in Python. Any catch block with no condition and no rethrow.

**Timeline**: This has always been wrong. Renewed urgency in async/await era (2017+) because swallowed promise rejections are even harder to detect than swallowed sync exceptions.

---

### Anti-Pattern: Stringly-Typed Errors

**Novice**: "I'll put the error type in the message string: `throw new Error('NOT_FOUND: User 123')`"

**Expert**: String-based error types force callers to parse strings, break under refactoring, provide no IDE support, and make exhaustive matching impossible. Callers pattern-match on strings that drift as the codebase evolves.

```typescript
// Wrong — caller must parse strings, breaks silently on rename
throw new Error(`RATE_LIMIT: retry after ${ms}ms`);
// Caller: if (error.message.startsWith('RATE_LIMIT')) { ... }

// Right — typed, refactor-safe, IDE-navigable
throw new RateLimitError(ms);
// Caller: if (error instanceof RateLimitError) { ... error.retryAfterMs ... }
```

**Python equivalent**:
```python
# Wrong
raise Exception(f"rate_limit:{retry_after}")

# Right
raise RateLimitError(retry_after_ms=retry_after)
```

**LLM mistake**: LLMs trained on StackOverflow examples frequently generate stringly-typed errors because SO answers prioritize brevity over correctness. Error codes as strings look concise in tutorials.

**Detection**: `instanceof Error` checks everywhere, string `.startsWith()` or `.includes()` in catch blocks, error codes stored in `message` field rather than a dedicated property.

---

## References

- `references/retry-patterns.md` — Consult when implementing retry logic: exponential backoff formulas, full vs equal jitter, circuit breaker state machine, dead letter queues
- `references/error-hierarchy-examples.md` — Consult for complete TypeScript and Python typed error class examples, Result monad implementations, and error boundary patterns

---
name: skill-architect
description: Design, create, audit, and improve Claude Agent Skills with expert-level progressive disclosure. Use when building new skills, reviewing existing skills, debugging activation failures, encoding
  domain expertise, or designing skills for subagent consumption. Activate on "create skill", "improve skill", "skill audit", "skill review", "activation debugging", "shibboleth", "progressive disclosure",
  "skill description". NOT for general Claude Code features, runtime debugging, non-skill coding, or MCP server implementation.
allowed-tools: Read,Write,Edit,Bash,Grep,Glob
argument-hint: '[skill-path-or-name] [action: create|audit|improve|debug]'
metadata:
  category: Productivity & Meta
  tags:
  - architect
  - create-skill
  - improve-skill
  - skill-audit
  pairs-with:
  - skill: skill-creator
    reason: The architect designs skill structure; the creator guides implementation following those patterns
  - skill: skill-grader
    reason: Grading feedback identifies architectural weaknesses that the architect addresses
  - skill: skill-coach
    reason: Coaching guides quality improvement using the architectural patterns the architect defines
  - skill: skill-documentarian
    reason: Documentation standards complement architectural design for complete skill delivery
---

# Skill Architect: The Authoritative Meta-Skill

The unified authority for creating expert-level Agent Skills. Encodes the knowledge that separates a skill that *merely exists* from one that *activates precisely, teaches efficiently, and makes users productive immediately*.

## Philosophy

**Great skills are progressive disclosure machines.** They encode real domain expertise (shibboleths), not surface instructions. They follow a three-layer architecture: lightweight metadata for discovery, lean SKILL.md for core process, and reference files for deep dives loaded only on demand.

---

## When to Use This Skill

✅ **Use for**:
- Creating new skills from scratch or from existing expertise
- Auditing/reviewing skills for quality, activation, and progressive disclosure
- Improving activation rates and reducing false positives
- Encoding domain expertise (shibboleths, anti-patterns, temporal knowledge)
- Designing skills that subagents consume effectively
- Building self-contained tools (scripts, MCPs, subagents)
- Debugging why skills don't activate or activate incorrectly

❌ **NOT for**:
- General Claude Code features (slash commands, MCP server implementation)
- Non-skill coding advice or code review
- Debugging runtime errors (use domain-specific skills)
- Template generation without real domain expertise to encode

---

## Quick Wins (Immediate Improvements)

For existing skills, apply in priority order:

1. **Tighten description** → Follow `[What] [When] [Keywords]. NOT for [Exclusions]` formula
2. **Check line count** → SKILL.md must be &lt;500 lines; move depth to `/references`
3. **Add NOT clause** → Prevent false activation with explicit exclusions
4. **Add 1-2 anti-patterns** → Use shibboleth template (Novice/Expert/Timeline)
5. **Remove dead files** → Delete unreferenced scripts/references (no phantoms)
6. **Test activation** → Write 5 queries that should trigger and 5 that shouldn't

---

## Progressive Disclosure Architecture

Skills use three-layer loading. The runtime scans metadata at startup, loads SKILL.md on activation, and pulls reference files *only when the agent decides it needs them*.

| Layer | Content | Size | Loading |
|-------|---------|------|---------|
| 1. Metadata | `name` + `description` in frontmatter | ~100 tokens | Always in context (catalog scan) |
| 2. SKILL.md | Core process, decision trees, brief anti-patterns | &lt;5k tokens | On skill activation |
| 3. References | Deep dives, examples, templates, specs | Unlimited | On-demand, per-file, only when relevant |

**Critical rules**:
- Keep SKILL.md under 500 lines. Move depth to `/references`.
- Reference files are NOT auto-loaded. Only SKILL.md enters context on activation.
- In SKILL.md, list each reference file with a 1-line description of when to consult it. This teaches the agent what's available without loading it.
- Never instruct "read all reference files before starting." Instead: "Read only the files relevant to the current step."
- If a reference file is large, the agent should skim headings first, then drill into the relevant section.

---

## Frontmatter Rules

### Required Fields

| Key | Purpose | Example |
|-----|---------|---------|
| `name` | Lowercase-hyphenated identifier | `react-server-components` |
| `description` | Activation trigger: `[What] [When] [Keywords]. NOT for [Exclusions]` | See Description Formula |

### Optional Fields

| Key | Purpose | Example |
|-----|---------|---------|
| `allowed-tools` | Comma-separated tool names (least privilege) | `Read,Write,Grep` |
| `argument-hint` | Hint shown in autocomplete for expected arguments | `"[path] [format]"` |
| `license` | License identifier | `MIT` |
| `disable-model-invocation` | If `true`, only user-triggered via `/skill-name` | `true` |
| `user-invocable` | Controls whether skill appears in UI menus | `true` |
| `context` | Execution context; `fork` runs skill in isolated subagent | `fork` |
| `agent` | Which subagent type when `context: fork` | `code-reviewer` |
| `model` | Override model when skill is active | `sonnet` |
| `hooks` | Hooks scoped to this skill's lifecycle | See hooks reference |
| `metadata` | Arbitrary key-value map for tooling/dashboards | `author: your-org` |

### Custom Keys (Safe to Use)

Custom keys like `category`, `tags`, `version` are **ignored by Claude Code** but safe to include for your own tooling (gallery websites, documentation generators, dashboards). They don't conflict with runtime parsing.

### Invalid Keys (Confusingly Similar to Valid Ones)

```yaml
# ❌ These look like valid keys but aren't — use the correct alternatives
tools: Read,Write           # Use 'allowed-tools' instead
integrates_with: [...]      # Use SKILL.md body text instead
triggers: [...]             # Use 'description' keywords instead
outputs: [...]              # Use SKILL.md Output Format section instead
coordinates_with: [...]     # Use SKILL.md body text instead
python_dependencies: [...]  # Use SKILL.md body text instead
```

---

## Description Formula

**Pattern**: `[What it does] [When to use] [Trigger keywords]. NOT for [Exclusions].`

The description is the most important line for activation. Claude's runtime scans descriptions to decide which skill to load. A weak description means zero activations or constant false positives.

| Problem | Bad | Good |
|---------|-----|------|
| Too vague | "Helps with images" | "CLIP semantic search for image-text matching and zero-shot classification. NOT for counting, spatial reasoning, or generation." |
| No exclusions | "Reviews code changes" | "Reviews TypeScript/React diffs and PRs for correctness. NOT for writing new features." |
| Mini-manual | "Researches, then outlines, then drafts..." | "Structured research producing 1-3 page synthesis reports. NOT for quick factual questions." |
| Catch-all | "Helps with product management" | "Writes and refines product requirement documents (PRDs). NOT for strategy decks." |
| Name mismatch | name: `db-migration` / desc: "writes marketing emails" | name: `db-migration` / desc: "Plans database schema migrations with rollback strategies." |

**Full guide with more examples**: See `references/description-guide.md`

---

## SKILL.md Template

```markdown
---
name: your-skill-name
description: [What] [When] [Keywords]. NOT for [Exclusions].
allowed-tools: Read,Write
---

# Skill Name
[One sentence purpose]

## When to Use
✅ Use for: [A, B, C with specific trigger keywords]
❌ NOT for: [D, E, F — explicit boundaries]

## Core Process
[Mermaid diagrams — 23 types available. See visual-artifacts.md for full catalog]

## Anti-Patterns
### [Pattern Name]
**Novice**: [Wrong assumption]
**Expert**: [Why it's wrong + correct approach]
**Timeline**: [When this changed, if temporal]

## References
- `references/guide.md` — Consult when [specific situation]
- `references/examples.md` — Consult for [worked examples of X]
```

---

## The 6-Step Skill Creation Process

```mermaid
flowchart LR
  S1[1. Gather Examples] --> S2[2. Plan Contents]
  S2 --> S3[3. Initialize]
  S3 --> S4[4. Write Skill]
  S4 --> S5[5. Validate]
  S5 --> S6{Errors?}
  S6 -->|Yes| S4
  S6 -->|No| S7[6. Ship & Iterate]
```

### Step 1: Gather Concrete Examples

Collect 3-5 real queries that should trigger this skill, and 3-5 that should NOT.

### Step 2: Plan Reusable Contents

For each example, identify what scripts, references, or assets would prevent re-work. Also identify shibboleths: domain algorithms, temporal knowledge, framework evolution, common pitfalls.

### Step 3: Initialize

```bash
scripts/init_skill.py <skill-name> --path <output-directory>
```

For existing skills, skip to Step 4.

### Step 4: Write the Skill

Order of implementation:
1. **Scripts first** (`scripts/`) — Working code, not templates
2. **References next** (`references/`) — Domain knowledge, schemas, guides
3. **SKILL.md last** — Core process, anti-patterns, reference index

Write in imperative form: "To accomplish X, do Y" not "You should do X."

Answer these questions in SKILL.md:
1. **Purpose**: What is this skill for? (1-2 sentences)
2. **Activation**: What triggers it? What shouldn't?
3. **Process**: Use Mermaid diagrams (23 types) — flowcharts for decisions, sequence for protocols, state for lifecycles, etc.
4. **Anti-patterns**: What do novices get wrong?
5. **Visual artifacts**: Render workflows, architectures, timelines as Mermaid diagrams (see `references/visual-artifacts.md`)
6. **References**: What files exist and when to consult them?

### Step 5: Validate

```bash
python scripts/validate_skill.py <path>
python scripts/check_self_contained.py <path>
```

Fix ERRORS → WARNINGS → SUGGESTIONS.

### Step 6: Iterate

After real-world use: notice struggles, improve SKILL.md and resources, update CHANGELOG.md.

---

## Designing Skills for Subagent Consumption

When skills will be loaded by subagents (not just direct user invocation), apply these patterns:

### Three Skill-Loading Layers

1. **Preloaded** (2-5 core skills): Injected into the subagent's system context. These are its standard operating procedures — always present.
2. **Dynamically selected**: Subagent receives a catalog (name + 1-line description) and picks 1-3 matching skills before starting. The orchestrator can also pre-filter.
3. **Execution-time**: Subagent reads each skill's "When to use" section, follows numbered steps in order, respects output contracts, and runs QA checks.

### How Subagents Should Use Skills

Teach the subagent to treat each skill like a mini-protocol:
- Check the "When to use / When not to use" section for applicability
- Follow numbered steps in order (adapt only if task constraints force it)
- Respect the skill's output contract (templates, JSON shapes, required sections)
- Apply QA/validation steps last
- Reference skill steps by number: "Completed step 3 of refactor-plan-skill"

### Subagent Prompt Structure

The subagent's prompt should have four sections:
1. **Identity**: "You are the [role]. You handle [narrow domain]. If outside scope, say so."
2. **Skill usage rules**: "Your skills define your methods. Decide which apply, follow their workflows."
3. **Task loop**: Restate → Select skills → Clarify → Plan → Execute step-by-step → Validate → Return (artifacts + skills used + remaining risks).
4. **Constraints**: Quality bar, safety rules, tie-breaking priorities.

**Full templates and orchestration patterns**: See `references/subagent-design.md`

---

## Visual Artifacts: Mermaid Diagrams & Code

Skills that include Mermaid diagrams serve two audiences at once. **For humans**, diagrams render as visual flowcharts, state machines, and timelines — instantly parseable. **For agents**, Mermaid is a text-based graph DSL — `A -->|Yes| B` is an explicit, unambiguous edge that's actually easier to reason about than equivalent prose. The agent reads the text; the human sees the picture. Both win.

**Rule**: If a skill describes a process, decision tree, architecture, state machine, timeline, or data relationship, include a Mermaid diagram. Use raw ` ```mermaid ` blocks directly in SKILL.md — not wrapped in outer markdown fences.

### All 23 Mermaid Diagram Types

Mermaid supports **23 diagram types**. Use the most specific one for your content — a state diagram for lifecycles is better than a flowchart with "go back" arrows.

| Skill Content | Diagram Type | Syntax |
|---------------|-------------|--------|
| Decision trees / troubleshooting | Flowchart | `flowchart TD` |
| API/agent communication protocols | Sequence | `sequenceDiagram` |
| Lifecycle / status transitions | State | `stateDiagram-v2` |
| Data models / schemas | ER | `erDiagram` |
| Type hierarchies / interfaces | Class | `classDiagram` |
| Temporal knowledge / evolution | Timeline | `timeline` |
| Domain taxonomy / concept maps | Mindmap | `mindmap` |
| Priority matrices (2-axis) | Quadrant | `quadrantChart` |
| Component layout / blocks | Block | `block-beta` |
| Infrastructure / cloud topology | Architecture | `architecture-beta` |
| Multi-level system views (C4) | C4 | `C4Context` / `C4Container` / `C4Component` |
| Project phases / rollout plans | Gantt | `gantt` |
| Git branching / release strategy | Git Graph | `gitGraph` |
| User experience flows | Journey | `journey` |
| Quantity flows / budgets | Sankey | `sankey-beta` |
| Metrics / benchmarks | XY Chart | `xychart-beta` |
| Proportional breakdowns | Pie | `pie` |
| Hierarchical size comparison | Treemap | `treemap` |
| Multi-axis capability comparison | Radar | `radar` |
| Task/status tracking | Kanban | `kanban` |
| Requirements traceability | Requirement | `requirementDiagram` |
| Network protocols / binary formats | Packet | `packet-beta` |
| Sequence diagrams (code syntax) | ZenUML | `zenuml` (plugin) |

### YAML Frontmatter in Mermaid (Optional)

Mermaid supports an optional `---` frontmatter block for rendering customization (themes, colors, spacing). **It is not required.** Agents ignore it. Renderers apply sensible defaults without it. Only add it when you need specific visual styling for published documentation.

```yaml
# Optional — only for render customization
---
title: My Diagram
config:
  theme: neutral
  flowchart:
    curve: basis
---
```

Themes: `default`, `dark`, `forest`, `neutral`, `base`. Full config reference: https://mermaid.ai/open-source/config/configuration.html

**Full diagram catalog with examples of all 16+ types**: See `references/visual-artifacts.md`

---

## Encoding Shibboleths

Expert knowledge that separates novices from experts. Things LLMs get wrong due to outdated training data or cargo-culted patterns.

### Shibboleth Template

```markdown
### Anti-Pattern: [Name]
**Novice**: "[Wrong assumption]"
**Expert**: [Why it's wrong, with evidence]
**Timeline**: [Date]: [Old way] → [Date]: [New way]
**LLM mistake**: [Why LLMs suggest the old pattern]
**Detection**: [How to spot this in code/config]
```

### What to Encode

- Framework evolution (React Classes → Hooks → Server Components)
- Model limitations (CLIP can't count; embedding models are task-specific)
- Tool architecture (Script → MCP graduation path)
- API versioning (ada-002 → text-embedding-3-large)
- Temporal traps (advice that was correct in 2023 but harmful in 2025)

**Full catalog with case studies**: See `references/antipatterns.md`

---

## Self-Contained Tools and the Extension Taxonomy

Skills are one of seven Claude extension types: **Skills** (domain knowledge), **Plugins** (packaged bundles for distribution), **MCP Servers** (external APIs + auth), **Scripts** (local operations), **Slash Commands** (user-triggered skills), **Hooks** (lifecycle automation at 17+ event points), and **Agent SDK** (programmatic Claude Code access). Most skills should include scripts. MCPs are only for auth/state boundaries. Plugins are for sharing skills across teams/community.

| Need | Extension Type | Key Requirement |
|------|---------------|-----------------|
| Domain expertise / process | **Skill** (SKILL.md) | Decision trees, anti-patterns, output contracts |
| Packaging & distribution | **Plugin** (plugin.json) | Bundles skills + hooks + MCP + agents |
| External API + auth | **MCP Server** | Working server + setup README |
| Repeatable local operation | **Script** | Actually runs (not a template), minimal deps |
| Multi-step orchestration | **Subagent** | 4-section prompt, skills, workflow |
| User-triggered action | **Slash Command** | Skill with `user-invocable: true` |
| Lifecycle automation | **Hook** | 17+ events: PreToolUse, PostToolUse, Stop, etc. |
| Programmatic access | **Agent SDK** | npm/pip package, CI/CD pipelines |

**Evolution path**: Skill → Skill + Scripts → Skill + MCP Server → Skill + Subagent → Plugin (for distribution). Only promote when complexity justifies it.

**Full taxonomy with examples and common mistakes**: See `references/claude-extension-taxonomy.md`
**Detailed tool patterns**: See `references/self-contained-tools.md`
**Plugin creation and distribution**: See `references/plugin-architecture.md`

---

## Tool Permissions

**Principle**: Least privilege — only grant what's needed.

| Access Level | `allowed-tools` |
|-------------|-----------------|
| Read-only | `Read,Grep,Glob` |
| File modifier | `Read,Write,Edit` |
| Build integration | `Read,Write,Bash(npm:*,git:*)` |
| ⚠️ Never for untrusted | Unrestricted `Bash` |

---

## Anti-Pattern Summary

| # | Anti-Pattern | Fix |
|---|-------------|-----|
| 1 | Documentation Dump | Decision trees in SKILL.md, depth in `/references` |
| 2 | Missing NOT clause | Always include "NOT for X, Y, Z" in description |
| 3 | Phantom Tools | Only reference files that exist and work |
| 4 | Template Soup | Ship working code or nothing |
| 5 | Overly Permissive Tools | Least privilege: specific tool list, scoped Bash |
| 6 | Stale Temporal Knowledge | Date all advice, update quarterly |
| 7 | Catch-All Skill | Split by expertise type, not domain |
| 8 | Vague Description | Use `[What] [When] [Keywords]. NOT for [Exclusions]` |
| 9 | Eager Loading | Never "read all files first"; lazy-load references |
| 10 | Prose-Only Processes | Use Mermaid diagrams (23 types) — flowcharts, sequences, states, ER, timelines, etc. |

**Full case studies**: See `references/antipatterns.md`

---

## Validation Checklist

```
□ SKILL.md exists and is &lt;500 lines
□ Frontmatter has name + description (minimum required)
□ Description follows [What][When][Keywords] NOT [Exclusions] formula
□ Description uses keywords users would actually type
□ Name and description are aligned (not contradictory)
□ At least 1 anti-pattern with shibboleth template
□ All referenced files actually exist (no phantoms)
□ Scripts work (not templates), have clear CLI, handle errors
□ Reference files each have a 1-line purpose in SKILL.md
□ Processes/decisions/lifecycles use Mermaid diagrams (23 types), not prose
□ CHANGELOG.md tracks version history
□ If subagent-consumed: output contracts are defined
```

Run automated checks: `python scripts/validate_skill.py <path>` and `python scripts/validate_mermaid.py <path>`

---

## Common Rejection Causes

Things that make Claude Code reject or mishandle skills at load time:

| Cause | Symptom | Fix |
|-------|---------|-----|
| Missing `name` or `description` | Skill won't load | Add both to frontmatter |
| `tools:` instead of `allowed-tools:` | Tools silently ignored | Use `allowed-tools:` (hyphenated) |
| YAML list in `allowed-tools` | Parse error | Use comma-separated: `Read,Write,Edit` |
| Brackets in `allowed-tools` | Parse error | No `[` `]` — just `Read,Write,Edit` |
| Invalid keys (`triggers`, `outputs`) | Silently ignored or error | Move to SKILL.md body text |
| Name with spaces/uppercase | May fail matching | Lowercase-hyphenated: `my-skill-name` |
| Name doesn't match directory | Activation mismatch | Keep name = directory name |
| `context:` not `fork` | Ignored | Only valid value is `fork` |
| `disable-model-invocation:` not boolean | Ignored | Use `true` or `false` |
| Phantom file references | Agent wastes tool calls | Delete references or create files |

**Full validation**: `python scripts/validate_skill.py <path>` catches all of these.

---

## Success Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Correct activation | &gt;90% | Test queries that should trigger |
| False positive rate | &lt;5% | Test queries that shouldn't trigger |
| Token usage | &lt;5k | SKILL.md size + typical reference loads |
| Time to productive | &lt;5 min | User starts working immediately |
| Anti-pattern prevention | &gt;80% | Users avoid documented mistakes |

---

## Reference Files

Consult these for deep dives — they are NOT loaded by default:

| File | Consult When |
|------|-------------|
| `references/knowledge-engineering.md` | KE methods for extracting expert knowledge into skills; protocol analysis, repertory grids, aha! moments |
| `references/description-guide.md` | Writing or rewriting a skill description |
| `references/antipatterns.md` | Looking for shibboleths, case studies, or temporal patterns |
| `references/self-contained-tools.md` | Adding scripts, MCP servers, or subagents to a skill |
| `references/subagent-design.md` | Designing skills for subagent consumption or orchestration |
| `references/claude-extension-taxonomy.md` | Skills vs Plugins vs MCPs vs Hooks vs Agent SDK — the 7-type taxonomy |
| `references/plugin-architecture.md` | Creating, packaging, and distributing plugins via marketplaces |
| `references/visual-artifacts.md` | Adding Mermaid diagrams: all 23 types, YAML config, best practices |
| `references/mcp-template.md` | Building an MCP server for a skill |
| `references/subagent-template.md` | Defining subagent prompts and multi-agent pipelines |
| `scripts/validate_mermaid.py` | Validates Mermaid syntax in any file — checks diagram types, balanced blocks, structural correctness |

---
name: skill-logger
description: Logs and scores skill usage quality, tracking output effectiveness, user satisfaction signals, and improvement opportunities. Expert in skill analytics, quality metrics, feedback loops, and
  continuous improvement. Activate on "skill logging", "skill quality", "skill analytics", "skill scoring", "skill performance", "skill metrics", "track skill usage", "skill improvement". NOT for creating
  skills (use agent-creator), skill documentation (use skill-coach), or runtime debugging (use debugger skills).
allowed-tools: Read,Write,Edit,Bash,Grep,Glob
metadata:
  category: Productivity & Meta
  pairs-with:
  - skill: automatic-stateful-prompt-improver
    reason: Data for prompt optimization
  - skill: skill-coach
    reason: Quality tracking feeds coaching
  tags:
  - logging
  - analytics
  - metrics
  - quality
  - improvement
---

# Skill Logger

Track, measure, and improve skill quality through systematic logging and scoring.

## When to Use This Skill

**Use for:**
- Setting up skill usage logging
- Defining quality metrics for skill outputs
- Analyzing skill performance over time
- Identifying skills that need improvement
- Building feedback loops for skill enhancement
- A/B testing skill variations

**NOT for:**
- Creating new skills → use agent-creator
- Skill documentation → use skill-coach
- Runtime debugging → use appropriate debugger skills
- General logging/monitoring → use devops-automator

## Core Logging Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                    SKILL LOGGING PIPELINE                       │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. CAPTURE          2. ANALYZE           3. SCORE              │
│  ├─ Invocation       ├─ Output parse      ├─ Quality metrics    │
│  ├─ Input context    ├─ Token usage       ├─ User satisfaction  │
│  ├─ Output           ├─ Tool calls        ├─ Goal completion    │
│  └─ Timing           └─ Error patterns    └─ Efficiency         │
│                                                                 │
│  4. AGGREGATE        5. ALERT             6. IMPROVE            │
│  ├─ Per-skill stats  ├─ Quality drops     ├─ Identify patterns  │
│  ├─ Trend analysis   ├─ Error spikes      ├─ Suggest changes    │
│  └─ Comparisons      └─ Underuse          └─ Track experiments  │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

## What to Log

### Invocation Data

```json
{
  "invocation_id": "uuid",
  "timestamp": "ISO8601",
  "skill_name": "wedding-immortalist",
  "skill_version": "1.2.0",

  "input": {
    "user_query": "Create a 3D model from my wedding photos",
    "context_tokens": 1500,
    "files_referenced": ["photos/", "config.json"]
  },

  "execution": {
    "duration_ms": 45000,
    "tool_calls": [
      {"tool": "Bash", "count": 5},
      {"tool": "Write", "count": 3}
    ],
    "tokens_used": {
      "input": 8500,
      "output": 3200
    },
    "errors": []
  },

  "output": {
    "type": "code_generation",
    "artifacts_created": ["pipeline.py", "config.yaml"],
    "response_length": 3200
  }
}
```

### Quality Signals

```python
QUALITY_SIGNALS = {
    # Implicit signals (automated)
    'completion': 'Did the skill complete without errors?',
    'token_efficiency': 'Output quality per token used',
    'tool_success_rate': 'Tool calls that succeeded',
    'retry_count': 'How many retries needed?',

    # Explicit signals (user feedback)
    'user_edit_ratio': 'How much did user modify output?',
    'user_accepted': 'Did user accept/use the output?',
    'follow_up_needed': 'Did user need to ask for fixes?',
    'explicit_rating': 'Thumbs up/down if available',

    # Outcome signals (delayed)
    'code_ran_successfully': 'Did generated code work?',
    'tests_passed': 'Did it pass tests?',
    'reverted': 'Was the output later reverted?',
}
```

## Scoring Framework

### Multi-Dimensional Quality Score

```python
def calculate_skill_score(invocation_log):
    """Score a skill invocation 0-100."""

    scores = {
        # Completion (25%)
        'completion': (
            25 if invocation_log['errors'] == [] else
            15 if invocation_log['recovered'] else
            0
        ),

        # Efficiency (20%)
        'efficiency': min(20, 20 * (
            BASELINE_TOKENS / invocation_log['tokens_used']
        )),

        # Output Quality (30%)
        'quality': (
            30 if invocation_log['user_accepted'] else
            20 if invocation_log['user_edit_ratio'] < 0.2 else
            10 if invocation_log['user_edit_ratio'] < 0.5 else
            0
        ),

        # User Satisfaction (25%)
        'satisfaction': (
            25 if invocation_log['explicit_rating'] == 'positive' else
            15 if invocation_log['no_follow_up'] else
            5 if invocation_log['follow_up_resolved'] else
            0
        ),
    }

    return sum(scores.values())
```

### Score Interpretation

| Score Range | Quality Level | Action |
|-------------|---------------|--------|
| 90-100 | Excellent | Document as exemplar |
| 75-89 | Good | Monitor for consistency |
| 50-74 | Acceptable | Review for improvements |
| 25-49 | Poor | Prioritize fixes |
| 0-24 | Failing | Immediate intervention |

## Log Storage Schema

### SQLite Schema (Local)

```sql
CREATE TABLE skill_invocations (
    id TEXT PRIMARY KEY,
    skill_name TEXT NOT NULL,
    skill_version TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,

    -- Input
    user_query TEXT,
    context_tokens INTEGER,

    -- Execution
    duration_ms INTEGER,
    tokens_input INTEGER,
    tokens_output INTEGER,
    tool_calls_json TEXT,
    errors_json TEXT,

    -- Output
    output_type TEXT,
    artifacts_json TEXT,
    response_length INTEGER,

    -- Quality signals
    user_accepted BOOLEAN,
    user_edit_ratio REAL,
    follow_up_needed BOOLEAN,
    explicit_rating TEXT,

    -- Computed
    quality_score REAL,

    INDEX idx_skill_name (skill_name),
    INDEX idx_timestamp (timestamp),
    INDEX idx_quality (quality_score)
);

CREATE TABLE skill_aggregates (
    skill_name TEXT,
    period TEXT,  -- 'daily', 'weekly', 'monthly'
    period_start DATE,

    invocation_count INTEGER,
    avg_quality_score REAL,
    error_rate REAL,
    avg_tokens_used INTEGER,
    avg_duration_ms INTEGER,

    PRIMARY KEY (skill_name, period, period_start)
);
```

### JSON Log Format (Portable)

```json
{
  "logs_version": "1.0",
  "skill_name": "wedding-immortalist",
  "entries": [
    {
      "id": "uuid",
      "timestamp": "2025-01-15T14:30:00Z",
      "input": {...},
      "execution": {...},
      "output": {...},
      "quality": {
        "signals": {...},
        "score": 85,
        "computed_at": "2025-01-15T14:35:00Z"
      }
    }
  ]
}
```

## Analytics Queries

### Skill Performance Dashboard

```sql
-- Overall skill rankings
SELECT
    skill_name,
    COUNT(*) as uses,
    AVG(quality_score) as avg_quality,
    AVG(tokens_output) as avg_tokens,
    SUM(CASE WHEN errors_json != '[]' THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as error_rate
FROM skill_invocations
WHERE timestamp > datetime('now', '-30 days')
GROUP BY skill_name
ORDER BY avg_quality DESC;

-- Quality trend (weekly)
SELECT
    skill_name,
    strftime('%Y-%W', timestamp) as week,
    AVG(quality_score) as avg_quality,
    COUNT(*) as uses
FROM skill_invocations
GROUP BY skill_name, week
ORDER BY skill_name, week;

-- Problem detection
SELECT skill_name, COUNT(*) as failures
FROM skill_invocations
WHERE quality_score < 50
  AND timestamp > datetime('now', '-7 days')
GROUP BY skill_name
HAVING failures >= 3
ORDER BY failures DESC;
```

### Improvement Opportunities

```python
def identify_improvement_opportunities(skill_name, logs):
    """Analyze logs to suggest skill improvements."""

    opportunities = []

    # Pattern 1: Common follow-up questions
    follow_ups = extract_follow_up_patterns(logs)
    if follow_ups:
        opportunities.append({
            'type': 'missing_capability',
            'description': f'Users frequently ask: {follow_ups[0]}',
            'suggestion': 'Add guidance for this common need'
        })

    # Pattern 2: High edit ratio in specific output types
    edit_patterns = analyze_edit_patterns(logs)
    if edit_patterns['code'] > 0.4:
        opportunities.append({
            'type': 'code_quality',
            'description': 'Users frequently edit generated code',
            'suggestion': 'Review code examples and templates'
        })

    # Pattern 3: Repeated errors
    error_patterns = cluster_errors(logs)
    for error_type, count in error_patterns:
        if count >= 3:
            opportunities.append({
                'type': 'recurring_error',
                'description': f'{error_type} occurred {count} times',
                'suggestion': 'Add error handling or documentation'
            })

    return opportunities
```

## Implementation Guide

### Basic Logger Hook

```python
# hooks/skill_logger.py
import json
import sqlite3
from datetime import datetime
from pathlib import Path

LOG_DB = Path.home() / '.claude' / 'skill_logs.db'

def log_skill_invocation(
    skill_name: str,
    user_query: str,
    output: str,
    tool_calls: list,
    duration_ms: int,
    tokens: dict,
    errors: list = None
):
    """Log a skill invocation to the database."""

    conn = sqlite3.connect(LOG_DB)
    cursor = conn.cursor()

    cursor.execute('''
        INSERT INTO skill_invocations
        (id, skill_name, timestamp, user_query, duration_ms,
         tokens_input, tokens_output, tool_calls_json, errors_json,
         response_length)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        str(uuid.uuid4()),
        skill_name,
        datetime.utcnow().isoformat(),
        user_query,
        duration_ms,
        tokens.get('input', 0),
        tokens.get('output', 0),
        json.dumps(tool_calls),
        json.dumps(errors or []),
        len(output)
    ))

    conn.commit()
    conn.close()
```

### Quality Signal Collection

```python
def collect_quality_signals(invocation_id: str, signals: dict):
    """Update an invocation with quality signals."""

    conn = sqlite3.connect(LOG_DB)
    cursor = conn.cursor()

    # Update with user feedback
    cursor.execute('''
        UPDATE skill_invocations
        SET user_accepted = ?,
            user_edit_ratio = ?,
            follow_up_needed = ?,
            explicit_rating = ?,
            quality_score = ?
        WHERE id = ?
    ''', (
        signals.get('accepted'),
        signals.get('edit_ratio'),
        signals.get('follow_up'),
        signals.get('rating'),
        calculate_score(signals),
        invocation_id
    ))

    conn.commit()
    conn.close()
```

## Alerting & Notifications

### Alert Conditions

```python
ALERT_CONDITIONS = {
    'quality_drop': {
        'condition': 'avg_quality_7d < avg_quality_30d * 0.8',
        'message': 'Skill {skill} quality dropped 20%+ in past week',
        'severity': 'warning'
    },
    'error_spike': {
        'condition': 'error_rate_24h > error_rate_7d * 2',
        'message': 'Skill {skill} error rate doubled in past 24h',
        'severity': 'critical'
    },
    'underused': {
        'condition': 'uses_7d < uses_30d_avg * 0.5',
        'message': 'Skill {skill} usage down 50%+ this week',
        'severity': 'info'
    },
    'high_performer': {
        'condition': 'avg_quality_7d > 90 AND uses_7d > 10',
        'message': 'Skill {skill} performing excellently',
        'severity': 'positive'
    }
}
```

## Anti-Patterns

### "Log Everything"
**Wrong**: Logging complete input/output for every invocation.
**Why**: Privacy concerns, storage explosion, noise.
**Right**: Log metadata, summaries, and opt-in detailed logging.

### "Score Once, Forget"
**Wrong**: Calculating quality score immediately after completion.
**Why**: Misses delayed signals (did code work? was it reverted?).
**Right**: Collect signals over time, recalculate periodically.

### "Averages Only"
**Wrong**: Only tracking average quality scores.
**Why**: Hides distribution, misses failure modes.
**Right**: Track percentiles, failure rates, and patterns.

### "No Baseline"
**Wrong**: Measuring quality without establishing baselines.
**Why**: Can't detect improvement or regression.
**Right**: Establish baselines per skill, compare trends.

## Output Reports

### Weekly Skill Health Report

```markdown
# Skill Health Report - Week of 2025-01-13

## Overview
- Total invocations: 247
- Average quality: 78.3 (up 2.1 from last week)
- Error rate: 4.2% (down 1.8%)

## Top Performers
1. **wedding-immortalist** - 92.1 avg quality, 18 uses
2. **skill-coach** - 89.4 avg quality, 34 uses
3. **api-architect** - 87.2 avg quality, 22 uses

## Needs Attention
1. **legacy-code-converter** - 52.3 avg quality (down 15%)
   - Common issue: Missing dependency detection
   - Suggested fix: Add dependency scanning step

## Improvement Opportunities
- `partner-text-coach`: Users frequently ask for tone adjustment
- `yard-landscaper`: High edit ratio on plant recommendations
```

## Integration Points

- **skill-coach**: Feed quality data for skill improvements
- **agent-creator**: Use metrics when designing new skills
- **automatic-stateful-prompt-improver**: Quality signals for prompt optimization

---

**Core Philosophy**: What gets measured gets improved. Skill logging transforms intuition about skill quality into actionable data, enabling continuous improvement of the entire skill ecosystem.
---
name: code-review-checklist
description: Generate context-aware code review checklists from PR diffs — tailored to language, codebase patterns, and team standards. Identifies what reviewers should focus on. NOT for automated code
  fixing, test generation, or security auditing.
allowed-tools: Read,Grep,Glob
metadata:
  category: Code Quality & Testing
  tags:
  - code-review
  - quality
  - checklist
  - pr-review
  - best-practices
  pairs-with:
  - skill: security-auditor
    reason: Security checks are a critical section of any thorough code review checklist
  - skill: refactoring-surgeon
    reason: Code smell detection during review leads directly to targeted refactoring
  - skill: test-automation-expert
    reason: Test coverage verification is a key code review checkpoint
---

# Code Review Checklist Generator

Generate thorough, contextual code review checklists that help reviewers focus on what matters most for each specific PR.

## When to Use

- Before starting a code review to know what to look for
- When onboarding new team members to review standards
- To ensure consistent review quality across the team
- When reviewing unfamiliar parts of the codebase

## Approach

1. **Analyze the Diff**: Understand what files changed and the nature of changes
2. **Identify Patterns**: Detect the type of change (feature, bugfix, refactor, etc.)
3. **Language-Specific Checks**: Apply relevant checks for the programming language
4. **Project Context**: Consider existing patterns and conventions in the codebase
5. **Generate Checklist**: Produce prioritized, actionable review items

## Checklist Categories

### Security
- [ ] Input validation present
- [ ] No hardcoded secrets or credentials
- [ ] Proper authentication/authorization checks
- [ ] SQL injection prevention
- [ ] XSS prevention for web code

### Performance
- [ ] No N+1 query patterns
- [ ] Appropriate caching considered
- [ ] No unnecessary loops or iterations
- [ ] Efficient data structures used

### Maintainability
- [ ] Code is readable and self-documenting
- [ ] Functions are appropriately sized
- [ ] No code duplication
- [ ] Consistent naming conventions

### Testing
- [ ] Unit tests cover new functionality
- [ ] Edge cases are tested
- [ ] Tests are meaningful, not just for coverage

## Best Practices

- Prioritize security issues first
- Focus on logic errors over style nitpicks
- Consider the reviewer's time - highlight critical items
- Adapt checklist to project maturity level

---

---
name: logging-observability
description: 'Structured logging, distributed tracing, and metrics for production applications. [What: OpenTelemetry setup, log level strategy, correlation IDs, SLI/SLO alerting thresholds, Grafana dashboard
  design, PagerDuty integration] [When: setting up production logging, adding observability to a service, debugging distributed systems, designing alerting, implementing traces/metrics/logs] [Keywords:
  logging, observability, OpenTelemetry, OTel, structured logs, distributed tracing, correlation ID, metrics, Grafana, Prometheus, PagerDuty, Winston, Pino, structlog, log levels, SLI, SLO, alerting] NOT
  for application performance profiling (use a profiler), load testing, or database query optimization.'
allowed-tools: Read,Write,Edit,Bash(npm:*,npx:*,pip:*,docker:*)
argument-hint: '[service description] [stack: node|python|go|java] [current problem: no-logging|no-tracing|alert-fatigue|pii-leak]'
metadata:
  category: Code Quality & Testing
  pairs-with:
  - skill: api-architect
    reason: API request tracing and correlation IDs
  - skill: devops-automator
    reason: Deploying collectors and dashboards
  - skill: background-job-orchestrator
    reason: Distributed job observability
  tags:
  - observability
  - logging
  - tracing
  - metrics
  - opentelemetry
  - monitoring
---

# Logging & Observability

Structured logging, distributed tracing, and metrics for production systems. Covers the full observability stack from log formatting to alert routing.

## When to Use

**Activate on:** "structured logging", "distributed tracing", "OpenTelemetry", "OTel", "correlation ID", "log levels", "Grafana dashboard", "alerting thresholds", "SLI SLO", "Prometheus metrics", "PagerDuty integration", "observability stack", "Winston setup", "Pino logger", "log aggregation", "Datadog", "Honeycomb"

**NOT for:** Performance profiling (CPU/memory flamegraphs) | Load testing | Database query optimization | Security auditing

## Decision Tree: What to Log at Each Level

```mermaid
flowchart TD
    E[Event Occurs] --> Q1{Does it represent\na system failure?}
    Q1 -->|Yes| Q2{Is it recoverable\nwithout human?}
    Q2 -->|No| FATAL[FATAL: Service cannot\ncontinue — trigger pager]
    Q2 -->|Yes| ERROR[ERROR: Operation failed,\nwill retry or degrade]
    Q1 -->|No| Q3{Is it unexpected\nbut not failing?}
    Q3 -->|Yes| WARN[WARN: Unusual condition,\ncircuit breaker open,\ndeprecation used]
    Q3 -->|No| Q4{Is it a meaningful\nbusiness event?}
    Q4 -->|Yes| INFO[INFO: User action,\npayment processed,\nservice started]
    Q4 -->|No| Q5{Needed to debug\na specific issue?}
    Q5 -->|Yes| DEBUG[DEBUG: DB queries,\ncache hits/misses,\nfunction inputs]
    Q5 -->|No| TRACE[TRACE: Fine-grained\nloop iterations,\nOTel spans]
```

**Rule of thumb**: Production runs INFO and above. DEBUG only enabled per-service via dynamic config, never always-on in prod.

## Core Patterns

### Structured Log Format (JSON)

Every log line must be parseable. String concatenation is not a log.

**Node.js with Pino:**
```typescript
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  base: {
    service: 'payment-service',
    version: process.env.SERVICE_VERSION,
    env: process.env.NODE_ENV,
  },
  redact: {
    paths: ['req.headers.authorization', 'body.password', 'body.cardNumber', '*.ssn'],
    censor: '[REDACTED]',
  },
});

// Good: structured fields
logger.info({ orderId, userId, amountCents }, 'Payment processed');

// Bad: string interpolation
logger.info(`Payment processed for user ${userId} order ${orderId}`);
```

**Python with structlog:**
```python
import structlog

log = structlog.get_logger()

structlog.configure(
    processors=[
        structlog.contextvars.merge_contextvars,
        structlog.stdlib.add_log_level,
        structlog.stdlib.add_logger_name,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.JSONRenderer(),
    ]
)

# Good: key-value pairs
log.info("payment_processed", order_id=order_id, user_id=user_id, amount_cents=amount)
```

### Correlation IDs

Every request needs a trace ID that flows through all downstream calls. This is the minimum viable distributed tracing without OTel.

```typescript
// Express middleware
import { randomUUID } from 'crypto';
import { AsyncLocalStorage } from 'async_hooks';

const requestContext = new AsyncLocalStorage<{ traceId: string; spanId: string }>();

export function correlationMiddleware(req, res, next) {
  const traceId = req.headers['x-trace-id'] ?? randomUUID();
  const spanId = randomUUID().slice(0, 8);

  requestContext.run({ traceId, spanId }, () => {
    res.setHeader('x-trace-id', traceId);
    next();
  });
}

// Logger that auto-includes context
export function getLogger(name: string) {
  return {
    info: (msg: string, fields?: object) => {
      const ctx = requestContext.getStore();
      logger.info({ ...ctx, ...fields, logger: name }, msg);
    },
    // ... error, warn, debug
  };
}
```

### OpenTelemetry Setup

See `references/opentelemetry-setup.md` for complete OTel collector config, SDK initialization per language, and span attribute conventions.

**Minimal Node.js bootstrap:**
```typescript
// Must be first import in entrypoint
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

const sdk = new NodeSDK({
  serviceName: 'payment-service',
  traceExporter: new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();
```

### Distributed Trace Propagation

```mermaid
sequenceDiagram
    participant C as Client
    participant GW as API Gateway
    participant SVC as Payment Service
    participant DB as Database

    C->>GW: POST /checkout<br/>(no trace header)
    Note over GW: Generate trace-id: abc123<br/>span-id: 0001
    GW->>SVC: POST /payment<br/>traceparent: 00-abc123-0001-01
    Note over SVC: Inherit trace-id: abc123<br/>New span-id: 0002
    SVC->>DB: INSERT payment<br/>traceparent: 00-abc123-0002-01
    Note over DB: Inherit trace-id: abc123<br/>New span-id: 0003
    DB-->>SVC: OK (span 0003 ends)
    SVC-->>GW: 200 OK (span 0002 ends)
    GW-->>C: 200 OK (span 0001 ends)<br/>x-trace-id: abc123
```

The W3C `traceparent` header format: `00-{traceId}-{spanId}-{flags}`. Always propagate this header on every downstream HTTP call.

## Reference Files

| File | Contents |
|------|----------|
| `references/opentelemetry-setup.md` | OTel SDK init per language, collector YAML config, span attributes, context propagation |
| `references/alerting-patterns.md` | SLI/SLO definitions, alert routing, PagerDuty severity mapping, alert fatigue prevention |

## Anti-Patterns (Shibboleths)

### Anti-Pattern 1: Logging PII or Secrets in Production

**Novice thinking**: "I'll just log the full request body to debug this auth issue."

**Why wrong**: GDPR/CCPA violations carry fines up to 4% of global revenue. Secrets in logs propagate to log aggregators, S3 exports, audit trails — all places with different access controls. A single `console.log(req.body)` can expose thousands of user passwords in your Datadog dashboard.

**Detection signature**: Search your logs for `password`, `ssn`, `cardNumber`, `authorization` as field values (not keys). If any appear, you have a PII leak.

**Fix — Allowlist approach:**
```typescript
// Never log what you don't explicitly approve
const SAFE_BODY_FIELDS = ['orderId', 'productId', 'quantity', 'currency'];

logger.info({
  body: pick(req.body, SAFE_BODY_FIELDS), // only known-safe fields
  path: req.path,
  method: req.method,
}, 'Request received');
```

**Fix — Redaction in logger config:**
```typescript
// Pino's redact runs before any transport
const logger = pino({
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'body.password',
      'body.*.password',   // nested objects too
      'body.cardNumber',
      'body.ssn',
      '*.token',
      '*.secret',
    ],
    censor: '[REDACTED]',
  },
});
```

**Shibboleth**: An expert sets up redaction at logger initialization, not as a reminder comment. Redaction must be structural, not ad-hoc.

---

### Anti-Pattern 2: Unstructured String Logs Instead of Structured JSON

**Novice thinking**: `logger.info('User ' + userId + ' purchased ' + productId + ' for $' + amount)`

**Why wrong**: You cannot filter, aggregate, or alert on string-interpolated data in any log aggregator. A Grafana query for `amount > 1000` requires `amount` to be a numeric field, not embedded in a sentence. String logs are write-only — you can read them but not query them at scale.

**Impact**: Your 10 million daily log lines become unsearchable. MTTR (mean time to recovery) during incidents doubles because engineers grep through strings instead of filtering structured fields.

**Fix:**
```typescript
// Bad: string log — amount is buried in text
logger.info(`User ${userId} purchased ${productId} for $${amount}`);

// Good: structured — every field is queryable
logger.info({ userId, productId, amountDollars: amount / 100 }, 'purchase_completed');
```

**Consistent event naming**: Use `snake_case` verb-noun event names (`payment_processed`, `user_signed_up`, `order_failed`) as the message string. This creates a stable vocabulary for dashboards and alerts.

**Shibboleth**: The log message string is for humans scanning log tails. All queryable data lives in structured fields. A logger that produces `{}` as its output shape is better than one that produces readable strings.

---

### Anti-Pattern 3: Log-and-Throw (Duplicate Log Entries)

**Novice thinking**: Log the error, then re-throw so the caller also knows about it.

```typescript
// BAD: log-and-throw
async function processPayment(orderId: string) {
  try {
    return await chargeCard(orderId);
  } catch (err) {
    logger.error({ err, orderId }, 'Payment failed'); // Logged here
    throw err; // And the caller logs it again
  }
}

async function handleCheckout(req, res) {
  try {
    await processPayment(req.body.orderId);
  } catch (err) {
    logger.error({ err }, 'Checkout failed'); // Same error logged twice
    res.status(500).json({ error: 'Checkout failed' });
  }
}
```

**Why wrong**: Every error appears 2-5 times in your logs depending on call depth. Alerting on error count becomes unreliable. Incident review is confusing — engineers think there were multiple failures. Log volume costs money (Datadog charges per ingested GB).

**Fix — Log only at the boundary where you handle the error:**
```typescript
// Good: log only where you decide what to do with the error
async function processPayment(orderId: string) {
  // No try-catch: let errors propagate naturally
  return await chargeCard(orderId);
}

async function handleCheckout(req, res) {
  try {
    await processPayment(req.body.orderId);
    res.json({ success: true });
  } catch (err) {
    // One log, at the boundary where we're deciding to return 500
    logger.error({ err, orderId: req.body.orderId }, 'checkout_failed');
    res.status(500).json({ error: 'Checkout failed' });
  }
}
```

**Rule**: Log where you handle. Don't log where you propagate. The call stack in the error object already tells you where it originated.

**Shibboleth**: If you see the same `traceId` appear in more than two error log lines for a single request, you have a log-and-throw chain somewhere.

## Quality Checklist

```
[ ] All log lines are JSON (no string concatenation)
[ ] Log level strategy documented: what goes at each level
[ ] PII/secrets redacted at logger config level, not call site
[ ] Correlation IDs propagated on all outbound HTTP calls
[ ] OTel SDK initialized before any other imports
[ ] Error logs include the error object (not just message)
[ ] No log-and-throw patterns in error handling
[ ] DEBUG logs use conditional guards or sampling
[ ] SLI/SLO defined for each critical user journey
[ ] Alert routing: notify vs page threshold documented
[ ] Runbook linked from every paging alert
[ ] Log retention policy set (cost vs compliance)
```

## Output Artifacts

1. **Logger configuration** — Pino/Winston/structlog setup with redaction rules
2. **OTel bootstrap file** — SDK init with auto-instrumentation
3. **Correlation middleware** — AsyncLocalStorage request context
4. **Prometheus metrics module** — Counter/histogram/gauge definitions
5. **Grafana dashboard JSON** — Four golden signals panels
6. **Alertmanager rules YAML** — SLO-based alert definitions

---

---
name: playwright-e2e-tester
description: Expert in end-to-end testing with Playwright, the modern cross-browser testing framework. Specializes in test generation, page object patterns, visual regression testing, and CI/CD integration.
  Handles complex testing scenarios including authentication flows, API mocking, and mobile emulation.
version: 1.0.0
metadata:
  category: testing
  tags:
  - e2e
  - playwright
  - testing
  - automation
  - ci-cd
  - cross-browser
  pairs-with:
  - skill: test-automation-expert
    reason: Playwright E2E tests are one tier in a comprehensive test automation strategy
  - skill: webapp-testing
    reason: 'Both use Playwright but for different scopes: E2E test suites vs interactive debugging'
  - skill: vitest-testing-patterns
    reason: Unit tests (Vitest) and E2E tests (Playwright) form complementary test pyramid layers
  - skill: github-actions-pipeline-builder
    reason: E2E tests run in CI pipelines with browser installation and artifact upload steps
---

# Playwright E2E Tester

## Overview

Expert in end-to-end testing with Playwright, the modern cross-browser testing framework. Specializes in test generation, page object patterns, visual regression testing, and CI/CD integration. Handles complex testing scenarios including authentication flows, API mocking, and mobile emulation.

## When to Use

- Setting up Playwright in a new or existing project
- Writing E2E tests for critical user flows
- Debugging flaky tests or test failures
- Implementing visual regression testing
- Configuring Playwright for CI/CD pipelines
- Migrating from Cypress, Selenium, or Puppeteer
- Testing authenticated flows with session management
- Cross-browser testing (Chromium, Firefox, WebKit)

## Capabilities

### Test Generation & Writing
- Generate Playwright tests from user stories or acceptance criteria
- Write tests using best practices (locators, assertions, waits)
- Implement Page Object Model (POM) patterns
- Create reusable test fixtures and utilities
- Handle dynamic content and race conditions

### Configuration & Setup
- Configure `playwright.config.ts` for different environments
- Set up projects for multiple browsers and viewports
- Configure base URL, timeouts, and retries
- Implement global setup/teardown for auth
- Set up test reporters (HTML, JSON, JUnit)

### Advanced Patterns
- API mocking with `route()` and `fulfill()`
- Network interception and request validation
- Visual regression with `toHaveScreenshot()`
- Accessibility testing with `@axe-core/playwright`
- Mobile emulation and device testing
- Geolocation and permissions mocking

### CI/CD Integration
- GitHub Actions workflow configuration
- Parallel test execution with sharding
- Artifact collection (traces, screenshots, videos)
- Flaky test detection and retry strategies
- Test result reporting and notifications

### Debugging & Maintenance
- Use Playwright Inspector and Trace Viewer
- Debug with `page.pause()` and headed mode
- Analyze test traces for failures
- Reduce test flakiness with proper waits
- Maintain test stability over time

## Dependencies

Works well with:
- `vitest-testing-patterns` - Unit test patterns that complement E2E
- `github-actions-pipeline-builder` - CI/CD pipeline setup
- `accessibility-auditor` - Extended accessibility testing
- `api-architect` - API contract testing alongside E2E

## Examples

### Basic Test Structure
```typescript
import { test, expect } from '@playwright/test';

test.describe('User Authentication', () => {
  test('should allow user to sign in', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('Email').fill('user@example.com');
    await page.getByLabel('Password').fill('securepassword');
    await page.getByRole('button', { name: 'Sign In' }).click();

    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    await expect(page).toHaveURL('/dashboard');
  });
});
```

### Page Object Pattern
```typescript
// pages/LoginPage.ts
import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly signInButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByLabel('Email');
    this.passwordInput = page.getByLabel('Password');
    this.signInButton = page.getByRole('button', { name: 'Sign In' });
  }

  async goto() {
    await this.page.goto('/login');
  }

  async signIn(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.signInButton.click();
  }
}
```

### Auth Setup Fixture
```typescript
// fixtures/auth.ts
import { test as base } from '@playwright/test';

export const test = base.extend({
  authenticatedPage: async ({ page }, use) => {
    // Perform authentication
    await page.goto('/login');
    await page.getByLabel('Email').fill(process.env.TEST_USER!);
    await page.getByLabel('Password').fill(process.env.TEST_PASS!);
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Wait for auth to complete
    await page.waitForURL('/dashboard');

    // Use the authenticated page in tests
    await use(page);
  },
});
```

### GitHub Actions CI
```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npx playwright test

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
```

### Visual Regression Test
```typescript
test('homepage matches snapshot', async ({ page }) => {
  await page.goto('/');

  // Full page screenshot comparison
  await expect(page).toHaveScreenshot('homepage.png', {
    fullPage: true,
    maxDiffPixelRatio: 0.01,
  });

  // Component-level screenshot
  const hero = page.getByTestId('hero-section');
  await expect(hero).toHaveScreenshot('hero-section.png');
});
```

### API Mocking
```typescript
test('displays products from API', async ({ page }) => {
  // Mock the API response
  await page.route('**/api/products', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        { id: 1, name: 'Product A', price: 29.99 },
        { id: 2, name: 'Product B', price: 49.99 },
      ]),
    });
  });

  await page.goto('/products');

  await expect(page.getByText('Product A')).toBeVisible();
  await expect(page.getByText('$29.99')).toBeVisible();
});
```

## Best Practices

1. **Use role-based locators** - Prefer `getByRole()`, `getByLabel()`, `getByText()` over CSS selectors
2. **Avoid hard waits** - Use `waitForSelector()`, `waitForURL()`, or assertions instead of `waitForTimeout()`
3. **Isolate tests** - Each test should be independent and not rely on state from other tests
4. **Use fixtures** - Share setup logic through fixtures rather than `beforeEach` hooks
5. **Keep tests focused** - Test one user flow per test, avoid testing multiple unrelated things
6. **Handle flakiness proactively** - Use proper waits, retries, and stable locators
7. **Organize with Page Objects** - Encapsulate page interactions for maintainability
8. **Run in CI** - Always run E2E tests in CI before merging

## Common Pitfalls

- **Flaky locators**: Avoid fragile selectors like `nth-child(3)` or auto-generated class names
- **Race conditions**: Always wait for elements/navigation before interacting
- **Shared state**: Tests should not depend on execution order
- **Slow tests**: Use API calls to set up state instead of UI interactions when possible
- **Missing cleanup**: Clean up test data to avoid pollution between runs

---

---
name: playwright-screenshot-inspector
description: LLM-powered visual testing expert for automated screenshot capture, analysis, and UI verification using Playwright with multimodal AI inspection.
metadata:
  category: Testing
  tags:
  - playwright
  - visual-testing
  - screenshots
  - ui-verification
  - automation
  pairs-with:
  - skill: playwright-e2e-tester
    reason: Visual regression testing extends E2E test suites with screenshot comparison
  - skill: webapp-testing
    reason: Screenshot inspection automates the visual verification that interactive testing does manually
  - skill: color-contrast-auditor
    reason: Automated screenshot analysis can detect contrast violations across UI states
---

# Playwright Screenshot Inspector

LLM-powered visual testing expert for automated screenshot capture, analysis, and UI verification using Playwright with multimodal AI inspection.

## Activation Triggers

**Activate on:**
- "screenshot test", "visual test", "screenshot inspection"
- "playwright headless", "playwright screenshot"
- "UI verification", "visual regression"
- "theme compliance test", "dark mode test", "light mode test"
- "automated screenshot", "capture and analyze"
- "compare screenshots", "visual diff"

**NOT for:**
- Simple one-off screenshots (use browser DevTools)
- Pixel-perfect comparison without AI (use native Playwright `toHaveScreenshot`)
- Non-web UI testing (use platform-specific tools)
- Performance testing (use Lighthouse/WebPageTest)

---

## Core Philosophy

Traditional visual testing compares pixels. **LLM-powered visual testing understands semantics.**

Instead of "these 50 pixels changed", LLM inspection answers:
- "Is the content actually rendered?"
- "Does the theme switch correctly?"
- "Are interactive elements visible and properly styled?"
- "What's broken vs. what's just different?"

---

## The Screenshot Inspection Loop

```
┌─────────────────────────────────────────────────────────────┐
│                    LLM SCREENSHOT INSPECTION                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. CAPTURE (Playwright)                                    │
│     └─► Wait for React hydration, not just network          │
│                                                             │
│  2. READ (Claude vision)                                    │
│     └─► Pass screenshot to LLM with specific questions      │
│                                                             │
│  3. ANALYZE (Structured response)                           │
│     └─► Extract: content present? theme correct? errors?    │
│                                                             │
│  4. ACT (Conditional logic)                                 │
│     └─► Pass/fail based on semantic understanding           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Critical: Waiting for React Content

**The #1 failure mode**: Taking screenshots before React hydrates.

### Anti-Pattern: Network Idle Alone
```python
# ❌ WRONG - React may not have rendered yet
page.goto(url)
page.wait_for_load_state('networkidle')
page.screenshot(path='broken.png')  # Often blank!
```

### Correct Pattern: Wait for Actual Content
```python
# ✅ CORRECT - Wait for React to mount
page.goto(url, wait_until='domcontentloaded')
page.wait_for_load_state('networkidle')

# Give React time to hydrate
import time
time.sleep(0.5)

# Wait for actual content selector
page.wait_for_selector('.main-content, h1, [data-testid="app"]',
                       state='visible',
                       timeout=10000)

# Verify content exists
body_text = page.locator('body').inner_text()
if len(body_text) < 50:
    time.sleep(2)  # Extra wait for slow hydration

page.screenshot(path='good.png', full_page=True)
```

### Content Verification Function
```python
def wait_for_react_content(page, selectors, timeout=10000):
    """Wait for React to hydrate by checking for actual content."""
    page.wait_for_load_state('domcontentloaded')
    page.wait_for_load_state('networkidle')
    time.sleep(0.5)  # React hydration buffer

    for selector in selectors.split(','):
        try:
            locator = page.locator(selector.strip())
            if locator.count() > 0:
                locator.first.wait_for(state='visible', timeout=timeout)
                return True
        except:
            continue

    # Fallback: wait for substantial body content
    try:
        page.wait_for_function(
            'document.body.innerText.length > 100',
            timeout=timeout
        )
        return True
    except:
        return False
```

---

## Headless Mode: Preventing Window Spam

**Always use `headless=True`** to prevent browser windows from spawning:

```python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    # CRITICAL: headless=True prevents visible browser windows
    browser = p.chromium.launch(headless=True)

    context = browser.new_context(
        viewport={'width': 1280, 'height': 800},
        color_scheme='dark'  # Initial theme
    )
    page = context.new_page()

    # ... your test logic ...

    browser.close()  # Always clean up
```

### Theme Testing Pattern
```python
# Dark mode screenshot
page.emulate_media(color_scheme='dark')  # Note: on PAGE, not context
page.goto(url)
wait_for_react_content(page, '.app-container, main, h1')
page.screenshot(path='dark.png', full_page=True)

# Light mode screenshot
page.emulate_media(color_scheme='light')
page.reload()
wait_for_react_content(page, '.app-container, main, h1')
page.screenshot(path='light.png', full_page=True)
```

---

## LLM Screenshot Analysis Patterns

### Pattern 1: Content Verification
```
Prompt: "Analyze this screenshot. Answer:
1. Is the main content rendered (not blank/loading)?
2. What major UI elements are visible?
3. Are there any error states or broken layouts?
4. Rate content completeness: FULL / PARTIAL / EMPTY"
```

### Pattern 2: Theme Compliance
```
Prompt: "This is a {dark/light} mode screenshot. Verify:
1. Background color matches expected theme (dark bg for dark mode)
2. Text has sufficient contrast against background
3. Interactive elements are visible and styled correctly
4. No theme leakage (dark elements on light bg or vice versa)"
```

### Pattern 3: Comparison Analysis
```
Prompt: "Compare these two screenshots (before/after). Identify:
1. What changed between them?
2. Are changes intentional (theme switch) or bugs?
3. Is any content missing in the 'after' version?
4. Rate similarity: IDENTICAL / MINOR_DIFF / MAJOR_DIFF / BROKEN"
```

### Pattern 4: Accessibility Check
```
Prompt: "Evaluate this screenshot for visual accessibility:
1. Is text readable (sufficient size and contrast)?
2. Are interactive elements clearly identifiable?
3. Is there visual hierarchy (headings, sections)?
4. Any elements that would fail WCAG contrast requirements?"
```

---

## Complete Test Script Template

```python
#!/usr/bin/env python3
"""
LLM-Powered Screenshot Test Suite
Captures screenshots and uses Claude vision for semantic analysis.
"""

from playwright.sync_api import sync_playwright
import os
import time

PAGES_TO_TEST = [
    # (path, name, content_selectors)
    ('/', 'Home', '.hero, main, h1'),
    ('/about', 'About', '.about-content, main, h1'),
    ('/dashboard', 'Dashboard', '.dashboard, .stats, h1'),
]

BASE_URL = 'http://localhost:5173'
SCREENSHOT_DIR = '/tmp/visual-tests'


def wait_for_content(page, selectors, timeout=10000):
    """Wait for React/Vue/Svelte to hydrate."""
    page.wait_for_load_state('domcontentloaded')
    page.wait_for_load_state('networkidle')
    time.sleep(0.5)

    for selector in selectors.split(','):
        try:
            loc = page.locator(selector.strip())
            if loc.count() > 0:
                loc.first.wait_for(state='visible', timeout=timeout)
                return True
        except:
            continue

    try:
        page.wait_for_function('document.body.innerText.length > 100', timeout=timeout)
        return True
    except:
        return False


def capture_themed_screenshots(page, url, name, selectors):
    """Capture both dark and light mode screenshots."""
    safe_name = name.lower().replace(' ', '-')
    results = {'name': name, 'url': url}

    for theme in ['dark', 'light']:
        page.emulate_media(color_scheme=theme)

        if theme == 'dark':
            page.goto(url, wait_until='domcontentloaded')
        else:
            page.reload(wait_until='domcontentloaded')

        content_loaded = wait_for_content(page, selectors)

        if not content_loaded:
            print(f"  ⚠️  {theme} mode: Content slow to load, waiting...")
            time.sleep(2)

        screenshot_path = f'{SCREENSHOT_DIR}/{safe_name}-{theme}.png'
        page.screenshot(path=screenshot_path, full_page=True)

        # Check content length
        body_text = page.locator('body').inner_text().strip()
        results[f'{theme}_screenshot'] = screenshot_path
        results[f'{theme}_content_length'] = len(body_text)
        results[f'{theme}_has_content'] = len(body_text) > 50

        print(f"  {theme}: {'✅' if results[f'{theme}_has_content'] else '❌'} ({len(body_text)} chars)")

    return results


def run_tests():
    """Run visual tests on all pages."""
    os.makedirs(SCREENSHOT_DIR, exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={'width': 1280, 'height': 800},
            color_scheme='dark'
        )
        page = context.new_page()

        # Capture console errors
        errors = []
        page.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)

        results = []

        for path, name, selectors in PAGES_TO_TEST:
            print(f"Testing {name}...")
            url = f'{BASE_URL}{path}'
            result = capture_themed_screenshots(page, url, name, selectors)
            result['errors'] = list(errors)
            errors.clear()
            results.append(result)

        browser.close()

        # Summary
        print("\n" + "=" * 50)
        print("VISUAL TEST SUMMARY")
        print("=" * 50)

        passed = sum(1 for r in results
                     if r.get('dark_has_content') and r.get('light_has_content'))
        print(f"\nPassed: {passed}/{len(results)}")
        print(f"Screenshots: {SCREENSHOT_DIR}")

        return results


if __name__ == '__main__':
    run_tests()
```

---

## MCP vs Native Playwright Decision Tree

```
What are you doing?
│
├─ Interactive debugging / exploring
│  └─► Playwright MCP (see live browser)
│
├─ Automated test suite
│  └─► Native Python Playwright (headless)
│
├─ CI/CD pipeline
│  └─► Native Python Playwright (headless)
│
├─ Screenshot capture for LLM analysis
│  └─► Native Python Playwright (headless)
│
└─ One-off inspection
   └─► Either works, MCP is convenient
```

---

## Common Failures and Fixes

### Failure: Blank Screenshots
**Cause**: Screenshot taken before React hydrates
**Fix**: Wait for content selectors, add hydration buffer

### Failure: "Reconnecting..." Badge Visible
**Cause**: HMR/WebSocket not connected (cosmetic in tests)
**Fix**: This is often fine - focus on actual content

### Failure: Theme Not Applied
**Cause**: `emulate_media` called on context instead of page
**Fix**: Use `page.emulate_media(color_scheme='dark')`

### Failure: Browser Windows Spawning
**Cause**: `headless=False` or using MCP instead of native
**Fix**: Use `p.chromium.launch(headless=True)`

### Failure: Timeout on Content
**Cause**: Wrong selectors or page actually broken
**Fix**: Verify selectors exist, check console errors

---

## Integration with Claude Code

When Claude reads screenshots captured by this pattern:

1. **Request specific analysis**: Don't just show screenshot - ask targeted questions
2. **Provide context**: "This should be dark mode" or "This is the login page"
3. **Compare systematically**: Before/after, dark/light, desktop/mobile
4. **Trust semantic analysis**: LLM can tell "blank page" from "content loaded"

---

## References

### Research Papers
- [Using Vision LLMs For UI Testing](https://courses.cs.washington.edu/courses/cse503/25wi/final-reports/Using%20Vision%20LLMs%20For%20UI%20Testing.pdf) - University of Washington
- [Vision-driven Automated Mobile GUI Testing](https://arxiv.org/html/2407.03037v1) - Multimodal LLM approach
- [ScreenLLM: Stateful Screen Schema](https://arxiv.org/html/2503.20978v1) - UI understanding framework

### Tools & Integrations
- [Building an AI QA Engineer with Claude + Playwright](https://alexop.dev/posts/building_ai_qa_engineer_claude_code_playwright/)
- [AI-Powered Visual Testing in Playwright](https://testrig.medium.com/ai-powered-visual-testing-in-playwright-from-pixels-to-perception-dd3ee49911d5)
- [Playwright Visual Regression Testing Guide](https://testgrid.io/blog/playwright-visual-regression-testing/)

### Official Documentation
- [Playwright Visual Comparisons](https://playwright.dev/docs/test-snapshots)

---

## Version History

- **2026-01-23**: Initial skill creation
  - Researched multimodal LLM screenshot analysis best practices
  - Documented React hydration waiting patterns
  - Added headless mode requirements
  - Created complete test script template

---

**Core Insight**: The difference between useless and useful screenshot tests is waiting for content, not just network. LLMs can analyze semantics, but only if there's actually content to analyze.

---

---
name: security-auditor
description: Security vulnerability scanner and OWASP compliance auditor for codebases. Dependency scanning (npm audit, pip-audit), secret detection (high-entropy strings, API keys), SAST for injection/XSS
  vulnerabilities, and security posture reports. Activate on 'security audit', 'vulnerability scan', 'OWASP', 'secret detection', 'dependency check', 'CVE', 'security review', 'penetration testing prep'.
  NOT for runtime WAF configuration (use infrastructure tools), network security/firewalls, or compliance certifications like SOC2/HIPAA (legal/organizational).
allowed-tools: Read,Write,Edit,Bash(npm audit:*,pip-audit:*,grep:*,find:*),Grep,Glob
metadata:
  category: Code Quality & Testing
  pairs-with:
  - skill: devops-automator
    reason: Secure deployment pipelines
  - skill: mcp-creator
    reason: Secure MCP server development
  tags:
  - security
  - owasp
  - vulnerabilities
  - sast
  - dependencies
---

# Security Auditor

Comprehensive security scanning for codebases. Identifies vulnerabilities before they become incidents. Focuses on actionable findings with remediation guidance.

## When to Use

**Use for:**
- Pre-deployment security audits
- Dependency vulnerability scanning
- Secret/credential leak detection
- Code-level SAST (Static Application Security Testing)
- Security posture reports for stakeholders
- OWASP Top 10 compliance checking
- Pre-PR security reviews

**Do NOT use for:**
- Runtime security (WAF, rate limiting) - use infrastructure tools
- Network security/firewall rules - use cloud/DevOps skills
- SOC2/HIPAA/PCI compliance - requires legal/organizational process
- Penetration testing execution - this is detection, not exploitation

## Quick Start

### Full Security Audit
```bash
# Run comprehensive scan
./scripts/full-audit.sh /path/to/project

# Output: security-report.json + summary
```

### Quick Checks
```bash
# Dependency vulnerabilities only
npm audit --json > deps-audit.json

# Secret detection only
./scripts/detect-secrets.sh /path/to/project

# OWASP check specific file
./scripts/owasp-check.py /path/to/file.js
```

## Core Scanning Capabilities

### 1. Dependency Scanning

| Package Manager | Command | Severity Levels |
|-----------------|---------|-----------------|
| npm | `npm audit --json` | critical, high, moderate, low |
| yarn | `yarn audit --json` | same as npm |
| pip | `pip-audit --format json` | critical, high, medium, low |
| cargo | `cargo audit --json` | same |

**Decision Tree:**
```
Critical severity found?
├── YES → Block deployment, immediate fix required
│   └── Check if patch available → npm audit fix --force
├── NO → High severity?
    ├── YES → Fix within sprint, document if deferred
    └── NO → Low/Moderate → Track, fix during maintenance
```

### 2. Secret Detection

**High-Risk Patterns:**
- API keys: `/[A-Za-z0-9_]{20,}/` near "key", "api", "secret"
- AWS credentials: `AKIA[0-9A-Z]{16}`
- Private keys: `-----BEGIN (RSA|EC|OPENSSH) PRIVATE KEY-----`
- JWT tokens: `eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+`
- Connection strings: `://[^:]+:[^@]+@`

**Entropy Analysis:**
- Shannon entropy > 4.5 on strings > 20 chars = suspicious
- Base64-encoded blobs in source = investigate

**False Positive Handling:**
```
Secret-like pattern found?
├── In test file? → Lower severity, document
├── In example/docs? → Check if placeholder
├── High entropy + near "password"/"secret" → High confidence
└── In .env.example? → Acceptable if placeholder values
```

### 3. OWASP Top 10 Static Analysis

| # | Vulnerability | Detection Pattern |
|---|---------------|-------------------|
| A01 | Broken Access Control | Missing auth checks on routes |
| A02 | Cryptographic Failures | Weak algorithms (MD5, SHA1 for passwords) |
| A03 | Injection | Unparameterized queries, eval(), innerHTML |
| A04 | Insecure Design | Hardcoded credentials, missing rate limits |
| A05 | Security Misconfiguration | Debug mode in prod, default credentials |
| A06 | Vulnerable Components | Known CVEs in dependencies |
| A07 | Auth Failures | Weak password policies, session issues |
| A08 | Integrity Failures | Unsigned updates, untrusted deserialization |
| A09 | Logging Failures | Sensitive data in logs, missing audit trails |
| A10 | SSRF | Unvalidated URL inputs to fetch/request |

### 4. Language-Specific Checks

**JavaScript/TypeScript:**
- `eval()`, `new Function()` - code injection
- `innerHTML`, `outerHTML` - XSS vectors
- `document.write()` - DOM-based XSS
- `child_process.exec()` with user input - command injection
- Regex without timeout - ReDoS vulnerability

**Python:**
- `pickle.loads()` with untrusted data - arbitrary code execution
- `yaml.load()` without `Loader=SafeLoader` - code injection
- `subprocess.shell=True` - command injection
- `eval()`, `exec()` - code injection
- SQL string concatenation - SQL injection

**SQL:**
- String concatenation in queries - SQL injection
- `LIKE '%' + input + '%'` - injection via wildcards
- Missing parameterization - critical vulnerability

## Anti-Patterns

### Anti-Pattern: Security by Obscurity
**What it looks like**: "Nobody will find this hardcoded password"
**Why wrong**: Secrets in source always leak eventually
**Instead**: Environment variables, secret managers, zero hardcoded secrets

### Anti-Pattern: Audit Fatigue
**What it looks like**: 500 findings, all "medium", team ignores
**Why wrong**: Critical issues buried in noise
**Instead**: Prioritize by exploitability, start with critical/high only

### Anti-Pattern: Fix Without Understanding
**What it looks like**: `npm audit fix --force` without review
**Why wrong**: May introduce breaking changes, doesn't address root cause
**Instead**: Review each fix, understand the vulnerability, test after

### Anti-Pattern: One-Time Audit
**What it looks like**: "We did a security audit last year"
**Why wrong**: New CVEs daily, code changes constantly
**Instead**: CI/CD integration, weekly automated scans minimum

## Security Report Format

```json
{
  "summary": {
    "critical": 0,
    "high": 2,
    "medium": 5,
    "low": 12,
    "informational": 8
  },
  "findings": [
    {
      "id": "SEC-001",
      "severity": "high",
      "category": "A03:Injection",
      "title": "SQL Injection in user search",
      "location": "src/api/users.js:45",
      "description": "User input concatenated directly into SQL query",
      "evidence": "const query = `SELECT * FROM users WHERE name = '${input}'`",
      "remediation": "Use parameterized queries: db.query('SELECT * FROM users WHERE name = $1', [input])",
      "references": ["https://owasp.org/www-community/attacks/SQL_Injection"]
    }
  ],
  "recommendations": [
    "Implement parameterized queries across all database access",
    "Add input validation layer",
    "Enable SQL query logging for monitoring"
  ]
}
```

## CI/CD Integration

### GitHub Actions Example
```yaml
security-scan:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - name: Run security audit
      run: |
        npm audit --json > audit.json
        ./scripts/detect-secrets.sh . > secrets.json
        ./scripts/generate-report.py
    - name: Fail on critical
      run: |
        if jq '.summary.critical > 0' report.json; then
          echo "Critical vulnerabilities found!"
          exit 1
        fi
```

## Scripts (in `scripts/` folder)

| Script | Purpose |
|--------|---------|
| `full-audit.sh` | Comprehensive security scan |
| `detect-secrets.sh` | High-entropy string and pattern detection |
| `owasp-check.py` | OWASP Top 10 static analysis |
| `generate-report.py` | Combine findings into unified report |

## Expert vs Novice Approach

| Novice | Expert |
|--------|--------|
| Runs audit once before release | CI/CD integration, every commit |
| Focuses on tool output only | Understands vulnerability context |
| Fixes everything or nothing | Triages by exploitability |
| Uses one scanner | Layers multiple tools |
| Ignores false positives | Tunes detection rules |

## Success Metrics

| Metric | Target |
|--------|--------|
| Critical/High pre-production | 0 |
| Mean time to remediate critical | &lt; 24 hours |
| False positive rate | &lt; 10% |
| Scan coverage | 100% of deployable code |

## Reference Files

- `references/owasp-top-10-2024.md` - Detailed OWASP guidance
- `references/secret-patterns.md` - Comprehensive regex patterns
- `references/remediation-playbook.md` - Fix guidance by vulnerability type
- `references/ci-cd-templates.md` - Integration examples
- `scripts/` - Working security scanning scripts

---

**Detects**: Dependency CVEs | Secret leaks | Injection vulnerabilities | OWASP violations | Security misconfigurations

**Use with**: site-reliability-engineer (deployment gates) | code-review (PR security checks)

---

---
name: test-automation-expert
description: Comprehensive test automation specialist covering unit, integration, and E2E testing strategies. Expert in Jest, Vitest, Playwright, Cypress, pytest, and modern testing frameworks. Guides test
  pyramid design, coverage optimization, flaky test detection, and CI/CD integration. Activate on 'test strategy', 'unit tests', 'integration tests', 'E2E testing', 'test coverage', 'flaky tests', 'mocking',
  'test fixtures', 'TDD', 'BDD', 'test automation'. NOT for manual QA processes, load/performance testing (use performance-engineer), or security testing (use security-auditor).
allowed-tools: Read,Write,Edit,Bash(npm test:*,npx jest:*,npx vitest:*,npx playwright:*,pytest:*),Grep,Glob
metadata:
  category: Code Quality & Testing
  pairs-with:
  - skill: refactoring-surgeon
    reason: Tests before refactoring
  - skill: devops-automator
    reason: CI/CD test integration
  tags:
  - testing
  - jest
  - playwright
  - tdd
  - coverage
---

# Test Automation Expert

Comprehensive testing guidance from unit to E2E. Designs test strategies, implements automation, and optimizes coverage for sustainable quality.

## When to Use

**Use for:**
- Designing test strategy for new projects
- Setting up testing frameworks (Jest, Vitest, Playwright, Cypress, pytest)
- Writing effective unit, integration, and E2E tests
- Optimizing test coverage and eliminating gaps
- Debugging flaky tests
- CI/CD test pipeline configuration
- Test-Driven Development (TDD) guidance
- Mocking strategies and test fixtures

**Do NOT use for:**
- Manual QA test case writing - this is automation-focused
- Load/performance testing - use performance-engineer skill
- Security testing - use security-auditor skill
- API contract testing only - use backend-architect for API design

## Test Pyramid Philosophy

```
         /\
        /  \      E2E Tests (10%)
       /----\     - Critical user journeys
      /      \    - Cross-browser validation
     /--------\
    /          \  Integration Tests (20%)
   /            \ - API contracts
  /--------------\- Component interactions
 /                \
/------------------\ Unit Tests (70%)
                    - Fast, isolated, deterministic
                    - Business logic validation
```

### Distribution Guidelines

| Test Type | Percentage | Execution Time | Purpose |
|-----------|------------|----------------|---------|
| Unit | 70% | &lt; 100ms each | Logic validation |
| Integration | 20% | &lt; 1s each | Component contracts |
| E2E | 10% | &lt; 30s each | Critical paths |

## Framework Selection

### JavaScript/TypeScript

| Framework | Best For | Speed | Config Complexity |
|-----------|----------|-------|-------------------|
| **Vitest** | Vite projects, modern ESM | Fastest | Low |
| **Jest** | React, established projects | Fast | Medium |
| **Playwright** | E2E, cross-browser | N/A | Low |
| **Cypress** | E2E, component testing | N/A | Medium |

### Python

| Framework | Best For | Speed | Features |
|-----------|----------|-------|----------|
| **pytest** | Everything | Fast | Fixtures, plugins |
| **unittest** | Standard library | Medium | Built-in |
| **hypothesis** | Property-based | Varies | Generative |

### Decision Tree: Framework Selection

```
New project?
├── Yes → Using Vite?
│   ├── Yes → Vitest
│   └── No → Jest or Vitest (both work)
└── No → What exists?
    ├── Jest → Keep Jest (migration cost rarely worth it)
    ├── Mocha → Consider migration to Vitest
    └── Nothing → Vitest (modern default)

Need E2E?
├── Cross-browser critical → Playwright
├── Developer experience priority → Cypress
└── Both → Playwright (more flexible)
```

## Unit Testing Patterns

### Good Unit Test Anatomy

```javascript
describe('UserService', () => {
  describe('validateEmail', () => {
    // Arrange-Act-Assert pattern
    it('should accept valid email formats', () => {
      // Arrange
      const validEmails = ['user@example.com', 'name+tag@domain.co'];

      // Act & Assert
      validEmails.forEach(email => {
        expect(validateEmail(email)).toBe(true);
      });
    });

    it('should reject invalid email formats', () => {
      // Arrange
      const invalidEmails = ['invalid', '@missing.com', 'no@tld'];

      // Act & Assert
      invalidEmails.forEach(email => {
        expect(validateEmail(email)).toBe(false);
      });
    });

    // Edge cases explicitly tested
    it('should handle empty string', () => {
      expect(validateEmail('')).toBe(false);
    });

    it('should handle null/undefined', () => {
      expect(validateEmail(null)).toBe(false);
      expect(validateEmail(undefined)).toBe(false);
    });
  });
});
```

### Mocking Strategies

```javascript
// ✅ Good: Mock at boundaries
jest.mock('../services/api', () => ({
  fetchUser: jest.fn()
}));

// ✅ Good: Explicit mock setup per test
beforeEach(() => {
  fetchUser.mockReset();
});

it('handles user not found', async () => {
  fetchUser.mockRejectedValue(new NotFoundError());
  await expect(getUser(123)).rejects.toThrow('User not found');
});

// ❌ Bad: Mocking implementation details
jest.mock('../utils/internal-helper'); // Don't mock internals
```

### Test Isolation Checklist

- [ ] Each test can run independently
- [ ] No shared mutable state between tests
- [ ] Database/API state reset between tests
- [ ] No test order dependencies
- [ ] Parallel execution safe

## Integration Testing Patterns

### API Integration Test

```javascript
describe('POST /api/users', () => {
  let app;
  let db;

  beforeAll(async () => {
    db = await createTestDatabase();
    app = createApp({ db });
  });

  afterAll(async () => {
    await db.close();
  });

  beforeEach(async () => {
    await db.clear();
  });

  it('creates user with valid data', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({ name: 'Test', email: 'test@example.com' })
      .expect(201);

    expect(response.body).toMatchObject({
      id: expect.any(String),
      name: 'Test',
      email: 'test@example.com'
    });

    // Verify side effects
    const dbUser = await db.users.findById(response.body.id);
    expect(dbUser).toBeDefined();
  });

  it('rejects duplicate email', async () => {
    await db.users.create({ name: 'Existing', email: 'test@example.com' });

    await request(app)
      .post('/api/users')
      .send({ name: 'New', email: 'test@example.com' })
      .expect(409);
  });
});
```

### Component Integration (React)

```javascript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserProfile } from './UserProfile';
import { UserProvider } from '../context/UserContext';

describe('UserProfile integration', () => {
  it('loads and displays user data', async () => {
    render(
      <UserProvider>
        <UserProfile userId="123" />
      </UserProvider>
    );

    // Verify loading state
    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    // Wait for data
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Verify loaded state
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });
});
```

## E2E Testing Patterns

### Playwright Best Practices

```javascript
import { test, expect } from '@playwright/test';

test.describe('Checkout Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Seed test data via API
    await page.request.post('/api/test/seed', {
      data: { scenario: 'checkout-ready' }
    });
  });

  test('complete purchase with credit card', async ({ page }) => {
    await page.goto('/cart');

    // Use accessible selectors
    await page.getByRole('button', { name: 'Proceed to checkout' }).click();

    // Fill payment form
    await page.getByLabel('Card number').fill('4242424242424242');
    await page.getByLabel('Expiry').fill('12/25');
    await page.getByLabel('CVC').fill('123');

    // Complete purchase
    await page.getByRole('button', { name: 'Pay now' }).click();

    // Verify success
    await expect(page.getByRole('heading', { name: 'Order confirmed' })).toBeVisible();
    await expect(page.getByText(/Order #\d+/)).toBeVisible();
  });

  test('shows error for declined card', async ({ page }) => {
    await page.goto('/checkout');

    // Use test card that triggers decline
    await page.getByLabel('Card number').fill('4000000000000002');
    await page.getByLabel('Expiry').fill('12/25');
    await page.getByLabel('CVC').fill('123');

    await page.getByRole('button', { name: 'Pay now' }).click();

    await expect(page.getByRole('alert')).toContainText('Card declined');
  });
});
```

### Flaky Test Detection & Prevention

**Common Causes:**
1. Race conditions in async operations
2. Time-dependent tests
3. Shared state between tests
4. Network variability
5. Animation/transition timing

**Fixes:**

```javascript
// ❌ Bad: Fixed timeout
await page.waitForTimeout(2000);

// ✅ Good: Wait for specific condition
await expect(page.getByText('Loaded')).toBeVisible();

// ❌ Bad: Checking exact time
expect(new Date()).toEqual(specificDate);

// ✅ Good: Mock time
jest.useFakeTimers();
jest.setSystemTime(new Date('2024-01-15'));

// ❌ Bad: Depending on animation completion
await page.click('.button');
expect(await page.isVisible('.modal')).toBe(true);

// ✅ Good: Wait for animation
await page.click('.button');
await expect(page.locator('.modal')).toBeVisible();
```

## Coverage Optimization

### What to Measure

| Metric | Target | Priority |
|--------|--------|----------|
| Line coverage | 80%+ | Medium |
| Branch coverage | 75%+ | High |
| Function coverage | 90%+ | Medium |
| Critical path coverage | 100% | Critical |

### Coverage Configuration

```javascript
// vitest.config.js
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/index.ts', // barrel files
      ],
      thresholds: {
        branches: 75,
        functions: 80,
        lines: 80,
        statements: 80
      }
    }
  }
});
```

### Finding Coverage Gaps

```bash
# Generate detailed coverage report
npx vitest run --coverage

# Find untested files
npx vitest run --coverage --reporter=json | jq '.coverageMap | to_entries | map(select(.value.s | values | any(. == 0))) | .[].key'
```

## CI/CD Integration

### GitHub Actions

```yaml
name: Tests
on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm test -- --coverage
      - uses: codecov/codecov-action@v4

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

### Test Parallelization

```javascript
// vitest.config.js - parallel by default
export default defineConfig({
  test: {
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false
      }
    }
  }
});

// playwright.config.js
export default defineConfig({
  workers: process.env.CI ? 2 : undefined,
  fullyParallel: true
});
```

## Anti-Patterns

### Anti-Pattern: Testing Implementation Details

**What it looks like:**
```javascript
// ❌ Testing internal state
expect(component.state.isLoading).toBe(true);

// ❌ Testing private methods
expect(service._calculateHash()).toBe('abc123');
```

**Why wrong:** Couples tests to implementation, breaks on refactors

**Instead:**
```javascript
// ✅ Test observable behavior
expect(screen.getByRole('progressbar')).toBeInTheDocument();

// ✅ Test public interface
expect(service.getHash()).toBe('abc123');
```

### Anti-Pattern: Over-Mocking

**What it looks like:**
```javascript
// ❌ Mocking everything
jest.mock('../utils/format');
jest.mock('../utils/validate');
jest.mock('../utils/transform');
```

**Why wrong:** Tests pass even when real code is broken

**Instead:** Mock only at system boundaries (APIs, databases, external services)

### Anti-Pattern: Flaky Acceptance

**What it looks like:** "That test is just flaky, skip it"

**Why wrong:** Flaky tests indicate real problems (race conditions, timing issues)

**Instead:** Fix the flakiness or quarantine while fixing

### Anti-Pattern: Coverage Theater

**What it looks like:**
```javascript
// ❌ Testing for coverage, not behavior
it('covers the function', () => {
  myFunction();
  // No assertions!
});
```

**Why wrong:** 100% coverage with 0% confidence

**Instead:** Every test should assert meaningful behavior

## Quick Commands

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific file
npm test -- src/utils/format.test.ts

# Run in watch mode
npm test -- --watch

# Run E2E tests
npx playwright test

# Run E2E with UI
npx playwright test --ui

# Debug E2E test
npx playwright test --debug

# Update snapshots
npm test -- -u
```

## Reference Files

- `references/test-strategy.md` - Comprehensive test strategy framework
- `references/framework-comparison.md` - Detailed framework comparison
- `references/coverage-patterns.md` - Coverage optimization techniques
- `references/ci-integration.md` - CI/CD pipeline configurations

---

**Covers**: Test strategy | Unit testing | Integration testing | E2E testing | Coverage | CI/CD | Flaky test debugging

**Use with**: security-auditor (security tests) | performance-engineer (load tests) | code-reviewer (test quality)

---

---
name: vitest-testing-patterns
description: Write tests using Vitest and React Testing Library. Use when creating unit tests, component tests, integration tests, or mocking dependencies. Activates for test file creation, mock patterns,
  coverage, and testing best practices.
allowed-tools: Read,Write,Edit,Bash(npm:*,npx:*)
metadata:
  category: Code Quality & Testing
  tags:
  - testing
  - code
  - automation
  - jest
  - react
  pairs-with:
  - skill: test-automation-expert
    reason: Vitest unit testing is one layer in a comprehensive test automation strategy
  - skill: playwright-e2e-tester
    reason: Unit tests (Vitest) and E2E tests (Playwright) form complementary test pyramid layers
  - skill: react-performance-optimizer
    reason: Component test patterns verify that performance optimizations preserve correct behavior
  - skill: typescript-advanced-patterns
    reason: Type-safe test utilities and mock factories leverage advanced TypeScript patterns
---

# Vitest Testing Patterns

This skill helps you write effective tests using Vitest and React Testing Library following project conventions.

## When to Use

✅ **USE this skill for:**
- Writing unit tests for utilities and functions
- Creating component tests with React Testing Library
- Setting up mocks for API calls, databases, or external services
- Integration testing patterns
- Understanding test coverage and CI setup

❌ **DO NOT use for:**
- Jest-specific patterns → similar but check Jest docs for differences
- End-to-end testing → use Playwright or Cypress skills
- Performance testing → use dedicated performance tools
- API contract testing → use OpenAPI/Pact patterns

## Test Infrastructure

**Configuration**: `vitest.config.ts`
- Environment: jsdom
- Setup file: `src/test/setup.ts`
- Coverage: v8 provider

**Commands**:
```bash
npm test              # Watch mode
npm run test:run      # Single run
npm run test:coverage # With coverage
```

## File Organization

```
src/
├── app/api/__tests__/        # API route tests
├── components/__tests__/     # Component tests
├── lib/__tests__/            # Library/utility tests
└── lib/{feature}/__tests__/  # Feature-specific tests
```

Name tests as `{name}.test.ts` or `{name}.test.tsx`.

## Core Testing Patterns

### 1. API Route Tests

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from '../route';
import { NextRequest } from 'next/server';

// Mock dependencies
vi.mock('@/lib/auth', () => ({
  getSession: vi.fn(),
}));

vi.mock('@/db', () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockResolvedValue([]),
  },
}));

describe('GET /api/feature', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    vi.mocked(getSession).mockResolvedValue(null);

    const request = new NextRequest('http://localhost/api/feature');
    const response = await GET(request);

    expect(response.status).toBe(401);
  });

  it('returns data when authenticated', async () => {
    vi.mocked(getSession).mockResolvedValue({ userId: 'user-123' });
    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([{ id: '1', name: 'Test' }]),
      }),
    });

    const request = new NextRequest('http://localhost/api/feature');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveLength(1);
  });
});
```

### 2. Component Tests

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FeatureComponent } from '../FeatureComponent';

// Mock hooks
vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn().mockReturnValue({
    user: { id: 'user-123', name: 'Test User' },
    isLoading: false,
  }),
}));

describe('FeatureComponent', () => {
  it('renders loading state', () => {
    vi.mocked(useAuth).mockReturnValueOnce({
      user: null,
      isLoading: true,
    });

    render(<FeatureComponent />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('handles user interaction', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<FeatureComponent onSubmit={onSubmit} />);

    await user.type(screen.getByRole('textbox'), 'Test input');
    await user.click(screen.getByRole('button', { name: /submit/i }));

    expect(onSubmit).toHaveBeenCalledWith('Test input');
  });

  it('displays error state', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

    render(<FeatureComponent />);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/error/i);
    });
  });
});
```

### 3. Library/Utility Tests

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { processData, formatDate } from '../utils';

describe('processData', () => {
  it('transforms input correctly', () => {
    const input = { raw: 'data' };
    const result = processData(input);

    expect(result).toEqual({
      processed: true,
      data: 'DATA',
    });
  });

  it('throws on invalid input', () => {
    expect(() => processData(null)).toThrow('Invalid input');
  });
});

describe('formatDate', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-15T10:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('formats relative dates', () => {
    const yesterday = new Date('2025-01-14T10:00:00Z');
    expect(formatDate(yesterday)).toBe('yesterday');
  });
});
```

## Mocking Patterns

### Module Mocking

```typescript
// Mock entire module
vi.mock('@/lib/auth', () => ({
  getSession: vi.fn(),
  requireAuth: vi.fn(),
}));

// Mock with partial implementation
vi.mock('date-fns', async () => {
  const actual = await vi.importActual('date-fns');
  return {
    ...actual,
    format: vi.fn(() => '2025-01-15'),
  };
});

// Mock default export (like Anthropic SDK)
vi.mock('@anthropic-ai/sdk', () => ({
  default: class MockAnthropic {
    messages = {
      create: vi.fn().mockResolvedValue({
        content: [{ type: 'text', text: 'Mock response' }],
        usage: { input_tokens: 10, output_tokens: 20 },
      }),
    };
  },
}));
```

### Function Mocking

```typescript
// Create mock function
const mockFn = vi.fn();

// Set return values
mockFn.mockReturnValue('sync value');
mockFn.mockResolvedValue('async value');
mockFn.mockRejectedValue(new Error('Failed'));

// One-time behavior
mockFn.mockReturnValueOnce('first call only');

// Custom implementation
mockFn.mockImplementation((arg) => arg.toUpperCase());

// Verify calls
expect(mockFn).toHaveBeenCalled();
expect(mockFn).toHaveBeenCalledTimes(2);
expect(mockFn).toHaveBeenCalledWith('expected', 'args');
```

### Chained Mock Pattern (Drizzle ORM)

```typescript
vi.mock('@/db', () => ({
  db: {
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ id: '1' }]),
          }),
        }),
      }),
    }),
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([{ id: 'new-1' }]),
      }),
    }),
  },
}));
```

### Timer Mocking

```typescript
describe('debounced function', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('debounces calls', async () => {
    const callback = vi.fn();
    const debounced = debounce(callback, 300);

    debounced();
    debounced();
    debounced();

    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(300);

    expect(callback).toHaveBeenCalledTimes(1);
  });
});
```

## Query Priorities

Use queries in this order (most to least preferred):

1. **getByRole** - Accessible queries (buttons, links, headings)
2. **getByLabelText** - Form fields with labels
3. **getByPlaceholderText** - Inputs with placeholders
4. **getByText** - Non-interactive elements
5. **getByTestId** - Last resort (data-testid)

```typescript
// Preferred
screen.getByRole('button', { name: /submit/i });
screen.getByRole('heading', { level: 1 });
screen.getByLabelText(/email/i);

// Avoid unless necessary
screen.getByTestId('submit-button');
```

## Async Patterns

```typescript
// Wait for element to appear
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument();
});

// Find (built-in waitFor)
const element = await screen.findByText('Loaded');

// Wait for element to disappear
await waitFor(() => {
  expect(screen.queryByText('Loading')).not.toBeInTheDocument();
});
```

## Test Cleanup

```typescript
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();            // React cleanup (automatic with setup.ts)
  vi.clearAllMocks();   // Reset mock call counts
  vi.resetAllMocks();   // Reset mocks to initial state
  vi.restoreAllMocks(); // Restore original implementations
});
```

## Accessibility Testing

```typescript
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

it('has no accessibility violations', async () => {
  const { container } = render(<Component />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

## Common Matchers

```typescript
// jest-dom matchers (from setup.ts)
expect(element).toBeInTheDocument();
expect(element).toBeVisible();
expect(element).toBeDisabled();
expect(element).toHaveTextContent('text');
expect(element).toHaveAttribute('href', '/path');
expect(element).toHaveClass('active');
expect(input).toHaveValue('input value');
```

## References

- [Vitest Mocking Guide](https://vitest.dev/guide/mocking)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro)
- [Testing Library Queries](https://testing-library.com/docs/queries/about)

---

---
name: skill-documentarian
description: Documentation expert for Claude Skills showcase website. Maintains skill-to-website sync, manages tag taxonomy and badges, creates blog-style artifacts, and preserves multi-skill collaborations
  for posterity. Activate on 'document', 'sync skills', 'create artifact', 'validate skills', 'add tags', 'tag management', 'badge', 'metadata'. NOT for code implementation (use domain skills), design creation
  (use web-design-expert), testing (use test-automator), or project planning (use orchestrator).
allowed-tools: Read,Write,Edit,Glob,Grep,Bash,mcp__firecrawl__firecrawl_search,mcp__brave-search__brave_web_search
metadata:
  category: Content & Writing
  pairs-with:
  - skill: site-reliability-engineer
    reason: Ensure docs build correctly
  - skill: skill-coach
    reason: Document quality skills
  tags:
  - documentation
  - skills
  - sync
  - artifacts
  - metadata
---

You are the skill-documentarian, guardian of the Claude Skills showcase website. You ensure every skill in `.claude/skills/` has matching documentation, accurate metadata, proper tags, and that greatness is captured in artifacts.

## Core Mission

1. **Source of Truth**: `.claude/skills/` defines what exists. Website reflects it.
2. **README Maintainer**: Keep `README.md` accurate with skill counts, categories, and install instructions.
3. **Tag Taxonomy Owner**: Assign and maintain skill tags for discoverability.
4. **Badge Manager**: Track NEW/UPDATED badges with proper lifecycle.
5. **Artifact Creator**: Capture multi-skill collaborations in blog-style docs.
6. **Validation Enforcer**: Run scripts that catch drift and mismatches.
7. **Subpage Sync Guardian**: Ensure skill reference docs are exposed as browsable subpages.
8. **Category Enforcer**: Ensure every skill has a valid category for browse page filtering.

## Quick Reference: Key Files

| Purpose | Location |
|---------|----------|
| **Main README** | `README.md` (skill counts, categories, install instructions) |
| Skills data | `website/src/data/skills.ts` (ALL_SKILLS array) |
| Tag definitions | `website/src/types/tags.ts` |
| Skill metadata | `website/src/data/skillMetadata.json` |
| Skill docs | `website/docs/skills/*.md` or `website/docs/skills/*/` (folders with subpages) |
| Hero images | `website/static/img/skills/*-hero.png` |
| **OG image** | `website/static/img/og-image.png` (social preview) |
| OG background | `website/static/img/og-background_*.png` (Ideogram-generated) |
| OG generator | `website/scripts/generate-og-image.sh` |
| Artifacts | `website/src/data/artifacts/` |
| Subpage sync | `website/scripts/syncSkillSubpages.ts` |

## Automated Sync (Pre-commit Hooks)

The pre-commit hook automatically:
- **Validates README.md** skill counts match actual skill count
- Syncs SKILL.md frontmatter → doc file SkillHeader
- Regenerates `skillMetadata.json` with git dates
- **Regenerates OG image** with updated skill count (pixel art + Press Start 2P font)
- Validates angle brackets in markdown
- Auto-adds changed files to commit

**Manual batch sync**: `cd website && npm run sync:skills`
**Manual README sync**: `cd website && npm run sync:readme`
**Manual subpage sync**: `cd website && npm run sync:subpages`
**Manual OG image**: `cd website && bash scripts/generate-og-image.sh`

## OG Image Maintenance (Social Preview)

The OG image (`og-image.png`) is the social media preview shown when sharing the site on Twitter, LinkedIn, Facebook, etc.

### How It Works

1. **Background**: Pixel art generated by Ideogram (Windows 3.1 + vaporwave aesthetic)
2. **Text overlay**: ImageMagick composites text using Press Start 2P font
3. **Dynamic count**: Reads skill count from `skillMetadata.json`
4. **Auto-update**: Pre-commit hook regenerates when skills change

### Dependencies

- **ImageMagick**: `brew install imagemagick`
- **Press Start 2P font**: Install from [Google Fonts](https://fonts.google.com/specimen/Press+Start+2P) to `~/Library/Fonts/`
- **Node.js**: For reading skill count from JSON

### Regenerating Background

If the background needs updating (style refresh, etc.):

```bash
# Use Ideogram to generate new background
mcp__ideogram__generate_image  # Windows 3.1 + vaporwave aesthetic

# Save to: website/static/img/og-background_TIMESTAMP.png
# Update BG_IMAGE path in scripts/generate-og-image.sh
```

### Manual Generation

```bash
cd website
bash scripts/generate-og-image.sh
# Output: static/img/og-image.png
```

## Subpage Sync (Ancillary Documentation)

Skills with `references/`, `templates/`, `examples/`, or `guides/` folders get their markdown files exposed as browsable subpages in the documentation.

### How It Works

1. **Detection**: Script scans `.claude/skills/*/` for supported subfolders
2. **Conversion**: Flat `skill_name.md` becomes folder `skill_name/index.md`
3. **Sync**: Markdown files from source subfolders are copied to doc subfolders
4. **Frontmatter**: Auto-generated if missing (title, sidebar_label, sidebar_position)
5. **Safety**: Angle brackets escaped to prevent MDX compilation errors

### Folder Structure

```
.claude/skills/hr-network-analyst/          website/docs/skills/hr_network_analyst/
├── SKILL.md                          →     ├── index.md (main skill page)
├── references/                             ├── references/
│   ├── data-sources.md               →     │   ├── _category_.json
│   └── graph-metrics.md              →     │   ├── data-sources.md
└── guides/                                 │   └── graph-metrics.md
    └── quickstart.md                 →     └── guides/
                                                ├── _category_.json
                                                └── quickstart.md
```

### Run Subpage Sync

```bash
# During prebuild (automatic)
npm run prebuild  # Includes subpage sync

# Manual sync
npm run sync:subpages

# Or directly
npx tsx scripts/syncSkillSubpages.ts
```

### Docusaurus Doc IDs

Folder-based docs have IDs like `skills/skill_name/skill_name` (not `/index`).
When updating `sidebars.ts`, use the skill folder name twice:
```typescript
// ✅ Correct
'skills/hr_network_analyst/hr_network_analyst'

// ❌ Wrong
'skills/hr_network_analyst/index'
```

## Adding a New Skill to Website

```bash
# 1. Create doc file
touch website/docs/skills/skill_name.md  # Note: underscores!

# 2. Add to ALL_SKILLS array in skills.ts
{
  id: 'skill-name',
  title: 'Skill Title',
  category: 'Category Name',
  path: '/docs/skills/skill_name',
  description: 'Brief description',
  tags: ['tag1', 'tag2', 'tag3'],
  badge: 'NEW'  // Optional
}

# 3. Generate hero image
mcp__ideogram__generate_image  # Windows 3.1 + vaporwave aesthetic

# 4. Verify sync
echo "Skills: $(ls -d .claude/skills/*/ | wc -l)"
echo "In skills.ts: $(grep "{ id:" website/src/data/skills.ts | wc -l)"
```

## Tag Management

**3-5 tags per skill** from these types:
- **Skill Type** (purple): research, analysis, creation, coaching, validation, automation, orchestration
- **Domain** (blue): design, code, ml, cv, audio, 3d, robotics, photography, finance, health, devops...
- **Complexity** (orange): beginner-friendly, advanced, production-ready
- **Integration** (pink): mcp, elevenlabs, accessibility

**Full taxonomy**: See `references/tag-taxonomy.md`

## Badge Management

| Badge | Criteria | Duration |
|-------|----------|----------|
| `NEW` | First published | ~60 days |
| `UPDATED` | 50%+ content expansion | ~30 days |

**Full details**: See `references/badge-metadata-management.md`

## Artifact Creation

Create artifacts when:
- Multi-skill collaboration produces something cool
- New pattern emerges (first time X + Y work together)
- Interactive feature demonstrates capabilities

**Structure**: See `references/artifact-structure.md`
**Preservation guide**: See `guides/ARTIFACT_PRESERVATION.md`

## README Maintenance

The main `README.md` must stay in sync with actual skill inventory. Key sections:

1. **Skill count** in header: "46+ production-ready skills"
2. **Category tables** with accurate skill lists
3. **MCP server configs** with correct JSON
4. **Install instructions** for marketplace, manual, and download options

**Validation check**:
```bash
# Count actual skills vs README claim
ACTUAL=$(ls -d .claude/skills/*/ 2>/dev/null | wc -l | tr -d ' ')
echo "Actual skills: $ACTUAL"

# Check if README needs update (look for skill count pattern)
grep -E '\d+\+? production-ready skills' README.md
```

**When README needs updating**:
- New skill added to `.claude/skills/`
- Skill renamed or removed
- Category reorganization
- MCP server changes
- Install method changes

## Frontmatter Validation (CRITICAL)

When skills are uploaded to Claude's skill marketplace, **only these frontmatter keys are allowed**:
- `name` - Required, lowercase-hyphenated
- `description` - Required, includes activation keywords and NOT clause
- `license` - Optional (e.g., "MIT")
- `allowed-tools` - Comma-separated tool names
- `metadata` - Optional object for custom key-value pairs

**Invalid keys will cause upload failure:**
```
❌ integrates_with, triggers, tools, outputs, coordinates_with, python_dependencies
❌ Any custom YAML keys in frontmatter
```

**Move custom info to the skill body instead:**
```markdown
## Integrations
Works with: orchestrator, team-builder, swift-executor

## Triggers
Activates on: "document", "sync skills", "create artifact"
```

**Validation command:**
```bash
# Find skills with invalid frontmatter keys
for skill in .claude/skills/*/SKILL.md; do
  invalid=$(sed -n '/^---$/,/^---$/p' "$skill" | grep -E "^[a-zA-Z_-]+:" | cut -d: -f1 | grep -vE "^(name|description|license|allowed-tools|metadata)$")
  if [ -n "$invalid" ]; then
    echo "=== $(dirname "$skill" | xargs basename) ==="
    echo "$invalid"
  fi
done
```

## Category Validation (CRITICAL)

Skills **must** have a valid category for the browse page to be useful. Invalid or missing categories make skills invisible to users filtering by category.

### Valid Categories

| Category | Emoji | Description |
|----------|-------|-------------|
| AI & Machine Learning | 🤖 | ML models, computer vision, NLP, embeddings |
| Code Quality & Testing | ✅ | Testing, code review, refactoring, security |
| Content & Writing | ✍️ | Documentation, technical writing, diagrams |
| Data & Analytics | 📊 | Data pipelines, analytics, visualization |
| Design & Creative | 🎨 | UI/UX, graphics, audio, visual design |
| DevOps & Site Reliability | ⚙️ | CI/CD, infrastructure, monitoring |
| Business & Monetization | 💰 | Entrepreneurship, finance, marketing |
| Research & Analysis | 🔬 | Research, competitive analysis |
| Productivity & Meta | 🚀 | Workflow, orchestration, skill management |
| Lifestyle & Personal | 🧘 | Health, coaching, personal development |

### Category Validation Command

```bash
# Check all skills have valid categories
VALID_CATS="AI & Machine Learning|Code Quality & Testing|Content & Writing|Data & Analytics|Design & Creative|DevOps & Site Reliability|Business & Monetization|Research & Analysis|Productivity & Meta|Lifestyle & Personal"

for skill in .claude/skills/*/SKILL.md; do
  cat=$(grep -m1 "^category:" "$skill" | sed 's/category: *//')
  if [ -z "$cat" ]; then
    echo "❌ MISSING category: $(dirname "$skill" | xargs basename)"
  elif ! echo "$cat" | grep -qE "^($VALID_CATS)$"; then
    echo "❌ INVALID category '$cat': $(dirname "$skill" | xargs basename)"
  fi
done && echo "✅ All categories valid"
```

### When to Validate Categories

- **Before accepting skill submissions** (automated workflow checks this)
- **After running `npm run skills:generate`** (regenerates skills.ts)
- **When browse page filtering seems broken**

### Fixing Invalid Categories

1. Edit the skill's `SKILL.md` frontmatter
2. Change `category:` to one of the 10 valid values above
3. Run `cd website && npm run skills:generate` to regenerate skills.ts
4. Verify on browse page at `/skills`

## Validation Commands

```bash
# Find skills missing from skills.ts
for skill in .claude/skills/*/; do
  name=$(basename "$skill")
  grep -q "id: '$name'" website/src/data/skills.ts || echo "Missing: $name"
done

# Find skills without hero images
for skill in .claude/skills/*/; do
  name=$(basename "$skill")
  [ -f "website/static/img/skills/$name-hero.png" ] || echo "No hero: $name"
done

# Count badge usage
echo "NEW: $(grep "badge: 'NEW'" website/src/data/skills.ts | wc -l)"
echo "UPDATED: $(grep "badge: 'UPDATED'" website/src/data/skills.ts | wc -l)"

# Validate README skill count
ACTUAL=$(ls -d .claude/skills/*/ 2>/dev/null | wc -l | tr -d ' ')
README_COUNT=$(grep -oE '\d+\+? production-ready skills' README.md | grep -oE '\d+' | head -1)
[ "$ACTUAL" -gt "$README_COUNT" ] && echo "⚠️  README outdated: $ACTUAL skills exist, README says $README_COUNT"

# Find skills with subfolders not yet synced
for skill in .claude/skills/*/; do
  name=$(basename "$skill")
  docname="${name//-/_}"
  for sub in references templates examples guides; do
    if [ -d "$skill$sub" ]; then
      [ -d "website/docs/skills/$docname/$sub" ] || echo "Missing subpages: $name/$sub"
    fi
  done
done
```

## When to Use This Skill

**Use for:**
- Keeping README.md accurate (skill counts, categories, install instructions)
- Assigning and updating skill tags
- **Validating skill categories** (ensure browse page filtering works)
- Creating artifact documentation
- Validating skill-to-website sync
- Generating hero images
- **Maintaining OG image** (social preview with dynamic skill count)
- Writing changelogs and API docs
- Managing NEW/UPDATED badges
- Syncing skill subpages (references, guides, templates, examples)

**Do NOT use for:**
- Writing code (use domain-specific skills)
- Creating designs (use web-design-expert)
- Testing (use test-automator)
- Project planning (use orchestrator, team-builder)

## Anti-Patterns

### Anti-Pattern: Code Comments as Documentation
**What it looks like**: "The code is self-documenting"
**Why it's wrong**: Code shows HOW, not WHY. Comments for implementers, docs for users.
**Instead**: Separate code comments from user documentation.

### Anti-Pattern: Stale Documentation
**What it looks like**: Docs describe features that no longer exist
**Why it's wrong**: Erodes trust, wastes user time
**Instead**: Version docs with code, add timestamps, run CI checks.

### Anti-Pattern: Wall of Text
**What it looks like**: Dense paragraphs with no structure
**Why it's wrong**: Intimidating, unscannable
**Instead**: Headers, lists, code examples, diagrams.

### Anti-Pattern: Assuming Context
**What it looks like**: "Just run the script and it works"
**Why it's wrong**: Assumes reader knows which script, where, what args
**Instead**: Exact commands, full paths, expected output.

## Reference Files

- `references/tag-taxonomy.md` - Complete tag type reference
- `references/documentation-templates.md` - README, tutorial, API templates
- `references/badge-metadata-management.md` - Badge lifecycle and metadata
- `references/artifact-structure.md` - Artifact JSON schema and workflow
- `guides/ARTIFACT_PRESERVATION.md` - Complete preservation guide
- `guides/ARTIFACT_QUICKREF.md` - Quick checklist

## Documentation Quality Rules

**5-Minute Rule**: Can someone unfamiliar understand basics in 5 minutes?
**6-Month Rule**: Will YOU understand this in 6 months without context?

---

**Remember**: Documentation is a love letter to your future self and your users. Write it with care, maintain it with discipline, and it will compound value over time.

---

---
name: data-viz-2025
description: State-of-the-art data visualization for React/Next.js/TypeScript with Tailwind CSS. Creates compelling, tested, and accessible visualizations following Tufte principles and NYT Graphics standards.
  Activate on "data viz", "chart", "graph", "visualization", "dashboard", "plot", "Recharts", "Nivo", "D3". NOT for static images, print graphics, or basic HTML tables.
allowed-tools: Read,Write,Edit,Bash
metadata:
  category: Data & Analytics
  tags:
  - data
  - viz
  - '2025'
  - data-viz
  - chart
  pairs-with:
  - skill: react-performance-optimizer
    reason: Large dataset visualizations require React performance optimization for smooth rendering
  - skill: large-scale-map-visualization
    reason: Map visualizations are a specialized subset of the broader data viz discipline
  - skill: color-contrast-auditor
    reason: Data visualization accessibility depends on proper color contrast in charts and legends
  - skill: typescript-advanced-patterns
    reason: Type-safe chart data structures and generic visualization components benefit from advanced TS
---

# Data Visualization 2025: The Art & Science of Visual Communication

Create visualizations that Seaborn users, Tufte readers, and everyone else will love. Marry NYT Graphics rigor with MoMA aesthetics, Nike energy, and On Kawara precision.

## When to Use This Skill

✅ **Use for:**
- Building interactive charts, dashboards, and data stories
- Complex visualizations (chord diagrams, Sankey flows, network graphs)
- Real-time data displays with animations
- Mobile-responsive data components
- Accessible, tested visualizations for production

❌ **NOT for:**
- Static PNG/SVG exports without interaction (use design tools)
- Basic HTML tables (use semantic markup)
- Print-only graphics (different constraints)
- Simple icon displays (use icon libraries)

## Core Philosophy: The Three Pillars

### 1. **Clarity** (Tufte's Data-Ink Ratio)
Every visual element must earn its place. Remove chart junk, maximize signal-to-noise.

### 2. **Beauty** (Aesthetic Standards)
Visualizations are art. Use spring physics, thoughtful color, and premium design systems.

### 3. **Truth** (Graphical Integrity)
Data representation must be honest. Test rigorously, document assumptions, preserve context.

## Quick Decision Tree

```
What are you building?
├─ Exploratory analysis / many iterations
│  └─ → Observable Plot (grammar-of-graphics)
│
├─ Standard business charts (bars, lines, pies)
│  ├─ Simple React integration needed
│  │  └─ → Recharts (easiest, most popular)
│  └─ Premium aesthetics + theming
│     └─ → Nivo (beautiful out of the box)
│
├─ Custom, one-of-a-kind visualizations
│  ├─ Need low-level control
│  │  └─ → Visx (React + D3 primitives)
│  └─ Full D3 power
│     └─ → D3.js directly (steeper learning curve)
│
└─ Dashboard with Tailwind design system
   ├─ → Tremor (purpose-built for dashboards)
   └─ → shadcn-ui Charts (Recharts + shadcn styling)
```

## The Data Viz Stack (2025)

### Recommended Packages

```json
{
  "dependencies": {
    "@observablehq/plot": "^0.6.0",        // Exploratory, grammar-of-graphics
    "recharts": "^2.12.0",                  // React charts, simple & popular
    "@nivo/core": "^0.87.0",                // Beautiful, themeable charts
    "@visx/visx": "^3.10.0",                // Low-level D3 + React primitives
    "d3": "^7.9.0",                         // Direct D3 for custom work
    "@tremor/react": "^3.15.0",             // Tailwind dashboard components
    "framer-motion": "^11.0.0"              // Smooth animations
  },
  "devDependencies": {
    "@percy/cli": "^1.29.0",                // Visual regression testing
    "@testing-library/react": "^14.2.0",    // Component testing
    "@storybook/react": "^7.6.0"            // Component playground
  }
}
```

### When to Use Each Library

**Observable Plot** - You want ggplot2/Vega-Lite in JavaScript
- Grammar-of-graphics approach (marks, scales, transforms)
- Perfect for rapid prototyping
- Great for notebooks and exploratory analysis

**Recharts** - You want it to "just work" in React
- Component-based (everything is a `<Component />`)
- Excellent documentation and community
- TypeScript support built-in
- Smallest learning curve

**Nivo** - You want visually stunning results
- 20+ chart types with beautiful defaults
- Canvas, SVG, and HTML rendering
- Server-side rendering support (unique feature)
- Extensive customization via props

**Visx** - You want maximum control with React patterns
- Low-level primitives (scales, axes, shapes)
- Compose your own chart types
- Airbnb's D3 + React toolkit
- Best for novel visualizations

**D3.js** - You want unlimited power (and responsibility)
- Full control over every pixel
- Steepest learning curve
- Best for advanced, custom work
- Use with `useEffect` and `useRef` in React

## The Tufte Checklist

Before shipping any visualization, verify:

- [ ] **Data-ink ratio maximized** - Remove gridlines, decorations, 3D effects, shadows
- [ ] **Graphical integrity** - Visual representation proportional to data values
- [ ] **Clear labeling** - Direct labels on data (not legends requiring color matching)
- [ ] **No chart junk** - No unnecessary ornamentation or Moiré vibration
- [ ] **Layered information** - Use small multiples instead of overloaded single charts
- [ ] **Show data variation, not design variation** - Consistent visual encoding

Read `references/tufte-principles.md` for deep dive.

## The NYT Graphics Workflow

The New York Times graphics team process:

1. **Make 500 charts** → Pick the one that displays information best
2. **Simplify within reason** → Remove noise and clutter
3. **Annotate with insight** → Words should highlight patterns, not just describe data
4. **Test with real users** → Watch people interact, identify confusion
5. **Responsive by default** → Mobile-first, progressive enhancement

Read `references/nyt-workflow.md` for case studies.

## Animation & Micro-interactions

Data viz isn't static. Movement communicates:

### When to Animate
- **State transitions** - Data updates, filter changes
- **Draw attention** - Highlight insights, guide the eye
- **Show relationships** - Morphing between views reveals structure
- **Delight** - Thoughtful motion = premium feel

### Animation Principles
```typescript
// Use spring physics, not linear easing
const springConfig = {
  type: "spring",
  stiffness: 300,
  damping: 30
};

// Stagger for multiple elements
const staggerChildren = {
  delayChildren: 0.1,
  staggerChildren: 0.05
};

// Respect prefers-reduced-motion
const shouldAnimate = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
```

Read `references/animation-patterns.md` for complete patterns library.

## Color: Beyond the Rainbow

### Semantic Color Systems
```typescript
// Qualitative (categorical data)
const categorical = [
  "#d97706", "#7c3aed", "#059669", "#dc2626", "#2563eb"
];

// Sequential (ordered data, low to high)
const sequential = [
  "#fef3c7", "#fcd34d", "#f59e0b", "#d97706", "#92400e"
];

// Diverging (data with meaningful center)
const diverging = [
  "#dc2626", "#f87171", "#fef2f2", "#c7d2fe", "#6366f1"
];
```

### Accessibility Requirements
- **Contrast ratio ≥4.5:1** for text on backgrounds
- **Don't rely on color alone** - Use shapes, patterns, labels
- **Colorblind-safe palettes** - Test with simulators
- **Consider dark mode** - Colors must work in both themes

## Testing Data Visualizations

### Visual Regression Testing
```bash
# Percy - Automated visual testing
npx percy snapshot ./storybook-static

# Chromatic - For Storybook
npx chromatic --project-token=<token>
```

### Data Accuracy Testing
```typescript
// Verify rendered elements match data
test('bar chart renders correct number of bars', () => {
  const data = [{ x: 'A', y: 10 }, { x: 'B', y: 20 }];
  render(<BarChart data={data} />);

  const bars = screen.getAllByTestId('bar');
  expect(bars).toHaveLength(2);
});

// Verify scale accuracy
test('bar heights proportional to values', () => {
  const data = [{ x: 'A', y: 10 }, { x: 'B', y: 20 }];
  render(<BarChart data={data} />);

  const bars = screen.getAllByTestId('bar');
  const heights = bars.map(b => parseInt(b.style.height));
  expect(heights[1]).toBe(heights[0] * 2); // B is 2x A
});
```

Read `references/testing-strategies.md` for comprehensive test suites.

## Responsive Design Patterns

### Mobile-First Approach
```typescript
// Desktop: Show everything
// Tablet: Simplify axes, reduce labels
// Mobile: Minimal chart, key insights only

const ChartResponsive = ({ data }: Props) => {
  const isMobile = useMediaQuery('(max-width: 640px)');

  return (
    <ResponsiveContainer width="100%" height={isMobile ? 200 : 400}>
      <LineChart data={data}>
        {!isMobile && <CartesianGrid strokeDasharray="3 3" />}
        <XAxis
          dataKey="date"
          tick={isMobile ? { fontSize: 10 } : undefined}
          interval={isMobile ? 'preserveStartEnd' : 'auto'}
        />
        <YAxis tick={isMobile ? false : undefined} />
        <Tooltip />
        <Line type="monotone" dataKey="value" stroke="#d97706" />
      </LineChart>
    </ResponsiveContainer>
  );
};
```

### Touch-Friendly Interactions
- **Minimum touch target: 44×44px** - Tooltips, buttons, interactive elements
- **Swipe gestures** - Navigate time series, change views
- **Pinch-to-zoom** - For dense charts (use carefully)
- **Long-press context menus** - Advanced actions

## Data Storytelling

Every visualization tells a story. Follow the narrative arc:

1. **Hook** - What's the surprising insight?
2. **Context** - Why should we care?
3. **Evidence** - Show the data clearly
4. **Conclusion** - What should we do?

### Narrative Techniques
- **Scrollytelling** - Charts animate as user scrolls
- **Progressive disclosure** - Start simple, reveal complexity
- **Annotations** - Point out the insight, don't make users hunt
- **Comparison** - Show before/after, us vs. them, expected vs. actual

Read `references/data-storytelling.md` for narrative frameworks.

## Common Anti-Patterns

### ❌ The "Rainbow Vomit" Pie Chart
**Problem:** 12 colors, tiny slices, legend on the side
**Solution:** Max 5 categories, direct labels, consider bar chart instead

### ❌ The "Misleading Axis" Bar Chart
**Problem:** Y-axis doesn't start at zero, exaggerates differences
**Solution:** Always start at zero for bar charts (lines can vary)

### ❌ The "Dual-Axis Confusion" Line Chart
**Problem:** Two Y-axes with different scales mislead viewers
**Solution:** Use separate charts or normalize to same scale

### ❌ The "3D Perspective" Lie
**Problem:** 3D effects distort data perception
**Solution:** Stick to 2D, use color/size for third dimension

### ❌ The "Spinner of Death" Loading State
**Problem:** Empty screen with spinner for 2+ seconds
**Solution:** Skeleton loading that shows chart structure immediately

Read `references/antipatterns.md` for exhaustive catalog.

## Implementation Workflow

### 1. Explore Your Data
```bash
# Use Observable Plot for rapid iteration
npm install @observablehq/plot

# Create throwaway prototypes, iterate fast
# When you find the right chart, implement in production library
```

### 2. Build Production Component
```typescript
// Use Recharts for standard charts
// Use Nivo for beautiful, themeable charts
// Use Visx/D3 for custom visualizations

// Always wrap in error boundaries
// Always show skeleton loading state
// Always handle empty/loading/error states
```

### 3. Test Thoroughly
```bash
# Visual regression testing
npx percy snapshot

# Component testing
npm test -- --coverage

# Accessibility testing
npx axe-core src/components/charts
```

### 4. Document & Deploy
```typescript
// Storybook for component playground
// Props documentation with TypeScript
// Usage examples for each chart type
```

## AI-Enhanced Visualizations

### When to Use Claude/Haiku
- **Dynamic annotations** - Generate insights from data
- **Color palette suggestions** - AI-powered color harmony
- **Chart type recommendations** - "What's the best way to show this?"
- **Accessibility descriptions** - Auto-generate alt text

### Example: AI Annotation
```typescript
const generateInsight = async (data: DataPoint[]) => {
  const response = await fetch('/api/claude', {
    method: 'POST',
    body: JSON.stringify({
      model: 'claude-haiku',
      prompt: `Analyze this data and provide ONE key insight (max 15 words): ${JSON.stringify(data)}`
    })
  });

  return response.text(); // "Sales peaked in Q3, driven by mobile conversions"
};
```

## Inspiration Galleries

**Study these regularly:**
- [ObservableHQ Featured Notebooks](https://observablehq.com/@observablehq/explore-featured-collections)
- [Information is Beautiful Awards](https://www.informationisbeautifulawards.com/)
- [NYT Graphics on Twitter](https://twitter.com/nytgraphics)
- [FlowingData](https://flowingdata.com/)
- [Datawrapper River](https://river.datawrapper.de/)
- [The Pudding](https://pudding.cool/)

## Performance Optimization

### Bundle Size Management
```typescript
// ❌ DON'T import entire library
import { LineChart } from 'recharts';

// ✅ DO tree-shake where possible
import LineChart from 'recharts/lib/chart/LineChart';

// Use dynamic imports for heavy charts
const HeavyChart = dynamic(() => import('./HeavyChart'), {
  loading: () => <ChartSkeleton />,
  ssr: false // Disable SSR for client-only charts
});
```

### Canvas vs SVG
- **SVG** - Better for &lt; 1000 data points, accessibility, crisp at any scale
- **Canvas** - Better for > 1000 data points, animations, performance
- **WebGL** - Best for > 10,000 data points, 3D, gaming-level performance

### Virtualization
For large datasets, render only visible portion:
```typescript
// Use react-window or react-virtualized for long lists
// Aggregate/sample data for chart display
// Store full dataset separately for export
```

## Accessibility Standards (WCAG AA)

### Requirements
- **Keyboard navigation** - All interactive elements accessible via Tab
- **Screen reader support** - Provide data tables as alternative
- **Focus indicators** - Visible focus states for interactive elements
- **Color contrast** - ≥4.5:1 for small text, ≥3:1 for large text
- **Reduced motion** - Respect `prefers-reduced-motion: reduce`

### Implementation
```typescript
<figure role="img" aria-labelledby="chart-title chart-desc">
  <h2 id="chart-title">Sales Over Time</h2>
  <p id="chart-desc">
    Line chart showing sales increased 45% from Q1 to Q4,
    peaking in November at $2.3M.
  </p>

  <LineChart data={data} />

  {/* Provide data table alternative */}
  <details>
    <summary>View data table</summary>
    <table>...</table>
  </details>
</figure>
```

## Reference Materials

This skill includes comprehensive reference documentation:

- **`references/tufte-principles.md`** - Edward Tufte's data visualization principles with examples
- **`references/library-comparison.md`** - Deep dive on Observable Plot, Recharts, Nivo, Visx, D3
- **`references/testing-strategies.md`** - Visual regression, component testing, accessibility testing
- **`references/animation-patterns.md`** - Motion design patterns for charts
- **`references/data-storytelling.md`** - Narrative techniques and scrollytelling patterns
- **`references/antipatterns.md`** - Common mistakes and how to avoid them
- **`references/nyt-workflow.md`** - New York Times graphics team best practices

## Utility Scripts

- **`scripts/data-transform.ts`** - Common data transformations (rollup, pivot, normalize)
- **`scripts/chart-test-helpers.ts`** - Testing utilities for verifying chart accuracy
- **`scripts/color-palette-generator.ts`** - Generate accessible color palettes
- **`scripts/performance-benchmark.ts`** - Benchmark chart rendering performance

## Quick Start: Building Your First Chart

```typescript
// 1. Install dependencies
// npm install recharts framer-motion

// 2. Create a simple line chart
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const data = [
  { month: 'Jan', value: 400 },
  { month: 'Feb', value: 300 },
  { month: 'Mar', value: 600 },
];

export const SalesChart = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#d97706"
          strokeWidth={2}
          dot={{ fill: '#d97706', r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
});

// 3. Test it
// 4. Ship it with confidence
```

---

**Remember:** The best visualization is the one that makes the insight obvious. When in doubt, simplify. When confused, prototype 10 options. When shipping, test ruthlessly.

This skill guides: Chart selection | Library integration | Testing strategies | Animation patterns | Accessibility compliance | Performance optimization

---

---
name: ux-friction-analyzer
description: Comprehensive UX analysis using cognitive psychology, ADHD-friendly design, Gestalt principles, and flow state engineering. Specializes in friction audits, user journey simulation, cognitive
  load optimization, and Fitts' Law application. Activate on "analyze UX", "friction audit", "user journey", "ADHD-friendly", "optimize flow", "reduce cognitive load", "UX audit", "conversion optimization".
  NOT for visual design execution (use web-design-expert), A/B testing implementation (use frontend-developer), or accessibility compliance auditing (use accessibility-auditor).
allowed-tools: Read,Write,Edit,WebFetch
metadata:
  category: Design & Creative
  pairs-with:
  - skill: web-design-expert
    reason: Implement UX recommendations
  - skill: adhd-design-expert
    reason: Deep neurodivergent design patterns
  - skill: frontend-developer
    reason: Technical implementation of UX fixes
  tags:
  - ux
  - accessibility
  - cognitive-load
  - adhd-friendly
  - user-research
---

# UX Friction Analyzer

A comprehensive skill for analyzing and optimizing user experience through cognitive psychology, ADHD-friendly design, and flow state engineering.

## Activation

Use this skill when:
- Designing new interfaces or user flows
- Auditing existing UX for friction points
- Optimizing for neurodivergent users (ADHD, autism)
- Simulating user journeys before building
- Reducing cognitive load in complex applications

Trigger phrases: "analyze UX", "friction audit", "user journey", "ADHD-friendly", "optimize flow", "reduce cognitive load"

---

## Core Frameworks

### 1. ADHD-Friendly Design Principles

Apply these patterns to ALL interfaces:

| Principle | Implementation | Why It Matters |
|-----------|----------------|----------------|
| **Progressive Disclosure** | Show one task at a time; hide future steps | Prevents overwhelm, maintains focus |
| **Context Preservation** | Auto-save every keystroke; never lose work | Reduces anxiety about losing progress |
| **Gentle Reminders** | Status updates, not alarms; no red urgency | Avoids panic, maintains calm |
| **Pause & Resume** | Session state persists across days/weeks | Respects inconsistent schedules |
| **Minimal Distractions** | Single focus area; dim non-active panels | Reduces competing stimuli |
| **Chunked Progress** | Visual cards/steps, not endless scrolling | Creates completion dopamine hits |
| **Predictable Navigation** | Same layout always; no surprises | Reduces reorientation cost |
| **Calm Mode Option** | Reduced animations, muted colors on demand | Accommodates sensory sensitivity |

### 2. Gestalt Psychology

Apply these perception principles:

```
PROXIMITY
─────────
Elements close together = perceived as related
White space creates natural boundaries

┌─────────┐  ┌─────────┐     ┌─────────┐  ┌─────────┐
│ Related │  │ Related │     │ Other   │  │ Other   │
│ Item A  │  │ Item B  │     │ Group A │  │ Group B │
└─────────┘  └─────────┘     └─────────┘  └─────────┘
     ↑ CLOSE = GROUPED            ↑ SEPARATE = DISTINCT

SIMILARITY
──────────
Same color/shape/size = perceived as related function

┌──────┐  ┌──────┐  ┌──────┐     ┌──────┐  ┌──────┐
│ BLUE │  │ BLUE │  │ BLUE │     │ CORAL│  │ CORAL│
│ Save │  │ Copy │  │ Edit │     │ Del  │  │ Clear│
└──────┘  └──────┘  └──────┘     └──────┘  └──────┘
     ↑ SAME = Related actions         ↑ DIFFERENT = Destructive

CONTINUITY
──────────
Eye follows lines/paths naturally

Step 1 ──→ Step 2 ──→ Step 3 ──→ Complete
   ●──────────●──────────●──────────●

CLOSURE
───────
Brain completes incomplete shapes
Use for progress indicators, loading states

[ ████████░░░░░░░░ ] 50% - brain "sees" the end
```

### 3. Cognitive Load Theory

Three types of mental load to manage:

| Type | Definition | Strategy |
|------|------------|----------|
| **Intrinsic** | Task complexity itself | Can't eliminate; acknowledge it |
| **Extraneous** | Poor design adding effort | ELIMINATE THIS - your job |
| **Germane** | Learning/understanding | Minimize for repeat users |

**Working Memory Limits:**
- 7±2 items maximum (Miller's Law)
- 4 chunks optimal for complex tasks
- Micro-breaks every 25 minutes

**Reduce Extraneous Load By:**
- Removing unnecessary choices
- Using recognition over recall
- Providing smart defaults
- Eliminating decorative elements that don't inform

### 4. Fitts' Law

Time to acquire target = f(Distance / Size)

```
IMPLICATIONS FOR BUTTONS:
─────────────────────────

  ┌───────────────────┐          vs          ┌──┐
  │     GENERATE      │                      │Go│
  │                   │                      └──┘
  └───────────────────┘
         ↑                                     ↑
  44px+ touch target                   Hard to hit
  Easy to acquire                      Frustrating

MINIMUM SIZES:
- iOS: 44x44 CSS pixels
- Android: 48x48 CSS pixels
- Desktop: 32x32 minimum, 44x44 preferred

EDGE TARGETS ARE INFINITE:
  ┌─────────────────────────────────────────────────────┐
  │ ■ LOGO                                    MENU ■   │
  │                                                     │
  │   Screen edges = can't overshoot                   │
  │   Place critical actions at corners/edges          │
  │                                                     │
  │ ■ HELP                                  EXPORT ■   │
  └─────────────────────────────────────────────────────┘

ICON + LABEL > ICON ALONE:
- Larger target area
- Reduced ambiguity
- Faster acquisition
```

### 5. Flow State Engineering

**Key Metrics:**
- 15-25 minutes to enter flow state
- 23 minutes to recover from interruption
- 40% productivity loss with frequent interruptions
- Only 41% of work time spent in flow (McKinsey)

**Flow Conditions:**
1. Clear goals for the current task
2. Immediate feedback on actions
3. Balance between challenge and skill
4. No anxiety about failure

**Preserve Flow By:**
- Background processing (don't block UI)
- Push notifications when ready (bring user back faster)
- Quick re-orientation panels after breaks
- Auto-save eliminating "save anxiety"
- Undo everything (confidence to experiment)

---

## Analysis Methodology

### Step 1: Create Decision Tree

Map every user path with probabilities:

```
                    ┌─────────────┐
                    │ USER LANDS  │
                    └──────┬──────┘
                           │
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
     ┌──────────┐   ┌──────────┐   ┌──────────┐
     │ Action A │   │ Action B │   │ Action C │
     │  (40%)   │   │  (45%)   │   │  (15%)   │
     └────┬─────┘   └────┬─────┘   └────┬─────┘
          │              │              │
          ▼              ▼              ▼
        [Next]         [Next]         [Next]
```

**For each edge, record:**
- Probability (%)
- Friction score (1-10)
- Time to complete (seconds/minutes)
- Cognitive load (low/medium/high)

### Step 2: Simulate User Journeys

Create detailed simulations for each persona:

**Template:**
```
TIME    ACTION                           COGNITIVE STATE           FRICTION
─────────────────────────────────────────────────────────────────────────────
0:00    [User action]                    [Mental state]            Low/Med/High
        └─ [System response or UI shown]

0:15    [Next action]                    [How they feel]           Low/Med/High
        └─ [What happens]
        └─ PROBLEM: [Friction point if any]

...continue...
─────────────────────────────────────────────────────────────────────────────
TOTAL TIME: X minutes
FRICTION POINTS: N (list them)
ABANDONMENT RISKS: N (critical moments)
DELIGHT MOMENTS: N (positive surprises)
```

**Personas to simulate:**
1. **Expert User** - Knows the system, moving fast
2. **New User** - First time, needs guidance
3. **Distracted User** - Context switching, interruptions
4. **Explorer** - No goal, seeing what's possible
5. **Completer** - Trying to finish, hitting obstacles

### Step 3: Friction Analysis Matrix

Quantify and prioritize:

| Friction Point | Users Affected | Severity (1-10) | Fix Difficulty | Priority Score |
|----------------|---------------|-----------------|----------------|----------------|
| [Issue 1]      | X%            | N               | Easy/Med/Hard  | HIGH/MED/LOW   |
| [Issue 2]      | X%            | N               | Easy/Med/Hard  | HIGH/MED/LOW   |

**Priority Formula:**
```
Priority = (Users Affected × Severity) / Fix Difficulty
```

### Step 4: Impedance Mapping

Compare current vs ideal:

```
TASK                          CURRENT IMPEDANCE     IDEAL IMPEDANCE
────────────────────────────────────────────────────────────────────
[Task 1]                      Low (X sec)           ✓ Optimal
[Task 2]                      Medium (X sec)        Could be Y sec
[Task 3]                      HIGH (X min)          Should be Y sec
```

### Step 5: Time-Loss Analysis

Calculate context switch costs:

```
Action                        Frequency    Time Lost Each    Total Impact
─────────────────────────────────────────────────────────────────────────
[Interruption type 1]         X/session    Y min             Z min
[Interruption type 2]         X/session    Y min             Z min
─────────────────────────────────────────────────────────────────────────
TOTAL CONTEXT SWITCH LOSS                                    Z min/session
```

---

## Optimization Patterns

### Immediate Fixes (Low Effort, High Impact)

1. **Giant CTA on Landing**
   ```html
   <button class="cta" style="min-height: 60px; min-width: 200px;">
     Primary Action
     <span class="subtext">Supporting text</span>
   </button>
   ```

2. **Visible Edit Affordances**
   - Show pencil/edit icons by default, not just on hover
   - Add tooltips: "Click to edit"

3. **Auto-Fill Prompts**
   - After user completes 1 item manually, offer to auto-complete rest
   - "Want me to fill in the remaining X items?"

4. **Floating Action Buttons**
   - Critical actions always visible (not buried in menus)
   - Bottom-right for mobile thumb zone

5. **Progress Indicators**
   - Show "Step X of Y" always
   - Visual progress bar at top

### Medium-Term Improvements

1. **Re-Orientation Panels**
   ```
   ┌─────────────────────────────────────────────┐
   │  Welcome back! Here's where you left off:  │
   │                                            │
   │  ✓ Step 1: Complete                        │
   │  → Step 2: In progress (60%)               │
   │  ○ Step 3: Not started                     │
   │                                            │
   │  [Continue where I left off]               │
   └─────────────────────────────────────────────┘
   ```

2. **Keyboard Shortcuts**
   - Number keys for mode switching (1, 2, 3...)
   - Cmd+Enter for primary action
   - Escape for cancel/close

3. **Background Processing**
   - Never block UI for long operations
   - Show progress, allow user to continue
   - Push notification when complete

4. **Smart Defaults**
   - Pre-fill based on user history
   - Remember last-used settings
   - Suggest most common option first

### Long-Term Vision

1. **Predictive UI**
   - Anticipate next action based on patterns
   - Pre-load likely next screens
   - Suggest before user asks

2. **Personalized Complexity**
   - Simple mode for new users
   - Power user mode unlocks over time
   - User controls their complexity level

3. **Accessibility Suite**
   - High contrast mode
   - Reduced motion option
   - Screen reader optimization
   - Keyboard-only navigation

---

## Checklist for New Features

Before shipping any feature, verify:

### Cognitive Load
- [ ] Can user complete with ≤4 things in working memory?
- [ ] Are there unnecessary choices that could be defaults?
- [ ] Is recognition used instead of recall?

### ADHD-Friendly
- [ ] Can user pause and resume without losing context?
- [ ] Are there gentle progress indicators (not anxiety-inducing)?
- [ ] Is the interface calm (not visually noisy)?

### Fitts' Law
- [ ] Are primary buttons ≥44px tall?
- [ ] Are destructive actions away from common paths?
- [ ] Do buttons have labels, not just icons?

### Flow Preservation
- [ ] Does any action block the UI for &gt;2 seconds?
- [ ] Can long operations run in background?
- [ ] Is there a clear "done" state?

### Error Recovery
- [ ] Can every action be undone?
- [ ] Are error messages actionable (not just "Error")?
- [ ] Is auto-save enabled?

---

## Example Analysis Output

When running this skill, produce a document with:

1. **Executive Summary** - Key findings in 3 bullets
2. **Decision Tree** - All user paths with probabilities
3. **User Journey Simulations** - 3-5 personas, full timeline
4. **Friction Matrix** - Prioritized issues table
5. **Optimization Recommendations** - Immediate/Medium/Long-term
6. **Implementation Checklist** - Specific changes to make

---

## Integration Points

- **web-design-expert**: Implement UX recommendations visually
- **adhd-design-expert**: Deep neurodivergent design patterns
- **frontend-developer**: Technical implementation of fixes
- **diagramming-expert**: Create user flow diagrams

---

## Sources

- [NN/g: Minimize Cognitive Load](https://www.nngroup.com/articles/minimize-cognitive-load/)
- [NN/g: Fitts's Law](https://www.nngroup.com/articles/fitts-law/)
- [Laws of UX](https://lawsofux.com/)
- [IxDF: Gestalt Principles](https://www.interaction-design.org/literature/topics/gestalt-principles)
- [Stack Overflow: Developer Flow State](https://stackoverflow.blog/2018/09/10/developer-flow-state-and-its-impact-on-productivity/)
- [Medium: ADHD UX Design](https://medium.com/design-bootcamp/ux-design-for-adhd-when-focus-becomes-a-challenge-afe160804d94)

---

**Core Philosophy**: Every click, every second of confusion, every moment of "where am I?" is friction stealing from your users. Design for the distracted, optimize for the overwhelmed, and everyone benefits.

---

---
name: github-actions-pipeline-builder
description: Build production CI/CD pipelines with GitHub Actions. Implements matrix builds, caching, deployments, testing, security scanning. Use for automated testing, deployments, release workflows.
  Activate on "GitHub Actions", "CI/CD", "workflow", "deployment pipeline", "automated testing". NOT for Jenkins/CircleCI, manual deployments, or non-GitHub repositories.
allowed-tools: Read,Write,Edit,Bash
metadata:
  category: DevOps & Site Reliability
  tags:
  - github
  - actions
  - pipeline
  - github-actions
  - ci/cd
  pairs-with:
  - skill: devops-automator
    reason: GitHub Actions is one of the primary CI/CD platforms that DevOps automation targets
  - skill: docker-containerization
    reason: Container builds and registry pushes are the most common GitHub Actions workflow steps
  - skill: git-workflow-expert
    reason: Git branching strategies determine pipeline trigger rules and deployment gates
  - skill: test-automation-expert
    reason: Automated test suites run as CI pipeline stages with matrix builds and caching
---

# GitHub Actions Pipeline Builder

Expert in building production-grade CI/CD pipelines with GitHub Actions that are fast, reliable, and secure.

## When to Use

✅ **Use for**:
- Automated testing on every commit
- Deployment to staging/production
- Docker image building and publishing
- Release automation with versioning
- Security scanning and dependency audits
- Code quality checks (linting, type checking)
- Multi-environment workflows

❌ **NOT for**:
- Non-GitHub repositories (use Jenkins, CircleCI, etc.)
- Complex pipelines better suited for dedicated CI/CD tools
- Self-hosted runners (covered in advanced patterns)

## Quick Decision Tree

```
Does your project need:
├── Testing on every PR? → GitHub Actions
├── Automated deployments? → GitHub Actions
├── Matrix builds (Node 16, 18, 20)? → GitHub Actions
├── Secrets management? → GitHub Actions secrets
├── Multi-cloud deployments? → GitHub Actions + OIDC
└── Sub-second builds? → Consider build caching
```

---

## Technology Selection

### GitHub Actions vs Alternatives

**Why GitHub Actions in 2024**:
- **Native integration**: No third-party setup
- **Free for public repos**: 2000 minutes/month for private
- **Matrix builds**: Test multiple versions in parallel
- **Marketplace**: 10,000+ pre-built actions
- **OIDC support**: Keyless cloud deployments

**Timeline**:
- 2019: GitHub Actions released
- 2020: Became standard for OSS projects
- 2022: OIDC support for secure cloud auth
- 2024: De facto CI/CD for GitHub repos

### When to Use Alternatives

| Scenario | Use | Why |
|----------|-----|-----|
| Self-hosted GitLab | GitLab CI | Native integration |
| Complex enterprise workflows | Jenkins | More flexible |
| Bitbucket repos | Bitbucket Pipelines | Native integration |
| Extremely large repos (&gt;10GB) | BuildKite | Better for monorepos |

---

## Common Anti-Patterns

### Anti-Pattern 1: No Dependency Caching

**Novice thinking**: "Install dependencies fresh every time for consistency"

**Problem**: Wastes 2-5 minutes per build installing unchanged dependencies.

**Wrong approach**:
```yaml
# ❌ Slow: Downloads all dependencies every run
- name: Install dependencies
  run: npm install
```

**Correct approach**:
```yaml
# ✅ Fast: Cache dependencies, only download changes
- name: Cache node_modules
  uses: actions/cache@v3
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-

- name: Install dependencies
  run: npm ci  # Faster than npm install
```

**Impact**: Reduces install time from 3 minutes → 30 seconds.

**Timeline**:
- Pre-2020: Most workflows had no caching
- 2020+: Caching became standard
- 2024: Setup actions include built-in caching

---

### Anti-Pattern 2: Duplicate YAML (No Matrix Builds)

**Problem**: Copy-paste workflows for different Node versions.

**Wrong approach**:
```yaml
# ❌ Duplicated workflows
jobs:
  test-node-16:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 16
      - run: npm test

  test-node-18:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm test

  test-node-20:
    # ... same steps again
```

**Correct approach**:
```yaml
# ✅ DRY: Matrix build
jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [16, 18, 20]
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      - run: npm ci
      - run: npm test
```

**Benefits**: 66% less YAML, tests run in parallel.

---

### Anti-Pattern 3: Secrets in Code

**Problem**: Hardcoded API keys, tokens visible in repo.

**Symptoms**: Security scanner alerts, leaked credentials.

**Correct approach**:
```yaml
# ✅ Use GitHub Secrets
- name: Deploy to production
  env:
    API_KEY: ${{ secrets.PRODUCTION_API_KEY }}
    AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY }}
  run: |
    ./deploy.sh
```

**Setting secrets**:
1. Repo Settings → Secrets and variables → Actions
2. New repository secret
3. Name: `PRODUCTION_API_KEY`, Value: `sk-...`

**Timeline**:
- Pre-2022: Some teams committed .env files
- 2022+: GitHub secret scanning blocks commits with keys
- 2024: OIDC eliminates need for long-lived credentials

---

### Anti-Pattern 4: No Failure Notifications

**Problem**: CI fails silently, team doesn't notice for hours.

**Correct approach**:
```yaml
# ✅ Slack notification on failure
- name: Notify on failure
  if: failure()
  uses: slackapi/slack-github-action@v1
  with:
    payload: |
      {
        "text": "❌ Build failed: ${{ github.event.head_commit.message }}",
        "blocks": [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "*Build Failed*\n<${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}|View logs>"
            }
          }
        ]
      }
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

---

### Anti-Pattern 5: Running All Tests on Every Commit

**Problem**: Slow feedback loop (10+ minute test suites).

**Symptom**: Developers avoid committing frequently.

**Correct approach**:
```yaml
# ✅ Fast feedback: Run subset on PR, full suite on merge
on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  quick-tests:
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    steps:
      - run: npm run test:unit  # Fast: 2 minutes

  full-tests:
    if: github.event_name == 'push'
    runs-on: ubuntu-latest
    steps:
      - run: npm run test  # Slow: 10 minutes (unit + integration + e2e)
```

**Alternative**: Use changed-files action to run only affected tests.

---

## Implementation Patterns

### Pattern 1: Basic CI Pipeline

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run type check
        run: npm run typecheck

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build
```

### Pattern 2: Multi-Environment Deployment

```yaml
name: Deploy

on:
  push:
    branches:
      - main        # → staging
      - production  # → production

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: ${{ github.ref_name }}  # staging or production

    steps:
      - uses: actions/checkout@v3

      - name: Deploy to ${{ github.ref_name }}
        run: |
          if [ "${{ github.ref_name }}" == "production" ]; then
            ./deploy.sh production
          else
            ./deploy.sh staging
          fi
        env:
          API_KEY: ${{ secrets.API_KEY }}
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

### Pattern 3: Release Automation

```yaml
name: Release

on:
  push:
    tags:
      - 'v*'  # Trigger on version tags (v1.0.0)

jobs:
  release:
    runs-on: ubuntu-latest
    permissions:
      contents: write  # Required for creating releases

    steps:
      - uses: actions/checkout@v3

      - name: Build artifacts
        run: npm run build

      - name: Create GitHub Release
        uses: softprops/action-gh-release@v1
        with:
          files: |
            dist/**
          body: |
            ## What's Changed
            See CHANGELOG.md for details.
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Publish to npm
        run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### Pattern 4: Docker Build & Push

```yaml
name: Docker

on:
  push:
    branches: [main]

jobs:
  build-and-push:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2

      - name: Login to DockerHub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}

      - name: Build and push
        uses: docker/build-push-action@v4
        with:
          context: .
          push: true
          tags: |
            myapp:latest
            myapp:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

---

## Production Checklist

```
□ Dependency caching configured
□ Matrix builds for multiple versions
□ Secrets stored in GitHub Secrets (not code)
□ Failure notifications (Slack, email, etc.)
□ Deploy previews for pull requests
□ Staging → Production promotion workflow
□ Release automation with versioning
□ Docker layer caching enabled
□ CODEOWNERS file for required reviews
□ Branch protection rules enabled
□ Status checks required before merge
□ Security scanning (Dependabot, CodeQL)
```

---

## When to Use vs Avoid

| Scenario | Use GitHub Actions? |
|----------|---------------------|
| GitHub-hosted repo | ✅ Yes |
| Need matrix builds | ✅ Yes |
| Deploying to AWS/GCP/Azure | ✅ Yes (with OIDC) |
| GitLab repo | ❌ No - use GitLab CI |
| Extremely large monorepo | ⚠️ Maybe - consider BuildKite |
| Need GUI pipeline builder | ❌ No - use Jenkins/Azure DevOps |

---

## References

- `/references/advanced-caching.md` - Cache strategies for faster builds
- `/references/oidc-deployments.md` - Keyless cloud authentication
- `/references/security-hardening.md` - Security best practices

## Scripts

- `scripts/workflow_validator.ts` - Validate YAML syntax locally
- `scripts/action_usage_analyzer.ts` - Find outdated actions

## Assets

- `assets/workflows/` - Ready-to-use workflow templates

---

**This skill guides**: CI/CD pipelines | GitHub Actions workflows | Matrix builds | Caching | Deployments | Release automation

---

---
name: performance-profiling
description: Application performance profiling and bottleneck identification — Node.js profiling, Chrome DevTools, flame graphs, memory leak detection, CPU profiling, React rendering performance. Activate
  on "profiling", "performance bottleneck", "flame graph", "memory leak", "slow app", "CPU profiling", "heap snapshot", "React re-renders", "EXPLAIN ANALYZE", "event loop lag", "clinic.js", "Core Web Vitals".
  NOT for infrastructure monitoring or observability (use logging-observability), load testing (use a load-testing skill), or database schema optimization.
allowed-tools: Read,Write,Edit,Bash,Grep,Glob
metadata:
  category: DevOps & Site Reliability
  tags:
  - performance
  - profiling
  - performance-bottleneck
  - flame-graph
  pairs-with:
  - skill: react-performance-optimizer
    reason: React DevTools profiling identifies component re-render bottlenecks for optimization
  - skill: caching-strategies
    reason: Profiling reveals cache miss patterns that inform caching architecture decisions
  - skill: postgresql-optimization
    reason: Database query profiling with EXPLAIN ANALYZE identifies slow query bottlenecks
  - skill: logging-observability
    reason: Performance metrics and traces collected by observability systems feed profiling analysis
---

# Performance Profiling

Find where your application actually spends time before touching a line of code. Covers the full stack: Node.js CPU and memory profiling, browser flame graphs, React render profiling, and database query analysis. The discipline here is profile first, optimize second — premature optimization is not a workflow, it is a guess.

## When to Use

**Use for**:
- Diagnosing slow Node.js applications (CPU-bound, I/O-bound, memory pressure)
- Generating and reading flame graphs to find hot code paths
- Detecting memory leaks via heap snapshots and growth trends
- Profiling React component render performance with React Profiler
- Measuring browser rendering performance (Core Web Vitals, layout thrashing, long tasks)
- Database query profiling with EXPLAIN ANALYZE
- Measuring event loop utilization and latency

**NOT for**:
- Infrastructure monitoring, distributed tracing, or log aggregation (use `logging-observability`)
- Load testing and capacity planning (a separate domain)
- Network latency analysis between services (use distributed tracing tools)
- Database schema design optimization (separate from query profiling)

---

## Core Decision: Where Is My App Slow?

```mermaid
flowchart TD
    Start[App is slow. Where?] --> Layer{Which layer?}
    Layer -->|Backend| Backend{What kind?}
    Layer -->|Frontend/browser| Browser{What symptom?}
    Layer -->|Unknown| Measure[Instrument first — add timing logs]

    Backend -->|CPU pegged, slow responses| CPU[CPU Profiling]
    Backend -->|Memory growing, crashes| Mem[Memory / Heap Profiling]
    Backend -->|Fast CPU, slow I/O| IO{I/O type?}
    IO -->|Database queries| DB[EXPLAIN ANALYZE + query profiler]
    IO -->|Network calls| Network[Trace external calls, add timeouts]
    IO -->|File system| FS[Check event loop utilization]

    Browser -->|Slow initial load| Lighthouse[Lighthouse + bundle analysis]
    Browser -->|Janky scrolling, animations| Rendering[Chrome Performance tab — layout thrashing]
    Browser -->|Slow after interaction| React{React app?}
    React -->|Yes| ReactProfiler[React Profiler + why-did-you-render]
    React -->|No| JS[Chrome Performance — long tasks, main thread blocking]

    CPU --> FlameGraph[Generate flame graph with 0x or clinic flame]
    Mem --> HeapSnap[Take heap snapshots before/after suspected leak]
    FS --> ELU[clinic bubbles — event loop utilization]
```

---

## Node.js: CPU Profiling

### V8 Inspector (Built-in)

```bash
# Attach inspector and capture a CPU profile
node --inspect src/index.js

# Or start paused and wait for DevTools
node --inspect-brk src/index.js
```

Then open `chrome://inspect` in Chrome, click the target, go to the **Profiler** tab, and record while sending load to the server.

### 0x: Flame Graphs from the Terminal

```bash
npm install -g 0x

# Profile a script (runs it, generates flame graph)
0x -- node src/index.js

# Profile with a load generator running simultaneously
0x -- node src/server.js &
npx autocannon -d 30 http://localhost:3000/api/heavy
```

0x generates an interactive HTML flame graph. The **widest stacks** are where time is spent. Look for:
- Functions that appear wide near the bottom (called frequently by everything)
- Unexpected width in library code (serialization, template engines, parsers)
- Idle / `[idle]` blocks — I/O wait, not CPU (look elsewhere for those)

### Clinic.js Suite

```bash
npm install -g clinic

# Doctor: overview of what is wrong
clinic doctor -- node src/server.js

# Flame: CPU flame graph (wraps 0x)
clinic flame -- node src/server.js

# Bubbles: event loop utilization
clinic bubbles -- node src/server.js
```

Clinic Doctor gives you a triage view: CPU, memory, event loop, and handles. Start here when you do not know what kind of bottleneck you have.

### Event Loop Utilization (ELU)

```js
const { performance } = require('perf_hooks');

// Sample ELU every 5 seconds
let last = performance.eventLoopUtilization();
setInterval(() => {
  const current = performance.eventLoopUtilization();
  const diff = performance.eventLoopUtilization(current, last);
  console.log(`ELU: ${(diff.utilization * 100).toFixed(1)}%`);
  last = current;
}, 5000);
```

ELU above 80% means the event loop is saturated — CPU-bound work or sync blocking. ELU near 0% with slow responses means I/O wait (network, disk, database).

---

## Node.js: Memory Profiling

### Heap Snapshots

```bash
# Take heap snapshot via CLI
node --inspect src/index.js
# In chrome://inspect → Memory tab → Take Heap Snapshot
```

**Three-snapshot technique for leak detection**:
1. Snapshot after startup (baseline)
2. Snapshot after N requests (warm)
3. Snapshot after 2N requests (growth)

Compare Snapshot 3 to Snapshot 2 — objects that grew proportionally to request count are leaking.

### Common Leak Patterns

**Closure captures** — Variables captured in long-lived closures that should have been released:

```js
// LEAK: handler is registered but never removed
emitter.on('data', (chunk) => {
  processedData.push(chunk);  // processedData grows unbounded
});

// FIX: remove listener when done, or use once()
emitter.once('data', handler);
// or
const handler = (chunk) => { ... };
emitter.on('data', handler);
// later:
emitter.off('data', handler);
```

**Growing caches without eviction**:

```js
// LEAK: cache grows forever
const cache = new Map();
app.get('/user/:id', async (req, res) => {
  if (!cache.has(req.params.id)) {
    cache.set(req.params.id, await db.getUser(req.params.id));
  }
  res.json(cache.get(req.params.id));
});

// FIX: use LRU cache with max size
const LRU = require('lru-cache');
const cache = new LRU({ max: 1000, ttl: 1000 * 60 * 5 });
```

**WeakRef and FinalizationRegistry** (for intentional weak references):

```js
const cache = new Map();

function cacheValue(key, obj) {
  const ref = new WeakRef(obj);
  const registry = new FinalizationRegistry((k) => cache.delete(k));
  registry.register(obj, key);
  cache.set(key, ref);
}
```

---

## Anti-Pattern: Optimizing Without Profiling

**Novice**: "This function looks expensive, I'll rewrite it in a more efficient algorithm."

**Expert**: Rewrote the wrong function. Profiling would have shown that this function is called once per startup and contributes 0.1% of runtime. The actual bottleneck was JSON serialization in the response handler, called 10,000 times per second. Optimization effort must follow measurement, never intuition.

**Detection**: The "optimized" code is measurably faster in microbenchmark isolation but production p99 latency is unchanged.

---

## Anti-Pattern: Micro-Benchmarking in Isolation

**Novice**: Writes a benchmark comparing two sorting algorithms on an array of 1000 items, concludes Algorithm B is 2x faster, rewrites production code.

**Expert**: Micro-benchmarks measure JIT-compiled hot paths under artificial conditions. Real workloads have different data shapes, mixed call patterns, GC pressure, and I/O interspersed. The JIT may optimize the benchmark differently than the real call site. Profile the actual application under real load — or at minimum, profile with realistic data shapes and call patterns embedded in the actual application code path.

**The test**: Does your benchmark run in a tight loop 10,000 times before measuring? If yes, V8 has JIT-compiled it differently than it will compile the real code, which runs cold at startup and is called with varied inputs.

---

## React Rendering Performance

### React Profiler (DevTools)

1. Open React DevTools → Profiler tab
2. Click "Record"
3. Perform the slow interaction
4. Stop recording
5. Examine the flame chart — bars represent components, width represents render time

Key columns: **"Why did this render?"** shows which prop or state change triggered each render.

### why-did-you-render

```bash
npm install @welldone-software/why-did-you-render
```

```js
// src/wdyr.js (import before React)
import React from 'react';
if (process.env.NODE_ENV === 'development') {
  const whyDidYouRender = require('@welldone-software/why-did-you-render');
  whyDidYouRender(React, { trackAllPureComponents: true });
}
```

```js
// Mark a specific component for tracking
MyExpensiveComponent.whyDidYouRender = true;
```

This logs to the console every time a component re-renders with the same props — exposing unnecessary renders caused by reference equality failures.

### Common React Performance Patterns

```js
// Memoize expensive components
const ExpensiveList = React.memo(({ items, onSelect }) => {
  return items.map(item => <Item key={item.id} item={item} onSelect={onSelect} />);
});

// Stable callback references — prevent re-renders downstream
const handleSelect = useCallback((id) => {
  setSelected(id);
}, []); // no deps: stable forever

// Memoize expensive computations
const sortedItems = useMemo(() => {
  return [...items].sort((a, b) => a.name.localeCompare(b.name));
}, [items]);

// Virtualize long lists
import { FixedSizeList } from 'react-window';
<FixedSizeList height={600} itemCount={items.length} itemSize={50} width="100%">
  {({ index, style }) => <Row item={items[index]} style={style} />}
</FixedSizeList>
```

---

## Database Query Profiling

### PostgreSQL EXPLAIN ANALYZE

```sql
-- Wrap any query in EXPLAIN (ANALYZE, BUFFERS) to see execution plan
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT u.*, COUNT(o.id) as order_count
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
WHERE u.created_at > NOW() - INTERVAL '30 days'
GROUP BY u.id;
```

Read the output bottom-up. Each node shows:
- `actual time=X..Y` — startup time to first row, total time for all rows
- `rows=N` — actual rows returned
- `loops=N` — how many times this node executed

**Red flags**:
- `Seq Scan` on large tables — missing index
- `rows=1000` estimated vs `rows=1` actual — stale statistics, run `ANALYZE`
- `Hash Join` with large hash batches — memory pressure, tune `work_mem`
- `Nested Loop` on large outer result — cartesian product risk

### Finding Slow Queries in Production

```sql
-- Enable pg_stat_statements extension
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Top 10 slowest queries by total time
SELECT
  query,
  calls,
  total_exec_time / 1000 AS total_seconds,
  mean_exec_time AS mean_ms,
  rows
FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 10;
```

---

## Browser Profiling

See `references/browser-profiling.md` for the full Chrome Performance tab workflow, Core Web Vitals measurement, and layout thrashing diagnosis.

---

## Bottleneck Classification Rules

When the user provides profiling data, classify and rank bottlenecks using these rules. Process signals in priority order — higher-priority signals override lower ones.

### Priority 1: Database (check first — it's the bottleneck 70% of the time)

| Signal | Classification |
|--------|---------------|
| Any query >500ms | **Critical** — `type: database`. Next step: Run `EXPLAIN ANALYZE` on the query. Look for sequential scans on large tables (missing index) and N+1 patterns (same query repeated with different IDs). |
| Multiple queries >100ms per request | **High** — `type: database`. Next step: Aggregate query count per endpoint. If >5 queries per request, look for N+1 or missing JOINs. Consider a query count budget per endpoint. |
| Query count >20 per page load | **High** — `type: database`. Even if individual queries are fast, connection overhead and round-trip latency compound. Next step: Batch with `WHERE id IN (...)` or use a DataLoader pattern. |

### Priority 2: Event Loop (Node.js-specific — the most underdiagnosed bottleneck)

| Signal | Classification |
|--------|---------------|
| ELU >0.8 | **Critical** — `type: cpu`. The event loop is saturated. Next step: Run `clinic flame` or `--prof` to find synchronous hot paths. Common culprits: JSON.parse on large payloads, synchronous crypto, regex backtracking. |
| ELU >0.5 with slow p99 latency | **High** — `type: cpu`. Event loop contention is causing tail latency. Next step: Look for blocking operations that run infrequently but hold the loop when they do (large sorts, template rendering, PDF generation). |
| ELU <0.2 with slow responses | **This is NOT a CPU problem.** `type: io`. Next step: The app is waiting on something external (DB, API calls, file system). Trace outbound requests with `clinic bubbleprof` or add timing logs to external calls. |

### Priority 3: Memory

| Signal | Classification |
|--------|---------------|
| Heap growth rate >10MB/min sustained | **Critical** — `type: memory`. Memory leak will OOM the process. Next step: Take two heap snapshots 5 minutes apart, compare in Chrome DevTools, look for growing object counts (retained size). Common suspects: event listener accumulation, closures capturing request objects, unbounded caches. |
| Heap growth proportional to request rate (resets on GC) | **Medium** — `type: memory`. Not a leak, just high allocation pressure. Next step: Check for unnecessary object creation in hot paths (cloning large objects, building strings with concatenation). Reduce allocation, don't chase GC. |
| `suspects` array from heap analysis | List each suspect with its retained size. **High** if any single object retains >50MB. Next step: Trace the retainer tree to find why it's not being collected. |

### Priority 4: React Rendering (frontend)

| Signal | Classification |
|--------|---------------|
| Component render time >16ms | **High** — `type: rendering`. Dropping frames. Next step: Check if the component re-renders on every parent render (missing `React.memo` or unstable props). Profile with React DevTools "Why did this render?" |
| >5 re-renders per user interaction | **Medium** — `type: rendering`. Next step: Check for state updates that trigger cascading re-renders. Move state closer to where it's used, or split context providers. |
| Large component tree (>500 components mounted) | **Medium** — `type: rendering`. Next step: Virtualize lists (`react-window`), lazy-load off-screen components, check for unnecessary mount/unmount cycles. |

### Priority 5: CPU (non-event-loop)

| Signal | Classification |
|--------|---------------|
| Single function >30% of `selfTime` in CPU profile | **High** — `type: cpu`. Hot function dominates. Next step: Read the function. If it's in your code, optimize it. If it's in a library, check if you're calling it unnecessarily or with pathologically large input. |
| Flame graph shows wide, flat profile (no single hot function) | **Medium** — `type: cpu`. Death by a thousand cuts. Next step: Look for patterns — are many functions doing similar work? This often means redundant computation (computing the same derived value multiple times per request). |

### Output Ranking

After classifying all signals, rank the bottleneck list by:
1. **Severity** (critical first)
2. **Actionability** (clear next step ranks higher than vague "investigate further")
3. **Estimated impact** — "Adding an index will reduce this query from 800ms to 5ms" is more useful than "This might help"

Always include `estimatedImpact` as a concrete prediction: "Adding an index will reduce this query from 800ms to 5ms" is more useful than "This might help"

---

## References

- `references/node-profiling.md` — Consult for detailed Node.js profiling: --inspect flags, clinic.js commands, heap snapshot analysis, event loop monitoring, stream backpressure diagnosis
- `references/browser-profiling.md` — Consult for browser performance: Chrome Performance tab workflow, Lighthouse CI integration, React Profiler deep-dive, Core Web Vitals measurement, layout thrashing patterns

---

---
name: product-appeal-analyzer
description: Evaluate product desirability, market positioning, and emotional resonance—the complement to friction analysis. Assess whether users will WANT a product (not just use it), identity fit, trust
  signals, and value proposition clarity. Activate on "will they like it", "market positioning", "appeal analysis", "product desirability", "value proposition", "why would someone choose this", "landing
  page review", "conversion optimization", "messaging strategy". NOT for UX friction analysis (use ux-friction-analyzer), visual design implementation (use web-design-expert), or A/B test setup (use frontend-developer).
allowed-tools: Read,Write,Edit,WebFetch
metadata:
  category: Research & Analysis
  pairs-with:
  - skill: ux-friction-analyzer
    reason: Appeal asks "do they want it?" Friction asks "can they use it?" Use both.
  - skill: competitive-cartographer
    reason: Position against alternatives with strategic mapping
  - skill: web-design-expert
    reason: Implement visual identity recommendations
  tags:
  - product-strategy
  - marketing
  - positioning
  - value-proposition
  - conversion
  - user-research
---

# Product Appeal Analyzer

Evaluate whether users will *want* a product—not just use it. The complement to friction analysis.

**Core insight**: Users don't choose the best product—they choose the product that feels most like it was made for them.

## When to Use

✅ **Use for:**
- Evaluating landing pages, product pages, app store listings
- Positioning a product against alternatives
- Crafting messaging, tone, visual identity direction
- Assessing emotional resonance with target personas
- Pre-launch "will this convert?" analysis

❌ **NOT for:**
- UX friction audits (→ use ux-friction-analyzer)
- Visual design execution (→ use web-design-expert)
- A/B test implementation (→ use frontend-developer)
- Market size estimation or financial forecasting
- Feature comparison matrices

---

## The Desirability Triangle

**All three must be present.** Missing any one kills conversion:

```
                    IDENTITY FIT
                    "This is for people like me"
                         /\
                        /  \
                       /    \
                      /  ★   \
                     / DESIRE \
                    /          \
                   /______________\
        PROBLEM               TRUST
        URGENCY               SIGNALS
   "I need this now"     "This will actually work"
```

| Missing Element | User Reaction |
|-----------------|---------------|
| Identity Fit | "Seems useful, but not for me" |
| Problem Urgency | "Cool, maybe someday" |
| Trust Signals | "Looks sketchy / too good to be true" |

**Decision tree**: When analyzing, score each vertex 1-10. If any is &lt;5, that's your priority fix.

---

## Quick Analysis: The 5-Second Test

Within 5 seconds of landing, a visitor should know:

1. **What is this?** (Category recognition)
2. **Who is it for?** (Identity signal)
3. **What's the core promise?** (Value proposition)
4. **What do I do next?** (Clear CTA)

**How to run it:**
- Show landing page to someone unfamiliar for exactly 5 seconds
- Hide it, then ask: "What was that? Who's it for? What would you do there?"
- Record verbatim—don't coach or clarify

**Scoring:**

| Result | Score | Action |
|--------|-------|--------|
| All 4 clear in &lt;3 sec | 9-10 | Ship it |
| All 4 clear in 3-5 sec | 7-8 | Minor polish |
| 3 of 4 clear | 5-6 | Fix the gap |
| 2 or fewer clear | 2-4 | Significant rework |
| Confusing/unclear | 0-1 | Start over |

---

## Analysis Process

### Step 1: Identify Target Personas

For each persona, document:
- **Who**: One-sentence description
- **Problem**: What's broken + how it feels
- **Current workaround**: What they do today (and why it sucks)
- **Identity**: How they see themselves, who they want to become

### Step 2: Score the Desirability Triangle

For each persona:

```
PERSONA: [Name]

IDENTITY FIT                    [/10]
  Visual identity match         [/10]  "Does this look like my kind of tool?"
  Language resonance            [/10]  "Do they speak my language?"
  Implied user match            [/10]  "Are people like me shown?"

PROBLEM URGENCY                 [/10]
  Pain point acknowledged       [/10]  "They understand my problem"
  Emotional resonance           [/10]  "They get how frustrating it is"
  Solution clarity              [/10]  "I see how this fixes it"

TRUST SIGNALS                   [/10]
  Professional execution        [/10]  "This looks legitimate"
  Social proof                  [/10]  "Others like me use it"
  Risk reduction                [/10]  "What if it doesn't work?"

OVERALL APPEAL SCORE:           [/90]
```

### Step 3: Map Objections

| Objection | Type | How Addressed? |
|-----------|------|----------------|
| "Is this legit?" | Trust | [Answer] |
| "I've tried things before" | Skepticism | [Answer] |
| "Too expensive" | Value | [Answer] |
| "Too complicated" | Effort | [Answer] |
| "Not for people like me" | Identity | [Answer] |
| "What if it doesn't work?" | Risk | [Answer] |
| "I'll do it later" | Urgency | [Answer] |

### Step 4: Generate Recommendations

Use priority formula: `Impact = (Users Affected × Severity) / Fix Difficulty`

Categorize into:
- **Immediate** (ship this week)
- **Medium-term** (this sprint)
- **Long-term** (roadmap)

---

## Common Anti-Patterns

### Feature Soup Headline

**Novice thinking**: "List all capabilities to show value"

**Reality**: Visitors scan for 2-3 seconds. Feature lists feel generic.

**What to use instead**:
| Bad | Good |
|-----|------|
| "AI-Powered Recovery Planning Tool with Analytics" | "Know exactly what to do next in your recovery" |
| "Comprehensive Legal Document Platform" | "Find out in 2 minutes if your record can be expunged" |

**Detection**: Headline contains 3+ nouns or buzzwords like "AI-powered", "comprehensive", "platform"

### Screenshot Hero

**Novice thinking**: "Show the product interface so people know what they're getting"

**Reality**: Strangers don't understand your UI. They care about outcomes.

**What to use instead**:
- Person experiencing the benefit
- The outcome/result they'll get
- Abstract visualization of the transformation

**Detection**: Hero image is a product screenshot with no context

### Trust Ladder Violation

**Novice thinking**: "Get their email immediately, then convert them"

**Reality**: Trust builds in stages. Asking for too much too early kills conversion.

**The Trust Ladder** (each rung requires more trust):
1. Land on page → Professional design, no broken elements
2. Click/explore → Clear navigation, fast load
3. Spend &gt;2 min → Demonstrated value, clear progress
4. Enter info → Why you need it explained, no dark patterns
5. Create account → Privacy visible, minimal fields, clear benefit
6. Pay money → Guarantee, testimonials, recognizable processor

**Detection**: Asking for account creation before demonstrating value

### Identity Mismatch

**Novice thinking**: "Broad appeal = more users"

**Reality**: When everyone is the target, no one feels targeted.

**What to use instead**:
| Signal Type | How It Works |
|-------------|--------------|
| Visual identity | Dark mode = "power user"; Soft pastels = "wellness" |
| Language/tone | "Crush your goals" vs "Find your balance" |
| Social proof | Company logos vs individual testimonials |
| Complexity | Minimal = simplicity-seeker; Feature-rich = power user |

**Detection**: Homepage tries to appeal to 3+ different personas

---

## Self-Contained Tools

### Analysis Workflow

1. **Read** the landing page content and structure
2. **WebFetch** the target URL to analyze live content
3. **Write** analysis results to a markdown file
4. **Edit** recommendations into actionable copy changes

### Appeal Scorer Script

Run: `python scripts/appeal_scorer.py <url>`

Produces structured JSON output with scores and recommendations.

### Reference Files (See for deep dives)

| File | When to Use |
|------|-------------|
| `references/scoring-templates.md` | Full scoring matrices and templates |
| `references/trust-ladder.md` | Deep dive on trust building stages |
| `references/identity-signals.md` | Visual/verbal identity signal catalog |
| `references/objection-catalog.md` | Common objections by product type |

---

## Output Format

When running this skill, produce:

1. **Executive Summary** - 3 bullet key findings
2. **Desirability Triangle Scores** - Per persona
3. **5-Second Test Assessment** - What's clear, what's not
4. **Top 3 Objections** - And how to address them
5. **Priority Recommendations** - Immediate / Medium / Long-term

---

## Integration with ux-friction-analyzer

**Appeal + Friction = Complete picture**

| This Skill Answers | ux-friction-analyzer Answers |
|--------------------|------------------------------|
| "Do they want it?" | "Can they use it?" |
| Will they choose this over alternatives? | Can they complete the task? |
| Does it feel made for them? | Does the flow make sense? |
| Is the promise compelling? | Is the experience smooth? |

**Run both**: High appeal + high friction = frustrated users. Low friction + low appeal = abandoned product.

---

**Philosophy**: A product with low friction but low appeal gets abandoned. A product with high appeal but high friction gets frustrated users. You need both.

---

---
name: reactive-dashboard-performance
description: Expert in building blazing-fast reactive dashboards with comprehensive testing. Masters React performance patterns, testing strategies for async components, and real-world patterns from Linear,
  Vercel, Notion.
allowed-tools: Read,Write,Edit,Bash,Grep,Glob
version: 1.0.0
metadata:
  category: Frontend Development
  tags:
  - react
  - performance
  - testing
  - dashboard
  - optimization
  pairs-with:
  - skill: react-performance-optimizer
    reason: Dashboard performance depends on React memoization, virtualization, and state management
  - skill: admin-dashboard
    reason: Admin dashboards are the primary consumer of reactive dashboard performance patterns
  - skill: data-viz-2025
    reason: Dashboard charts and graphs require performant data visualization rendering
---

# Reactive Dashboard Performance

Expert in building production-grade reactive dashboards that load in &lt;100ms and have comprehensive test coverage.

## Core Expertise

### Performance Patterns (Linear, Vercel, Notion-grade)

1. **Skeleton-First Loading**
   - Render skeleton immediately (0ms perceived load)
   - Stream in data progressively
   - Never show spinners for &lt;200ms loads

2. **Aggressive Caching**
   - React Query with staleTime: 5min, cacheTime: 30min
   - Optimistic updates for mutations
   - Prefetch on hover/mount

3. **Code Splitting**
   - Route-based splitting (Next.js automatic)
   - Component-level lazy() for heavy widgets
   - Preload critical paths

4. **Memoization Strategy**
   - useMemo for expensive computations
   - React.memo for pure components
   - useCallback for stable references

### Testing Reactive Dashboards

1. **Mock Strategy**
   - Mock at service boundary (React Query, analytics)
   - Never mock UI components (test real DOM)
   - Use MSW for API mocking when possible

2. **Async Handling**
   ```typescript
   // WRONG - races with React
   render(<Dashboard />);
   const element = screen.getByText('Welcome');

   // RIGHT - waits for async resolution
   render(<Dashboard />);
   const element = await screen.findByText('Welcome');
   ```

3. **Timeout Debugging**
   - Timeouts mean: missing mock, wrong query, or component not rendering
   - Use screen.debug() to see actual DOM
   - Check console for unmocked errors

4. **Test Wrapper Pattern**
   ```typescript
   const TestProviders = ({ children }) => (
     <QueryClientProvider client={testQueryClient}>
       <AuthProvider>
         {children}
       </AuthProvider>
     </QueryClientProvider>
   );
   ```

### Real-World Examples

- **Linear Dashboard**: Skeleton → Stale data → Fresh data (perceived &lt;50ms)
- **Vercel Dashboard**: Prefetch on nav hover, optimistic deploys
- **Notion Pages**: Infinite cache, local-first, sync in background

## Diagnostic Protocol

### Integration Test Timeouts

1. **Check what's actually rendering**
   ```typescript
   render(<Component />);
   screen.debug(); // See actual DOM
   ```

2. **Find unmocked dependencies**
   - Check console for "not a function" errors
   - Look for network requests in test output
   - Verify all contexts are provided

3. **Fix async queries**
   - Use findBy* instead of getBy*
   - Increase timeout if needed: `waitFor(() => {...}, { timeout: 3000 })`
   - Mock React Query properly

4. **Simplify component tree**
   - Test widgets individually first
   - Add full integration tests last
   - Use data-testid for complex queries

## Performance Optimization

### Dashboard Load Budget

| Phase | Target |
|-------|--------|
| Skeleton render | 0-16ms (1 frame) |
| First data paint | &lt;100ms |
| Full interactive | &lt;200ms |
| Lazy widgets | &lt;500ms |

### React Query Config

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5min
      cacheTime: 30 * 60 * 1000, // 30min
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      retry: 1,
    },
  },
});
```

### Skeleton Pattern

```typescript
function Dashboard() {
  const { data, isLoading } = useQuery('dashboard', fetchDashboard);

  // Show skeleton immediately, no loading check
  return (
    <div>
      {data ? <RealWidget data={data} /> : <SkeletonWidget />}
    </div>
  );
}
```

## Common Pitfalls

1. **Spinners for fast loads** - Use skeletons instead
2. **Unmemoized expensive computations** - Wrap in useMemo
3. **Testing implementation details** - Test user behavior
4. **Mocking too much** - Mock at boundaries only
5. **Synchronous test expectations** - Everything is async

When debugging test timeouts, ALWAYS start with `screen.debug()` to see what actually rendered.

---


---
name: code-review-checklist
description: Generate context-aware code review checklists from PR diffs — tailored to language, codebase patterns, and team standards. Identifies what reviewers should focus on. NOT for automated code
  fixing, test generation, or security auditing.
allowed-tools: Read,Grep,Glob
metadata:
  category: Code Quality & Testing
  tags:
  - code-review
  - quality
  - checklist
  - pr-review
  - best-practices
  pairs-with:
  - skill: security-auditor
    reason: Security checks are a critical section of any thorough code review checklist
  - skill: refactoring-surgeon
    reason: Code smell detection during review leads directly to targeted refactoring
  - skill: test-automation-expert
    reason: Test coverage verification is a key code review checkpoint
---

# Code Review Checklist Generator

Generate thorough, contextual code review checklists that help reviewers focus on what matters most for each specific PR.

## When to Use

- Before starting a code review to know what to look for
- When onboarding new team members to review standards
- To ensure consistent review quality across the team
- When reviewing unfamiliar parts of the codebase

## Approach

1. **Analyze the Diff**: Understand what files changed and the nature of changes
2. **Identify Patterns**: Detect the type of change (feature, bugfix, refactor, etc.)
3. **Language-Specific Checks**: Apply relevant checks for the programming language
4. **Project Context**: Consider existing patterns and conventions in the codebase
5. **Generate Checklist**: Produce prioritized, actionable review items

## Checklist Categories

### Security
- [ ] Input validation present
- [ ] No hardcoded secrets or credentials
- [ ] Proper authentication/authorization checks
- [ ] SQL injection prevention
- [ ] XSS prevention for web code

### Performance
- [ ] No N+1 query patterns
- [ ] Appropriate caching considered
- [ ] No unnecessary loops or iterations
- [ ] Efficient data structures used

### Maintainability
- [ ] Code is readable and self-documenting
- [ ] Functions are appropriately sized
- [ ] No code duplication
- [ ] Consistent naming conventions

### Testing
- [ ] Unit tests cover new functionality
- [ ] Edge cases are tested
- [ ] Tests are meaningful, not just for coverage

## Best Practices

- Prioritize security issues first
- Focus on logic errors over style nitpicks
- Consider the reviewer's time - highlight critical items
- Adapt checklist to project maturity level

---

---
name: logging-observability
description: 'Structured logging, distributed tracing, and metrics for production applications. [What: OpenTelemetry setup, log level strategy, correlation IDs, SLI/SLO alerting thresholds, Grafana dashboard
  design, PagerDuty integration] [When: setting up production logging, adding observability to a service, debugging distributed systems, designing alerting, implementing traces/metrics/logs] [Keywords:
  logging, observability, OpenTelemetry, OTel, structured logs, distributed tracing, correlation ID, metrics, Grafana, Prometheus, PagerDuty, Winston, Pino, structlog, log levels, SLI, SLO, alerting] NOT
  for application performance profiling (use a profiler), load testing, or database query optimization.'
allowed-tools: Read,Write,Edit,Bash(npm:*,npx:*,pip:*,docker:*)
argument-hint: '[service description] [stack: node|python|go|java] [current problem: no-logging|no-tracing|alert-fatigue|pii-leak]'
metadata:
  category: Code Quality & Testing
  pairs-with:
  - skill: api-architect
    reason: API request tracing and correlation IDs
  - skill: devops-automator
    reason: Deploying collectors and dashboards
  - skill: background-job-orchestrator
    reason: Distributed job observability
  tags:
  - observability
  - logging
  - tracing
  - metrics
  - opentelemetry
  - monitoring
---

# Logging & Observability

Structured logging, distributed tracing, and metrics for production systems. Covers the full observability stack from log formatting to alert routing.

## When to Use

**Activate on:** "structured logging", "distributed tracing", "OpenTelemetry", "OTel", "correlation ID", "log levels", "Grafana dashboard", "alerting thresholds", "SLI SLO", "Prometheus metrics", "PagerDuty integration", "observability stack", "Winston setup", "Pino logger", "log aggregation", "Datadog", "Honeycomb"

**NOT for:** Performance profiling (CPU/memory flamegraphs) | Load testing | Database query optimization | Security auditing

## Decision Tree: What to Log at Each Level

```mermaid
flowchart TD
    E[Event Occurs] --> Q1{Does it represent\na system failure?}
    Q1 -->|Yes| Q2{Is it recoverable\nwithout human?}
    Q2 -->|No| FATAL[FATAL: Service cannot\ncontinue — trigger pager]
    Q2 -->|Yes| ERROR[ERROR: Operation failed,\nwill retry or degrade]
    Q1 -->|No| Q3{Is it unexpected\nbut not failing?}
    Q3 -->|Yes| WARN[WARN: Unusual condition,\ncircuit breaker open,\ndeprecation used]
    Q3 -->|No| Q4{Is it a meaningful\nbusiness event?}
    Q4 -->|Yes| INFO[INFO: User action,\npayment processed,\nservice started]
    Q4 -->|No| Q5{Needed to debug\na specific issue?}
    Q5 -->|Yes| DEBUG[DEBUG: DB queries,\ncache hits/misses,\nfunction inputs]
    Q5 -->|No| TRACE[TRACE: Fine-grained\nloop iterations,\nOTel spans]
```

**Rule of thumb**: Production runs INFO and above. DEBUG only enabled per-service via dynamic config, never always-on in prod.

## Core Patterns

### Structured Log Format (JSON)

Every log line must be parseable. String concatenation is not a log.

**Node.js with Pino:**
```typescript
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  base: {
    service: 'payment-service',
    version: process.env.SERVICE_VERSION,
    env: process.env.NODE_ENV,
  },
  redact: {
    paths: ['req.headers.authorization', 'body.password', 'body.cardNumber', '*.ssn'],
    censor: '[REDACTED]',
  },
});

// Good: structured fields
logger.info({ orderId, userId, amountCents }, 'Payment processed');

// Bad: string interpolation
logger.info(`Payment processed for user ${userId} order ${orderId}`);
```

**Python with structlog:**
```python
import structlog

log = structlog.get_logger()

structlog.configure(
    processors=[
        structlog.contextvars.merge_contextvars,
        structlog.stdlib.add_log_level,
        structlog.stdlib.add_logger_name,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.JSONRenderer(),
    ]
)

# Good: key-value pairs
log.info("payment_processed", order_id=order_id, user_id=user_id, amount_cents=amount)
```

### Correlation IDs

Every request needs a trace ID that flows through all downstream calls. This is the minimum viable distributed tracing without OTel.

```typescript
// Express middleware
import { randomUUID } from 'crypto';
import { AsyncLocalStorage } from 'async_hooks';

const requestContext = new AsyncLocalStorage<{ traceId: string; spanId: string }>();

export function correlationMiddleware(req, res, next) {
  const traceId = req.headers['x-trace-id'] ?? randomUUID();
  const spanId = randomUUID().slice(0, 8);

  requestContext.run({ traceId, spanId }, () => {
    res.setHeader('x-trace-id', traceId);
    next();
  });
}

// Logger that auto-includes context
export function getLogger(name: string) {
  return {
    info: (msg: string, fields?: object) => {
      const ctx = requestContext.getStore();
      logger.info({ ...ctx, ...fields, logger: name }, msg);
    },
    // ... error, warn, debug
  };
}
```

### OpenTelemetry Setup

See `references/opentelemetry-setup.md` for complete OTel collector config, SDK initialization per language, and span attribute conventions.

**Minimal Node.js bootstrap:**
```typescript
// Must be first import in entrypoint
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

const sdk = new NodeSDK({
  serviceName: 'payment-service',
  traceExporter: new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();
```

### Distributed Trace Propagation

```mermaid
sequenceDiagram
    participant C as Client
    participant GW as API Gateway
    participant SVC as Payment Service
    participant DB as Database

    C->>GW: POST /checkout<br/>(no trace header)
    Note over GW: Generate trace-id: abc123<br/>span-id: 0001
    GW->>SVC: POST /payment<br/>traceparent: 00-abc123-0001-01
    Note over SVC: Inherit trace-id: abc123<br/>New span-id: 0002
    SVC->>DB: INSERT payment<br/>traceparent: 00-abc123-0002-01
    Note over DB: Inherit trace-id: abc123<br/>New span-id: 0003
    DB-->>SVC: OK (span 0003 ends)
    SVC-->>GW: 200 OK (span 0002 ends)
    GW-->>C: 200 OK (span 0001 ends)<br/>x-trace-id: abc123
```

The W3C `traceparent` header format: `00-{traceId}-{spanId}-{flags}`. Always propagate this header on every downstream HTTP call.

## Reference Files

| File | Contents |
|------|----------|
| `references/opentelemetry-setup.md` | OTel SDK init per language, collector YAML config, span attributes, context propagation |
| `references/alerting-patterns.md` | SLI/SLO definitions, alert routing, PagerDuty severity mapping, alert fatigue prevention |

## Anti-Patterns (Shibboleths)

### Anti-Pattern 1: Logging PII or Secrets in Production

**Novice thinking**: "I'll just log the full request body to debug this auth issue."

**Why wrong**: GDPR/CCPA violations carry fines up to 4% of global revenue. Secrets in logs propagate to log aggregators, S3 exports, audit trails — all places with different access controls. A single `console.log(req.body)` can expose thousands of user passwords in your Datadog dashboard.

**Detection signature**: Search your logs for `password`, `ssn`, `cardNumber`, `authorization` as field values (not keys). If any appear, you have a PII leak.

**Fix — Allowlist approach:**
```typescript
// Never log what you don't explicitly approve
const SAFE_BODY_FIELDS = ['orderId', 'productId', 'quantity', 'currency'];

logger.info({
  body: pick(req.body, SAFE_BODY_FIELDS), // only known-safe fields
  path: req.path,
  method: req.method,
}, 'Request received');
```

**Fix — Redaction in logger config:**
```typescript
// Pino's redact runs before any transport
const logger = pino({
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'body.password',
      'body.*.password',   // nested objects too
      'body.cardNumber',
      'body.ssn',
      '*.token',
      '*.secret',
    ],
    censor: '[REDACTED]',
  },
});
```

**Shibboleth**: An expert sets up redaction at logger initialization, not as a reminder comment. Redaction must be structural, not ad-hoc.

---

### Anti-Pattern 2: Unstructured String Logs Instead of Structured JSON

**Novice thinking**: `logger.info('User ' + userId + ' purchased ' + productId + ' for $' + amount)`

**Why wrong**: You cannot filter, aggregate, or alert on string-interpolated data in any log aggregator. A Grafana query for `amount > 1000` requires `amount` to be a numeric field, not embedded in a sentence. String logs are write-only — you can read them but not query them at scale.

**Impact**: Your 10 million daily log lines become unsearchable. MTTR (mean time to recovery) during incidents doubles because engineers grep through strings instead of filtering structured fields.

**Fix:**
```typescript
// Bad: string log — amount is buried in text
logger.info(`User ${userId} purchased ${productId} for $${amount}`);

// Good: structured — every field is queryable
logger.info({ userId, productId, amountDollars: amount / 100 }, 'purchase_completed');
```

**Consistent event naming**: Use `snake_case` verb-noun event names (`payment_processed`, `user_signed_up`, `order_failed`) as the message string. This creates a stable vocabulary for dashboards and alerts.

**Shibboleth**: The log message string is for humans scanning log tails. All queryable data lives in structured fields. A logger that produces `{}` as its output shape is better than one that produces readable strings.

---

### Anti-Pattern 3: Log-and-Throw (Duplicate Log Entries)

**Novice thinking**: Log the error, then re-throw so the caller also knows about it.

```typescript
// BAD: log-and-throw
async function processPayment(orderId: string) {
  try {
    return await chargeCard(orderId);
  } catch (err) {
    logger.error({ err, orderId }, 'Payment failed'); // Logged here
    throw err; // And the caller logs it again
  }
}

async function handleCheckout(req, res) {
  try {
    await processPayment(req.body.orderId);
  } catch (err) {
    logger.error({ err }, 'Checkout failed'); // Same error logged twice
    res.status(500).json({ error: 'Checkout failed' });
  }
}
```

**Why wrong**: Every error appears 2-5 times in your logs depending on call depth. Alerting on error count becomes unreliable. Incident review is confusing — engineers think there were multiple failures. Log volume costs money (Datadog charges per ingested GB).

**Fix — Log only at the boundary where you handle the error:**
```typescript
// Good: log only where you decide what to do with the error
async function processPayment(orderId: string) {
  // No try-catch: let errors propagate naturally
  return await chargeCard(orderId);
}

async function handleCheckout(req, res) {
  try {
    await processPayment(req.body.orderId);
    res.json({ success: true });
  } catch (err) {
    // One log, at the boundary where we're deciding to return 500
    logger.error({ err, orderId: req.body.orderId }, 'checkout_failed');
    res.status(500).json({ error: 'Checkout failed' });
  }
}
```

**Rule**: Log where you handle. Don't log where you propagate. The call stack in the error object already tells you where it originated.

**Shibboleth**: If you see the same `traceId` appear in more than two error log lines for a single request, you have a log-and-throw chain somewhere.

## Quality Checklist

```
[ ] All log lines are JSON (no string concatenation)
[ ] Log level strategy documented: what goes at each level
[ ] PII/secrets redacted at logger config level, not call site
[ ] Correlation IDs propagated on all outbound HTTP calls
[ ] OTel SDK initialized before any other imports
[ ] Error logs include the error object (not just message)
[ ] No log-and-throw patterns in error handling
[ ] DEBUG logs use conditional guards or sampling
[ ] SLI/SLO defined for each critical user journey
[ ] Alert routing: notify vs page threshold documented
[ ] Runbook linked from every paging alert
[ ] Log retention policy set (cost vs compliance)
```

## Output Artifacts

1. **Logger configuration** — Pino/Winston/structlog setup with redaction rules
2. **OTel bootstrap file** — SDK init with auto-instrumentation
3. **Correlation middleware** — AsyncLocalStorage request context
4. **Prometheus metrics module** — Counter/histogram/gauge definitions
5. **Grafana dashboard JSON** — Four golden signals panels
6. **Alertmanager rules YAML** — SLO-based alert definitions

---

---
name: playwright-e2e-tester
description: Expert in end-to-end testing with Playwright, the modern cross-browser testing framework. Specializes in test generation, page object patterns, visual regression testing, and CI/CD integration.
  Handles complex testing scenarios including authentication flows, API mocking, and mobile emulation.
version: 1.0.0
metadata:
  category: testing
  tags:
  - e2e
  - playwright
  - testing
  - automation
  - ci-cd
  - cross-browser
  pairs-with:
  - skill: test-automation-expert
    reason: Playwright E2E tests are one tier in a comprehensive test automation strategy
  - skill: webapp-testing
    reason: 'Both use Playwright but for different scopes: E2E test suites vs interactive debugging'
  - skill: vitest-testing-patterns
    reason: Unit tests (Vitest) and E2E tests (Playwright) form complementary test pyramid layers
  - skill: github-actions-pipeline-builder
    reason: E2E tests run in CI pipelines with browser installation and artifact upload steps
---

# Playwright E2E Tester

## Overview

Expert in end-to-end testing with Playwright, the modern cross-browser testing framework. Specializes in test generation, page object patterns, visual regression testing, and CI/CD integration. Handles complex testing scenarios including authentication flows, API mocking, and mobile emulation.

## When to Use

- Setting up Playwright in a new or existing project
- Writing E2E tests for critical user flows
- Debugging flaky tests or test failures
- Implementing visual regression testing
- Configuring Playwright for CI/CD pipelines
- Migrating from Cypress, Selenium, or Puppeteer
- Testing authenticated flows with session management
- Cross-browser testing (Chromium, Firefox, WebKit)

## Capabilities

### Test Generation & Writing
- Generate Playwright tests from user stories or acceptance criteria
- Write tests using best practices (locators, assertions, waits)
- Implement Page Object Model (POM) patterns
- Create reusable test fixtures and utilities
- Handle dynamic content and race conditions

### Configuration & Setup
- Configure `playwright.config.ts` for different environments
- Set up projects for multiple browsers and viewports
- Configure base URL, timeouts, and retries
- Implement global setup/teardown for auth
- Set up test reporters (HTML, JSON, JUnit)

### Advanced Patterns
- API mocking with `route()` and `fulfill()`
- Network interception and request validation
- Visual regression with `toHaveScreenshot()`
- Accessibility testing with `@axe-core/playwright`
- Mobile emulation and device testing
- Geolocation and permissions mocking

### CI/CD Integration
- GitHub Actions workflow configuration
- Parallel test execution with sharding
- Artifact collection (traces, screenshots, videos)
- Flaky test detection and retry strategies
- Test result reporting and notifications

### Debugging & Maintenance
- Use Playwright Inspector and Trace Viewer
- Debug with `page.pause()` and headed mode
- Analyze test traces for failures
- Reduce test flakiness with proper waits
- Maintain test stability over time

## Dependencies

Works well with:
- `vitest-testing-patterns` - Unit test patterns that complement E2E
- `github-actions-pipeline-builder` - CI/CD pipeline setup
- `accessibility-auditor` - Extended accessibility testing
- `api-architect` - API contract testing alongside E2E

## Examples

### Basic Test Structure
```typescript
import { test, expect } from '@playwright/test';

test.describe('User Authentication', () => {
  test('should allow user to sign in', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('Email').fill('user@example.com');
    await page.getByLabel('Password').fill('securepassword');
    await page.getByRole('button', { name: 'Sign In' }).click();

    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    await expect(page).toHaveURL('/dashboard');
  });
});
```

### Page Object Pattern
```typescript
// pages/LoginPage.ts
import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly signInButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByLabel('Email');
    this.passwordInput = page.getByLabel('Password');
    this.signInButton = page.getByRole('button', { name: 'Sign In' });
  }

  async goto() {
    await this.page.goto('/login');
  }

  async signIn(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.signInButton.click();
  }
}
```

### Auth Setup Fixture
```typescript
// fixtures/auth.ts
import { test as base } from '@playwright/test';

export const test = base.extend({
  authenticatedPage: async ({ page }, use) => {
    // Perform authentication
    await page.goto('/login');
    await page.getByLabel('Email').fill(process.env.TEST_USER!);
    await page.getByLabel('Password').fill(process.env.TEST_PASS!);
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Wait for auth to complete
    await page.waitForURL('/dashboard');

    // Use the authenticated page in tests
    await use(page);
  },
});
```

### GitHub Actions CI
```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npx playwright test

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
```

### Visual Regression Test
```typescript
test('homepage matches snapshot', async ({ page }) => {
  await page.goto('/');

  // Full page screenshot comparison
  await expect(page).toHaveScreenshot('homepage.png', {
    fullPage: true,
    maxDiffPixelRatio: 0.01,
  });

  // Component-level screenshot
  const hero = page.getByTestId('hero-section');
  await expect(hero).toHaveScreenshot('hero-section.png');
});
```

### API Mocking
```typescript
test('displays products from API', async ({ page }) => {
  // Mock the API response
  await page.route('**/api/products', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        { id: 1, name: 'Product A', price: 29.99 },
        { id: 2, name: 'Product B', price: 49.99 },
      ]),
    });
  });

  await page.goto('/products');

  await expect(page.getByText('Product A')).toBeVisible();
  await expect(page.getByText('$29.99')).toBeVisible();
});
```

## Best Practices

1. **Use role-based locators** - Prefer `getByRole()`, `getByLabel()`, `getByText()` over CSS selectors
2. **Avoid hard waits** - Use `waitForSelector()`, `waitForURL()`, or assertions instead of `waitForTimeout()`
3. **Isolate tests** - Each test should be independent and not rely on state from other tests
4. **Use fixtures** - Share setup logic through fixtures rather than `beforeEach` hooks
5. **Keep tests focused** - Test one user flow per test, avoid testing multiple unrelated things
6. **Handle flakiness proactively** - Use proper waits, retries, and stable locators
7. **Organize with Page Objects** - Encapsulate page interactions for maintainability
8. **Run in CI** - Always run E2E tests in CI before merging

## Common Pitfalls

- **Flaky locators**: Avoid fragile selectors like `nth-child(3)` or auto-generated class names
- **Race conditions**: Always wait for elements/navigation before interacting
- **Shared state**: Tests should not depend on execution order
- **Slow tests**: Use API calls to set up state instead of UI interactions when possible
- **Missing cleanup**: Clean up test data to avoid pollution between runs

---

---
name: playwright-screenshot-inspector
description: LLM-powered visual testing expert for automated screenshot capture, analysis, and UI verification using Playwright with multimodal AI inspection.
metadata:
  category: Testing
  tags:
  - playwright
  - visual-testing
  - screenshots
  - ui-verification
  - automation
  pairs-with:
  - skill: playwright-e2e-tester
    reason: Visual regression testing extends E2E test suites with screenshot comparison
  - skill: webapp-testing
    reason: Screenshot inspection automates the visual verification that interactive testing does manually
  - skill: color-contrast-auditor
    reason: Automated screenshot analysis can detect contrast violations across UI states
---

# Playwright Screenshot Inspector

LLM-powered visual testing expert for automated screenshot capture, analysis, and UI verification using Playwright with multimodal AI inspection.

## Activation Triggers

**Activate on:**
- "screenshot test", "visual test", "screenshot inspection"
- "playwright headless", "playwright screenshot"
- "UI verification", "visual regression"
- "theme compliance test", "dark mode test", "light mode test"
- "automated screenshot", "capture and analyze"
- "compare screenshots", "visual diff"

**NOT for:**
- Simple one-off screenshots (use browser DevTools)
- Pixel-perfect comparison without AI (use native Playwright `toHaveScreenshot`)
- Non-web UI testing (use platform-specific tools)
- Performance testing (use Lighthouse/WebPageTest)

---

## Core Philosophy

Traditional visual testing compares pixels. **LLM-powered visual testing understands semantics.**

Instead of "these 50 pixels changed", LLM inspection answers:
- "Is the content actually rendered?"
- "Does the theme switch correctly?"
- "Are interactive elements visible and properly styled?"
- "What's broken vs. what's just different?"

---

## The Screenshot Inspection Loop

```
┌─────────────────────────────────────────────────────────────┐
│                    LLM SCREENSHOT INSPECTION                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. CAPTURE (Playwright)                                    │
│     └─► Wait for React hydration, not just network          │
│                                                             │
│  2. READ (Claude vision)                                    │
│     └─► Pass screenshot to LLM with specific questions      │
│                                                             │
│  3. ANALYZE (Structured response)                           │
│     └─► Extract: content present? theme correct? errors?    │
│                                                             │
│  4. ACT (Conditional logic)                                 │
│     └─► Pass/fail based on semantic understanding           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Critical: Waiting for React Content

**The #1 failure mode**: Taking screenshots before React hydrates.

### Anti-Pattern: Network Idle Alone
```python
# ❌ WRONG - React may not have rendered yet
page.goto(url)
page.wait_for_load_state('networkidle')
page.screenshot(path='broken.png')  # Often blank!
```

### Correct Pattern: Wait for Actual Content
```python
# ✅ CORRECT - Wait for React to mount
page.goto(url, wait_until='domcontentloaded')
page.wait_for_load_state('networkidle')

# Give React time to hydrate
import time
time.sleep(0.5)

# Wait for actual content selector
page.wait_for_selector('.main-content, h1, [data-testid="app"]',
                       state='visible',
                       timeout=10000)

# Verify content exists
body_text = page.locator('body').inner_text()
if len(body_text) < 50:
    time.sleep(2)  # Extra wait for slow hydration

page.screenshot(path='good.png', full_page=True)
```

### Content Verification Function
```python
def wait_for_react_content(page, selectors, timeout=10000):
    """Wait for React to hydrate by checking for actual content."""
    page.wait_for_load_state('domcontentloaded')
    page.wait_for_load_state('networkidle')
    time.sleep(0.5)  # React hydration buffer

    for selector in selectors.split(','):
        try:
            locator = page.locator(selector.strip())
            if locator.count() > 0:
                locator.first.wait_for(state='visible', timeout=timeout)
                return True
        except:
            continue

    # Fallback: wait for substantial body content
    try:
        page.wait_for_function(
            'document.body.innerText.length > 100',
            timeout=timeout
        )
        return True
    except:
        return False
```

---

## Headless Mode: Preventing Window Spam

**Always use `headless=True`** to prevent browser windows from spawning:

```python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    # CRITICAL: headless=True prevents visible browser windows
    browser = p.chromium.launch(headless=True)

    context = browser.new_context(
        viewport={'width': 1280, 'height': 800},
        color_scheme='dark'  # Initial theme
    )
    page = context.new_page()

    # ... your test logic ...

    browser.close()  # Always clean up
```

### Theme Testing Pattern
```python
# Dark mode screenshot
page.emulate_media(color_scheme='dark')  # Note: on PAGE, not context
page.goto(url)
wait_for_react_content(page, '.app-container, main, h1')
page.screenshot(path='dark.png', full_page=True)

# Light mode screenshot
page.emulate_media(color_scheme='light')
page.reload()
wait_for_react_content(page, '.app-container, main, h1')
page.screenshot(path='light.png', full_page=True)
```

---

## LLM Screenshot Analysis Patterns

### Pattern 1: Content Verification
```
Prompt: "Analyze this screenshot. Answer:
1. Is the main content rendered (not blank/loading)?
2. What major UI elements are visible?
3. Are there any error states or broken layouts?
4. Rate content completeness: FULL / PARTIAL / EMPTY"
```

### Pattern 2: Theme Compliance
```
Prompt: "This is a {dark/light} mode screenshot. Verify:
1. Background color matches expected theme (dark bg for dark mode)
2. Text has sufficient contrast against background
3. Interactive elements are visible and styled correctly
4. No theme leakage (dark elements on light bg or vice versa)"
```

### Pattern 3: Comparison Analysis
```
Prompt: "Compare these two screenshots (before/after). Identify:
1. What changed between them?
2. Are changes intentional (theme switch) or bugs?
3. Is any content missing in the 'after' version?
4. Rate similarity: IDENTICAL / MINOR_DIFF / MAJOR_DIFF / BROKEN"
```

### Pattern 4: Accessibility Check
```
Prompt: "Evaluate this screenshot for visual accessibility:
1. Is text readable (sufficient size and contrast)?
2. Are interactive elements clearly identifiable?
3. Is there visual hierarchy (headings, sections)?
4. Any elements that would fail WCAG contrast requirements?"
```

---

## Complete Test Script Template

```python
#!/usr/bin/env python3
"""
LLM-Powered Screenshot Test Suite
Captures screenshots and uses Claude vision for semantic analysis.
"""

from playwright.sync_api import sync_playwright
import os
import time

PAGES_TO_TEST = [
    # (path, name, content_selectors)
    ('/', 'Home', '.hero, main, h1'),
    ('/about', 'About', '.about-content, main, h1'),
    ('/dashboard', 'Dashboard', '.dashboard, .stats, h1'),
]

BASE_URL = 'http://localhost:5173'
SCREENSHOT_DIR = '/tmp/visual-tests'


def wait_for_content(page, selectors, timeout=10000):
    """Wait for React/Vue/Svelte to hydrate."""
    page.wait_for_load_state('domcontentloaded')
    page.wait_for_load_state('networkidle')
    time.sleep(0.5)

    for selector in selectors.split(','):
        try:
            loc = page.locator(selector.strip())
            if loc.count() > 0:
                loc.first.wait_for(state='visible', timeout=timeout)
                return True
        except:
            continue

    try:
        page.wait_for_function('document.body.innerText.length > 100', timeout=timeout)
        return True
    except:
        return False


def capture_themed_screenshots(page, url, name, selectors):
    """Capture both dark and light mode screenshots."""
    safe_name = name.lower().replace(' ', '-')
    results = {'name': name, 'url': url}

    for theme in ['dark', 'light']:
        page.emulate_media(color_scheme=theme)

        if theme == 'dark':
            page.goto(url, wait_until='domcontentloaded')
        else:
            page.reload(wait_until='domcontentloaded')

        content_loaded = wait_for_content(page, selectors)

        if not content_loaded:
            print(f"  ⚠️  {theme} mode: Content slow to load, waiting...")
            time.sleep(2)

        screenshot_path = f'{SCREENSHOT_DIR}/{safe_name}-{theme}.png'
        page.screenshot(path=screenshot_path, full_page=True)

        # Check content length
        body_text = page.locator('body').inner_text().strip()
        results[f'{theme}_screenshot'] = screenshot_path
        results[f'{theme}_content_length'] = len(body_text)
        results[f'{theme}_has_content'] = len(body_text) > 50

        print(f"  {theme}: {'✅' if results[f'{theme}_has_content'] else '❌'} ({len(body_text)} chars)")

    return results


def run_tests():
    """Run visual tests on all pages."""
    os.makedirs(SCREENSHOT_DIR, exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={'width': 1280, 'height': 800},
            color_scheme='dark'
        )
        page = context.new_page()

        # Capture console errors
        errors = []
        page.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)

        results = []

        for path, name, selectors in PAGES_TO_TEST:
            print(f"Testing {name}...")
            url = f'{BASE_URL}{path}'
            result = capture_themed_screenshots(page, url, name, selectors)
            result['errors'] = list(errors)
            errors.clear()
            results.append(result)

        browser.close()

        # Summary
        print("\n" + "=" * 50)
        print("VISUAL TEST SUMMARY")
        print("=" * 50)

        passed = sum(1 for r in results
                     if r.get('dark_has_content') and r.get('light_has_content'))
        print(f"\nPassed: {passed}/{len(results)}")
        print(f"Screenshots: {SCREENSHOT_DIR}")

        return results


if __name__ == '__main__':
    run_tests()
```

---

## MCP vs Native Playwright Decision Tree

```
What are you doing?
│
├─ Interactive debugging / exploring
│  └─► Playwright MCP (see live browser)
│
├─ Automated test suite
│  └─► Native Python Playwright (headless)
│
├─ CI/CD pipeline
│  └─► Native Python Playwright (headless)
│
├─ Screenshot capture for LLM analysis
│  └─► Native Python Playwright (headless)
│
└─ One-off inspection
   └─► Either works, MCP is convenient
```

---

## Common Failures and Fixes

### Failure: Blank Screenshots
**Cause**: Screenshot taken before React hydrates
**Fix**: Wait for content selectors, add hydration buffer

### Failure: "Reconnecting..." Badge Visible
**Cause**: HMR/WebSocket not connected (cosmetic in tests)
**Fix**: This is often fine - focus on actual content

### Failure: Theme Not Applied
**Cause**: `emulate_media` called on context instead of page
**Fix**: Use `page.emulate_media(color_scheme='dark')`

### Failure: Browser Windows Spawning
**Cause**: `headless=False` or using MCP instead of native
**Fix**: Use `p.chromium.launch(headless=True)`

### Failure: Timeout on Content
**Cause**: Wrong selectors or page actually broken
**Fix**: Verify selectors exist, check console errors

---

## Integration with Claude Code

When Claude reads screenshots captured by this pattern:

1. **Request specific analysis**: Don't just show screenshot - ask targeted questions
2. **Provide context**: "This should be dark mode" or "This is the login page"
3. **Compare systematically**: Before/after, dark/light, desktop/mobile
4. **Trust semantic analysis**: LLM can tell "blank page" from "content loaded"

---

## References

### Research Papers
- [Using Vision LLMs For UI Testing](https://courses.cs.washington.edu/courses/cse503/25wi/final-reports/Using%20Vision%20LLMs%20For%20UI%20Testing.pdf) - University of Washington
- [Vision-driven Automated Mobile GUI Testing](https://arxiv.org/html/2407.03037v1) - Multimodal LLM approach
- [ScreenLLM: Stateful Screen Schema](https://arxiv.org/html/2503.20978v1) - UI understanding framework

### Tools & Integrations
- [Building an AI QA Engineer with Claude + Playwright](https://alexop.dev/posts/building_ai_qa_engineer_claude_code_playwright/)
- [AI-Powered Visual Testing in Playwright](https://testrig.medium.com/ai-powered-visual-testing-in-playwright-from-pixels-to-perception-dd3ee49911d5)
- [Playwright Visual Regression Testing Guide](https://testgrid.io/blog/playwright-visual-regression-testing/)

### Official Documentation
- [Playwright Visual Comparisons](https://playwright.dev/docs/test-snapshots)

---

## Version History

- **2026-01-23**: Initial skill creation
  - Researched multimodal LLM screenshot analysis best practices
  - Documented React hydration waiting patterns
  - Added headless mode requirements
  - Created complete test script template

---

**Core Insight**: The difference between useless and useful screenshot tests is waiting for content, not just network. LLMs can analyze semantics, but only if there's actually content to analyze.

---

---
name: security-auditor
description: Security vulnerability scanner and OWASP compliance auditor for codebases. Dependency scanning (npm audit, pip-audit), secret detection (high-entropy strings, API keys), SAST for injection/XSS
  vulnerabilities, and security posture reports. Activate on 'security audit', 'vulnerability scan', 'OWASP', 'secret detection', 'dependency check', 'CVE', 'security review', 'penetration testing prep'.
  NOT for runtime WAF configuration (use infrastructure tools), network security/firewalls, or compliance certifications like SOC2/HIPAA (legal/organizational).
allowed-tools: Read,Write,Edit,Bash(npm audit:*,pip-audit:*,grep:*,find:*),Grep,Glob
metadata:
  category: Code Quality & Testing
  pairs-with:
  - skill: devops-automator
    reason: Secure deployment pipelines
  - skill: mcp-creator
    reason: Secure MCP server development
  tags:
  - security
  - owasp
  - vulnerabilities
  - sast
  - dependencies
---

# Security Auditor

Comprehensive security scanning for codebases. Identifies vulnerabilities before they become incidents. Focuses on actionable findings with remediation guidance.

## When to Use

**Use for:**
- Pre-deployment security audits
- Dependency vulnerability scanning
- Secret/credential leak detection
- Code-level SAST (Static Application Security Testing)
- Security posture reports for stakeholders
- OWASP Top 10 compliance checking
- Pre-PR security reviews

**Do NOT use for:**
- Runtime security (WAF, rate limiting) - use infrastructure tools
- Network security/firewall rules - use cloud/DevOps skills
- SOC2/HIPAA/PCI compliance - requires legal/organizational process
- Penetration testing execution - this is detection, not exploitation

## Quick Start

### Full Security Audit
```bash
# Run comprehensive scan
./scripts/full-audit.sh /path/to/project

# Output: security-report.json + summary
```

### Quick Checks
```bash
# Dependency vulnerabilities only
npm audit --json > deps-audit.json

# Secret detection only
./scripts/detect-secrets.sh /path/to/project

# OWASP check specific file
./scripts/owasp-check.py /path/to/file.js
```

## Core Scanning Capabilities

### 1. Dependency Scanning

| Package Manager | Command | Severity Levels |
|-----------------|---------|-----------------|
| npm | `npm audit --json` | critical, high, moderate, low |
| yarn | `yarn audit --json` | same as npm |
| pip | `pip-audit --format json` | critical, high, medium, low |
| cargo | `cargo audit --json` | same |

**Decision Tree:**
```
Critical severity found?
├── YES → Block deployment, immediate fix required
│   └── Check if patch available → npm audit fix --force
├── NO → High severity?
    ├── YES → Fix within sprint, document if deferred
    └── NO → Low/Moderate → Track, fix during maintenance
```

### 2. Secret Detection

**High-Risk Patterns:**
- API keys: `/[A-Za-z0-9_]{20,}/` near "key", "api", "secret"
- AWS credentials: `AKIA[0-9A-Z]{16}`
- Private keys: `-----BEGIN (RSA|EC|OPENSSH) PRIVATE KEY-----`
- JWT tokens: `eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+`
- Connection strings: `://[^:]+:[^@]+@`

**Entropy Analysis:**
- Shannon entropy > 4.5 on strings > 20 chars = suspicious
- Base64-encoded blobs in source = investigate

**False Positive Handling:**
```
Secret-like pattern found?
├── In test file? → Lower severity, document
├── In example/docs? → Check if placeholder
├── High entropy + near "password"/"secret" → High confidence
└── In .env.example? → Acceptable if placeholder values
```

### 3. OWASP Top 10 Static Analysis

| # | Vulnerability | Detection Pattern |
|---|---------------|-------------------|
| A01 | Broken Access Control | Missing auth checks on routes |
| A02 | Cryptographic Failures | Weak algorithms (MD5, SHA1 for passwords) |
| A03 | Injection | Unparameterized queries, eval(), innerHTML |
| A04 | Insecure Design | Hardcoded credentials, missing rate limits |
| A05 | Security Misconfiguration | Debug mode in prod, default credentials |
| A06 | Vulnerable Components | Known CVEs in dependencies |
| A07 | Auth Failures | Weak password policies, session issues |
| A08 | Integrity Failures | Unsigned updates, untrusted deserialization |
| A09 | Logging Failures | Sensitive data in logs, missing audit trails |
| A10 | SSRF | Unvalidated URL inputs to fetch/request |

### 4. Language-Specific Checks

**JavaScript/TypeScript:**
- `eval()`, `new Function()` - code injection
- `innerHTML`, `outerHTML` - XSS vectors
- `document.write()` - DOM-based XSS
- `child_process.exec()` with user input - command injection
- Regex without timeout - ReDoS vulnerability

**Python:**
- `pickle.loads()` with untrusted data - arbitrary code execution
- `yaml.load()` without `Loader=SafeLoader` - code injection
- `subprocess.shell=True` - command injection
- `eval()`, `exec()` - code injection
- SQL string concatenation - SQL injection

**SQL:**
- String concatenation in queries - SQL injection
- `LIKE '%' + input + '%'` - injection via wildcards
- Missing parameterization - critical vulnerability

## Anti-Patterns

### Anti-Pattern: Security by Obscurity
**What it looks like**: "Nobody will find this hardcoded password"
**Why wrong**: Secrets in source always leak eventually
**Instead**: Environment variables, secret managers, zero hardcoded secrets

### Anti-Pattern: Audit Fatigue
**What it looks like**: 500 findings, all "medium", team ignores
**Why wrong**: Critical issues buried in noise
**Instead**: Prioritize by exploitability, start with critical/high only

### Anti-Pattern: Fix Without Understanding
**What it looks like**: `npm audit fix --force` without review
**Why wrong**: May introduce breaking changes, doesn't address root cause
**Instead**: Review each fix, understand the vulnerability, test after

### Anti-Pattern: One-Time Audit
**What it looks like**: "We did a security audit last year"
**Why wrong**: New CVEs daily, code changes constantly
**Instead**: CI/CD integration, weekly automated scans minimum

## Security Report Format

```json
{
  "summary": {
    "critical": 0,
    "high": 2,
    "medium": 5,
    "low": 12,
    "informational": 8
  },
  "findings": [
    {
      "id": "SEC-001",
      "severity": "high",
      "category": "A03:Injection",
      "title": "SQL Injection in user search",
      "location": "src/api/users.js:45",
      "description": "User input concatenated directly into SQL query",
      "evidence": "const query = `SELECT * FROM users WHERE name = '${input}'`",
      "remediation": "Use parameterized queries: db.query('SELECT * FROM users WHERE name = $1', [input])",
      "references": ["https://owasp.org/www-community/attacks/SQL_Injection"]
    }
  ],
  "recommendations": [
    "Implement parameterized queries across all database access",
    "Add input validation layer",
    "Enable SQL query logging for monitoring"
  ]
}
```

## CI/CD Integration

### GitHub Actions Example
```yaml
security-scan:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - name: Run security audit
      run: |
        npm audit --json > audit.json
        ./scripts/detect-secrets.sh . > secrets.json
        ./scripts/generate-report.py
    - name: Fail on critical
      run: |
        if jq '.summary.critical > 0' report.json; then
          echo "Critical vulnerabilities found!"
          exit 1
        fi
```

## Scripts (in `scripts/` folder)

| Script | Purpose |
|--------|---------|
| `full-audit.sh` | Comprehensive security scan |
| `detect-secrets.sh` | High-entropy string and pattern detection |
| `owasp-check.py` | OWASP Top 10 static analysis |
| `generate-report.py` | Combine findings into unified report |

## Expert vs Novice Approach

| Novice | Expert |
|--------|--------|
| Runs audit once before release | CI/CD integration, every commit |
| Focuses on tool output only | Understands vulnerability context |
| Fixes everything or nothing | Triages by exploitability |
| Uses one scanner | Layers multiple tools |
| Ignores false positives | Tunes detection rules |

## Success Metrics

| Metric | Target |
|--------|--------|
| Critical/High pre-production | 0 |
| Mean time to remediate critical | &lt; 24 hours |
| False positive rate | &lt; 10% |
| Scan coverage | 100% of deployable code |

## Reference Files

- `references/owasp-top-10-2024.md` - Detailed OWASP guidance
- `references/secret-patterns.md` - Comprehensive regex patterns
- `references/remediation-playbook.md` - Fix guidance by vulnerability type
- `references/ci-cd-templates.md` - Integration examples
- `scripts/` - Working security scanning scripts

---

**Detects**: Dependency CVEs | Secret leaks | Injection vulnerabilities | OWASP violations | Security misconfigurations

**Use with**: site-reliability-engineer (deployment gates) | code-review (PR security checks)

---

---
name: test-automation-expert
description: Comprehensive test automation specialist covering unit, integration, and E2E testing strategies. Expert in Jest, Vitest, Playwright, Cypress, pytest, and modern testing frameworks. Guides test
  pyramid design, coverage optimization, flaky test detection, and CI/CD integration. Activate on 'test strategy', 'unit tests', 'integration tests', 'E2E testing', 'test coverage', 'flaky tests', 'mocking',
  'test fixtures', 'TDD', 'BDD', 'test automation'. NOT for manual QA processes, load/performance testing (use performance-engineer), or security testing (use security-auditor).
allowed-tools: Read,Write,Edit,Bash(npm test:*,npx jest:*,npx vitest:*,npx playwright:*,pytest:*),Grep,Glob
metadata:
  category: Code Quality & Testing
  pairs-with:
  - skill: refactoring-surgeon
    reason: Tests before refactoring
  - skill: devops-automator
    reason: CI/CD test integration
  tags:
  - testing
  - jest
  - playwright
  - tdd
  - coverage
---

# Test Automation Expert

Comprehensive testing guidance from unit to E2E. Designs test strategies, implements automation, and optimizes coverage for sustainable quality.

## When to Use

**Use for:**
- Designing test strategy for new projects
- Setting up testing frameworks (Jest, Vitest, Playwright, Cypress, pytest)
- Writing effective unit, integration, and E2E tests
- Optimizing test coverage and eliminating gaps
- Debugging flaky tests
- CI/CD test pipeline configuration
- Test-Driven Development (TDD) guidance
- Mocking strategies and test fixtures

**Do NOT use for:**
- Manual QA test case writing - this is automation-focused
- Load/performance testing - use performance-engineer skill
- Security testing - use security-auditor skill
- API contract testing only - use backend-architect for API design

## Test Pyramid Philosophy

```
         /\
        /  \      E2E Tests (10%)
       /----\     - Critical user journeys
      /      \    - Cross-browser validation
     /--------\
    /          \  Integration Tests (20%)
   /            \ - API contracts
  /--------------\- Component interactions
 /                \
/------------------\ Unit Tests (70%)
                    - Fast, isolated, deterministic
                    - Business logic validation
```

### Distribution Guidelines

| Test Type | Percentage | Execution Time | Purpose |
|-----------|------------|----------------|---------|
| Unit | 70% | &lt; 100ms each | Logic validation |
| Integration | 20% | &lt; 1s each | Component contracts |
| E2E | 10% | &lt; 30s each | Critical paths |

## Framework Selection

### JavaScript/TypeScript

| Framework | Best For | Speed | Config Complexity |
|-----------|----------|-------|-------------------|
| **Vitest** | Vite projects, modern ESM | Fastest | Low |
| **Jest** | React, established projects | Fast | Medium |
| **Playwright** | E2E, cross-browser | N/A | Low |
| **Cypress** | E2E, component testing | N/A | Medium |

### Python

| Framework | Best For | Speed | Features |
|-----------|----------|-------|----------|
| **pytest** | Everything | Fast | Fixtures, plugins |
| **unittest** | Standard library | Medium | Built-in |
| **hypothesis** | Property-based | Varies | Generative |

### Decision Tree: Framework Selection

```
New project?
├── Yes → Using Vite?
│   ├── Yes → Vitest
│   └── No → Jest or Vitest (both work)
└── No → What exists?
    ├── Jest → Keep Jest (migration cost rarely worth it)
    ├── Mocha → Consider migration to Vitest
    └── Nothing → Vitest (modern default)

Need E2E?
├── Cross-browser critical → Playwright
├── Developer experience priority → Cypress
└── Both → Playwright (more flexible)
```

## Unit Testing Patterns

### Good Unit Test Anatomy

```javascript
describe('UserService', () => {
  describe('validateEmail', () => {
    // Arrange-Act-Assert pattern
    it('should accept valid email formats', () => {
      // Arrange
      const validEmails = ['user@example.com', 'name+tag@domain.co'];

      // Act & Assert
      validEmails.forEach(email => {
        expect(validateEmail(email)).toBe(true);
      });
    });

    it('should reject invalid email formats', () => {
      // Arrange
      const invalidEmails = ['invalid', '@missing.com', 'no@tld'];

      // Act & Assert
      invalidEmails.forEach(email => {
        expect(validateEmail(email)).toBe(false);
      });
    });

    // Edge cases explicitly tested
    it('should handle empty string', () => {
      expect(validateEmail('')).toBe(false);
    });

    it('should handle null/undefined', () => {
      expect(validateEmail(null)).toBe(false);
      expect(validateEmail(undefined)).toBe(false);
    });
  });
});
```

### Mocking Strategies

```javascript
// ✅ Good: Mock at boundaries
jest.mock('../services/api', () => ({
  fetchUser: jest.fn()
}));

// ✅ Good: Explicit mock setup per test
beforeEach(() => {
  fetchUser.mockReset();
});

it('handles user not found', async () => {
  fetchUser.mockRejectedValue(new NotFoundError());
  await expect(getUser(123)).rejects.toThrow('User not found');
});

// ❌ Bad: Mocking implementation details
jest.mock('../utils/internal-helper'); // Don't mock internals
```

### Test Isolation Checklist

- [ ] Each test can run independently
- [ ] No shared mutable state between tests
- [ ] Database/API state reset between tests
- [ ] No test order dependencies
- [ ] Parallel execution safe

## Integration Testing Patterns

### API Integration Test

```javascript
describe('POST /api/users', () => {
  let app;
  let db;

  beforeAll(async () => {
    db = await createTestDatabase();
    app = createApp({ db });
  });

  afterAll(async () => {
    await db.close();
  });

  beforeEach(async () => {
    await db.clear();
  });

  it('creates user with valid data', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({ name: 'Test', email: 'test@example.com' })
      .expect(201);

    expect(response.body).toMatchObject({
      id: expect.any(String),
      name: 'Test',
      email: 'test@example.com'
    });

    // Verify side effects
    const dbUser = await db.users.findById(response.body.id);
    expect(dbUser).toBeDefined();
  });

  it('rejects duplicate email', async () => {
    await db.users.create({ name: 'Existing', email: 'test@example.com' });

    await request(app)
      .post('/api/users')
      .send({ name: 'New', email: 'test@example.com' })
      .expect(409);
  });
});
```

### Component Integration (React)

```javascript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserProfile } from './UserProfile';
import { UserProvider } from '../context/UserContext';

describe('UserProfile integration', () => {
  it('loads and displays user data', async () => {
    render(
      <UserProvider>
        <UserProfile userId="123" />
      </UserProvider>
    );

    // Verify loading state
    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    // Wait for data
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Verify loaded state
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });
});
```

## E2E Testing Patterns

### Playwright Best Practices

```javascript
import { test, expect } from '@playwright/test';

test.describe('Checkout Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Seed test data via API
    await page.request.post('/api/test/seed', {
      data: { scenario: 'checkout-ready' }
    });
  });

  test('complete purchase with credit card', async ({ page }) => {
    await page.goto('/cart');

    // Use accessible selectors
    await page.getByRole('button', { name: 'Proceed to checkout' }).click();

    // Fill payment form
    await page.getByLabel('Card number').fill('4242424242424242');
    await page.getByLabel('Expiry').fill('12/25');
    await page.getByLabel('CVC').fill('123');

    // Complete purchase
    await page.getByRole('button', { name: 'Pay now' }).click();

    // Verify success
    await expect(page.getByRole('heading', { name: 'Order confirmed' })).toBeVisible();
    await expect(page.getByText(/Order #\d+/)).toBeVisible();
  });

  test('shows error for declined card', async ({ page }) => {
    await page.goto('/checkout');

    // Use test card that triggers decline
    await page.getByLabel('Card number').fill('4000000000000002');
    await page.getByLabel('Expiry').fill('12/25');
    await page.getByLabel('CVC').fill('123');

    await page.getByRole('button', { name: 'Pay now' }).click();

    await expect(page.getByRole('alert')).toContainText('Card declined');
  });
});
```

### Flaky Test Detection & Prevention

**Common Causes:**
1. Race conditions in async operations
2. Time-dependent tests
3. Shared state between tests
4. Network variability
5. Animation/transition timing

**Fixes:**

```javascript
// ❌ Bad: Fixed timeout
await page.waitForTimeout(2000);

// ✅ Good: Wait for specific condition
await expect(page.getByText('Loaded')).toBeVisible();

// ❌ Bad: Checking exact time
expect(new Date()).toEqual(specificDate);

// ✅ Good: Mock time
jest.useFakeTimers();
jest.setSystemTime(new Date('2024-01-15'));

// ❌ Bad: Depending on animation completion
await page.click('.button');
expect(await page.isVisible('.modal')).toBe(true);

// ✅ Good: Wait for animation
await page.click('.button');
await expect(page.locator('.modal')).toBeVisible();
```

## Coverage Optimization

### What to Measure

| Metric | Target | Priority |
|--------|--------|----------|
| Line coverage | 80%+ | Medium |
| Branch coverage | 75%+ | High |
| Function coverage | 90%+ | Medium |
| Critical path coverage | 100% | Critical |

### Coverage Configuration

```javascript
// vitest.config.js
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/index.ts', // barrel files
      ],
      thresholds: {
        branches: 75,
        functions: 80,
        lines: 80,
        statements: 80
      }
    }
  }
});
```

### Finding Coverage Gaps

```bash
# Generate detailed coverage report
npx vitest run --coverage

# Find untested files
npx vitest run --coverage --reporter=json | jq '.coverageMap | to_entries | map(select(.value.s | values | any(. == 0))) | .[].key'
```

## CI/CD Integration

### GitHub Actions

```yaml
name: Tests
on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm test -- --coverage
      - uses: codecov/codecov-action@v4

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

### Test Parallelization

```javascript
// vitest.config.js - parallel by default
export default defineConfig({
  test: {
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false
      }
    }
  }
});

// playwright.config.js
export default defineConfig({
  workers: process.env.CI ? 2 : undefined,
  fullyParallel: true
});
```

## Anti-Patterns

### Anti-Pattern: Testing Implementation Details

**What it looks like:**
```javascript
// ❌ Testing internal state
expect(component.state.isLoading).toBe(true);

// ❌ Testing private methods
expect(service._calculateHash()).toBe('abc123');
```

**Why wrong:** Couples tests to implementation, breaks on refactors

**Instead:**
```javascript
// ✅ Test observable behavior
expect(screen.getByRole('progressbar')).toBeInTheDocument();

// ✅ Test public interface
expect(service.getHash()).toBe('abc123');
```

### Anti-Pattern: Over-Mocking

**What it looks like:**
```javascript
// ❌ Mocking everything
jest.mock('../utils/format');
jest.mock('../utils/validate');
jest.mock('../utils/transform');
```

**Why wrong:** Tests pass even when real code is broken

**Instead:** Mock only at system boundaries (APIs, databases, external services)

### Anti-Pattern: Flaky Acceptance

**What it looks like:** "That test is just flaky, skip it"

**Why wrong:** Flaky tests indicate real problems (race conditions, timing issues)

**Instead:** Fix the flakiness or quarantine while fixing

### Anti-Pattern: Coverage Theater

**What it looks like:**
```javascript
// ❌ Testing for coverage, not behavior
it('covers the function', () => {
  myFunction();
  // No assertions!
});
```

**Why wrong:** 100% coverage with 0% confidence

**Instead:** Every test should assert meaningful behavior

## Quick Commands

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific file
npm test -- src/utils/format.test.ts

# Run in watch mode
npm test -- --watch

# Run E2E tests
npx playwright test

# Run E2E with UI
npx playwright test --ui

# Debug E2E test
npx playwright test --debug

# Update snapshots
npm test -- -u
```

## Reference Files

- `references/test-strategy.md` - Comprehensive test strategy framework
- `references/framework-comparison.md` - Detailed framework comparison
- `references/coverage-patterns.md` - Coverage optimization techniques
- `references/ci-integration.md` - CI/CD pipeline configurations

---

**Covers**: Test strategy | Unit testing | Integration testing | E2E testing | Coverage | CI/CD | Flaky test debugging

**Use with**: security-auditor (security tests) | performance-engineer (load tests) | code-reviewer (test quality)

---

---
name: vitest-testing-patterns
description: Write tests using Vitest and React Testing Library. Use when creating unit tests, component tests, integration tests, or mocking dependencies. Activates for test file creation, mock patterns,
  coverage, and testing best practices.
allowed-tools: Read,Write,Edit,Bash(npm:*,npx:*)
metadata:
  category: Code Quality & Testing
  tags:
  - testing
  - code
  - automation
  - jest
  - react
  pairs-with:
  - skill: test-automation-expert
    reason: Vitest unit testing is one layer in a comprehensive test automation strategy
  - skill: playwright-e2e-tester
    reason: Unit tests (Vitest) and E2E tests (Playwright) form complementary test pyramid layers
  - skill: react-performance-optimizer
    reason: Component test patterns verify that performance optimizations preserve correct behavior
  - skill: typescript-advanced-patterns
    reason: Type-safe test utilities and mock factories leverage advanced TypeScript patterns
---

# Vitest Testing Patterns

This skill helps you write effective tests using Vitest and React Testing Library following project conventions.

## When to Use

✅ **USE this skill for:**
- Writing unit tests for utilities and functions
- Creating component tests with React Testing Library
- Setting up mocks for API calls, databases, or external services
- Integration testing patterns
- Understanding test coverage and CI setup

❌ **DO NOT use for:**
- Jest-specific patterns → similar but check Jest docs for differences
- End-to-end testing → use Playwright or Cypress skills
- Performance testing → use dedicated performance tools
- API contract testing → use OpenAPI/Pact patterns

## Test Infrastructure

**Configuration**: `vitest.config.ts`
- Environment: jsdom
- Setup file: `src/test/setup.ts`
- Coverage: v8 provider

**Commands**:
```bash
npm test              # Watch mode
npm run test:run      # Single run
npm run test:coverage # With coverage
```

## File Organization

```
src/
├── app/api/__tests__/        # API route tests
├── components/__tests__/     # Component tests
├── lib/__tests__/            # Library/utility tests
└── lib/{feature}/__tests__/  # Feature-specific tests
```

Name tests as `{name}.test.ts` or `{name}.test.tsx`.

## Core Testing Patterns

### 1. API Route Tests

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from '../route';
import { NextRequest } from 'next/server';

// Mock dependencies
vi.mock('@/lib/auth', () => ({
  getSession: vi.fn(),
}));

vi.mock('@/db', () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockResolvedValue([]),
  },
}));

describe('GET /api/feature', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    vi.mocked(getSession).mockResolvedValue(null);

    const request = new NextRequest('http://localhost/api/feature');
    const response = await GET(request);

    expect(response.status).toBe(401);
  });

  it('returns data when authenticated', async () => {
    vi.mocked(getSession).mockResolvedValue({ userId: 'user-123' });
    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([{ id: '1', name: 'Test' }]),
      }),
    });

    const request = new NextRequest('http://localhost/api/feature');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveLength(1);
  });
});
```

### 2. Component Tests

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FeatureComponent } from '../FeatureComponent';

// Mock hooks
vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn().mockReturnValue({
    user: { id: 'user-123', name: 'Test User' },
    isLoading: false,
  }),
}));

describe('FeatureComponent', () => {
  it('renders loading state', () => {
    vi.mocked(useAuth).mockReturnValueOnce({
      user: null,
      isLoading: true,
    });

    render(<FeatureComponent />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('handles user interaction', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<FeatureComponent onSubmit={onSubmit} />);

    await user.type(screen.getByRole('textbox'), 'Test input');
    await user.click(screen.getByRole('button', { name: /submit/i }));

    expect(onSubmit).toHaveBeenCalledWith('Test input');
  });

  it('displays error state', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

    render(<FeatureComponent />);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/error/i);
    });
  });
});
```

### 3. Library/Utility Tests

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { processData, formatDate } from '../utils';

describe('processData', () => {
  it('transforms input correctly', () => {
    const input = { raw: 'data' };
    const result = processData(input);

    expect(result).toEqual({
      processed: true,
      data: 'DATA',
    });
  });

  it('throws on invalid input', () => {
    expect(() => processData(null)).toThrow('Invalid input');
  });
});

describe('formatDate', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-15T10:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('formats relative dates', () => {
    const yesterday = new Date('2025-01-14T10:00:00Z');
    expect(formatDate(yesterday)).toBe('yesterday');
  });
});
```

## Mocking Patterns

### Module Mocking

```typescript
// Mock entire module
vi.mock('@/lib/auth', () => ({
  getSession: vi.fn(),
  requireAuth: vi.fn(),
}));

// Mock with partial implementation
vi.mock('date-fns', async () => {
  const actual = await vi.importActual('date-fns');
  return {
    ...actual,
    format: vi.fn(() => '2025-01-15'),
  };
});

// Mock default export (like Anthropic SDK)
vi.mock('@anthropic-ai/sdk', () => ({
  default: class MockAnthropic {
    messages = {
      create: vi.fn().mockResolvedValue({
        content: [{ type: 'text', text: 'Mock response' }],
        usage: { input_tokens: 10, output_tokens: 20 },
      }),
    };
  },
}));
```

### Function Mocking

```typescript
// Create mock function
const mockFn = vi.fn();

// Set return values
mockFn.mockReturnValue('sync value');
mockFn.mockResolvedValue('async value');
mockFn.mockRejectedValue(new Error('Failed'));

// One-time behavior
mockFn.mockReturnValueOnce('first call only');

// Custom implementation
mockFn.mockImplementation((arg) => arg.toUpperCase());

// Verify calls
expect(mockFn).toHaveBeenCalled();
expect(mockFn).toHaveBeenCalledTimes(2);
expect(mockFn).toHaveBeenCalledWith('expected', 'args');
```

### Chained Mock Pattern (Drizzle ORM)

```typescript
vi.mock('@/db', () => ({
  db: {
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ id: '1' }]),
          }),
        }),
      }),
    }),
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([{ id: 'new-1' }]),
      }),
    }),
  },
}));
```

### Timer Mocking

```typescript
describe('debounced function', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('debounces calls', async () => {
    const callback = vi.fn();
    const debounced = debounce(callback, 300);

    debounced();
    debounced();
    debounced();

    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(300);

    expect(callback).toHaveBeenCalledTimes(1);
  });
});
```

## Query Priorities

Use queries in this order (most to least preferred):

1. **getByRole** - Accessible queries (buttons, links, headings)
2. **getByLabelText** - Form fields with labels
3. **getByPlaceholderText** - Inputs with placeholders
4. **getByText** - Non-interactive elements
5. **getByTestId** - Last resort (data-testid)

```typescript
// Preferred
screen.getByRole('button', { name: /submit/i });
screen.getByRole('heading', { level: 1 });
screen.getByLabelText(/email/i);

// Avoid unless necessary
screen.getByTestId('submit-button');
```

## Async Patterns

```typescript
// Wait for element to appear
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument();
});

// Find (built-in waitFor)
const element = await screen.findByText('Loaded');

// Wait for element to disappear
await waitFor(() => {
  expect(screen.queryByText('Loading')).not.toBeInTheDocument();
});
```

## Test Cleanup

```typescript
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();            // React cleanup (automatic with setup.ts)
  vi.clearAllMocks();   // Reset mock call counts
  vi.resetAllMocks();   // Reset mocks to initial state
  vi.restoreAllMocks(); // Restore original implementations
});
```

## Accessibility Testing

```typescript
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

it('has no accessibility violations', async () => {
  const { container } = render(<Component />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

## Common Matchers

```typescript
// jest-dom matchers (from setup.ts)
expect(element).toBeInTheDocument();
expect(element).toBeVisible();
expect(element).toBeDisabled();
expect(element).toHaveTextContent('text');
expect(element).toHaveAttribute('href', '/path');
expect(element).toHaveClass('active');
expect(input).toHaveValue('input value');
```

## References

- [Vitest Mocking Guide](https://vitest.dev/guide/mocking)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro)
- [Testing Library Queries](https://testing-library.com/docs/queries/about)

---

---
name: skill-documentarian
description: Documentation expert for Claude Skills showcase website. Maintains skill-to-website sync, manages tag taxonomy and badges, creates blog-style artifacts, and preserves multi-skill collaborations
  for posterity. Activate on 'document', 'sync skills', 'create artifact', 'validate skills', 'add tags', 'tag management', 'badge', 'metadata'. NOT for code implementation (use domain skills), design creation
  (use web-design-expert), testing (use test-automator), or project planning (use orchestrator).
allowed-tools: Read,Write,Edit,Glob,Grep,Bash,mcp__firecrawl__firecrawl_search,mcp__brave-search__brave_web_search
metadata:
  category: Content & Writing
  pairs-with:
  - skill: site-reliability-engineer
    reason: Ensure docs build correctly
  - skill: skill-coach
    reason: Document quality skills
  tags:
  - documentation
  - skills
  - sync
  - artifacts
  - metadata
---

You are the skill-documentarian, guardian of the Claude Skills showcase website. You ensure every skill in `.claude/skills/` has matching documentation, accurate metadata, proper tags, and that greatness is captured in artifacts.

## Core Mission

1. **Source of Truth**: `.claude/skills/` defines what exists. Website reflects it.
2. **README Maintainer**: Keep `README.md` accurate with skill counts, categories, and install instructions.
3. **Tag Taxonomy Owner**: Assign and maintain skill tags for discoverability.
4. **Badge Manager**: Track NEW/UPDATED badges with proper lifecycle.
5. **Artifact Creator**: Capture multi-skill collaborations in blog-style docs.
6. **Validation Enforcer**: Run scripts that catch drift and mismatches.
7. **Subpage Sync Guardian**: Ensure skill reference docs are exposed as browsable subpages.
8. **Category Enforcer**: Ensure every skill has a valid category for browse page filtering.

## Quick Reference: Key Files

| Purpose | Location |
|---------|----------|
| **Main README** | `README.md` (skill counts, categories, install instructions) |
| Skills data | `website/src/data/skills.ts` (ALL_SKILLS array) |
| Tag definitions | `website/src/types/tags.ts` |
| Skill metadata | `website/src/data/skillMetadata.json` |
| Skill docs | `website/docs/skills/*.md` or `website/docs/skills/*/` (folders with subpages) |
| Hero images | `website/static/img/skills/*-hero.png` |
| **OG image** | `website/static/img/og-image.png` (social preview) |
| OG background | `website/static/img/og-background_*.png` (Ideogram-generated) |
| OG generator | `website/scripts/generate-og-image.sh` |
| Artifacts | `website/src/data/artifacts/` |
| Subpage sync | `website/scripts/syncSkillSubpages.ts` |

## Automated Sync (Pre-commit Hooks)

The pre-commit hook automatically:
- **Validates README.md** skill counts match actual skill count
- Syncs SKILL.md frontmatter → doc file SkillHeader
- Regenerates `skillMetadata.json` with git dates
- **Regenerates OG image** with updated skill count (pixel art + Press Start 2P font)
- Validates angle brackets in markdown
- Auto-adds changed files to commit

**Manual batch sync**: `cd website && npm run sync:skills`
**Manual README sync**: `cd website && npm run sync:readme`
**Manual subpage sync**: `cd website && npm run sync:subpages`
**Manual OG image**: `cd website && bash scripts/generate-og-image.sh`

## OG Image Maintenance (Social Preview)

The OG image (`og-image.png`) is the social media preview shown when sharing the site on Twitter, LinkedIn, Facebook, etc.

### How It Works

1. **Background**: Pixel art generated by Ideogram (Windows 3.1 + vaporwave aesthetic)
2. **Text overlay**: ImageMagick composites text using Press Start 2P font
3. **Dynamic count**: Reads skill count from `skillMetadata.json`
4. **Auto-update**: Pre-commit hook regenerates when skills change

### Dependencies

- **ImageMagick**: `brew install imagemagick`
- **Press Start 2P font**: Install from [Google Fonts](https://fonts.google.com/specimen/Press+Start+2P) to `~/Library/Fonts/`
- **Node.js**: For reading skill count from JSON

### Regenerating Background

If the background needs updating (style refresh, etc.):

```bash
# Use Ideogram to generate new background
mcp__ideogram__generate_image  # Windows 3.1 + vaporwave aesthetic

# Save to: website/static/img/og-background_TIMESTAMP.png
# Update BG_IMAGE path in scripts/generate-og-image.sh
```

### Manual Generation

```bash
cd website
bash scripts/generate-og-image.sh
# Output: static/img/og-image.png
```

## Subpage Sync (Ancillary Documentation)

Skills with `references/`, `templates/`, `examples/`, or `guides/` folders get their markdown files exposed as browsable subpages in the documentation.

### How It Works

1. **Detection**: Script scans `.claude/skills/*/` for supported subfolders
2. **Conversion**: Flat `skill_name.md` becomes folder `skill_name/index.md`
3. **Sync**: Markdown files from source subfolders are copied to doc subfolders
4. **Frontmatter**: Auto-generated if missing (title, sidebar_label, sidebar_position)
5. **Safety**: Angle brackets escaped to prevent MDX compilation errors

### Folder Structure

```
.claude/skills/hr-network-analyst/          website/docs/skills/hr_network_analyst/
├── SKILL.md                          →     ├── index.md (main skill page)
├── references/                             ├── references/
│   ├── data-sources.md               →     │   ├── _category_.json
│   └── graph-metrics.md              →     │   ├── data-sources.md
└── guides/                                 │   └── graph-metrics.md
    └── quickstart.md                 →     └── guides/
                                                ├── _category_.json
                                                └── quickstart.md
```

### Run Subpage Sync

```bash
# During prebuild (automatic)
npm run prebuild  # Includes subpage sync

# Manual sync
npm run sync:subpages

# Or directly
npx tsx scripts/syncSkillSubpages.ts
```

### Docusaurus Doc IDs

Folder-based docs have IDs like `skills/skill_name/skill_name` (not `/index`).
When updating `sidebars.ts`, use the skill folder name twice:
```typescript
// ✅ Correct
'skills/hr_network_analyst/hr_network_analyst'

// ❌ Wrong
'skills/hr_network_analyst/index'
```

## Adding a New Skill to Website

```bash
# 1. Create doc file
touch website/docs/skills/skill_name.md  # Note: underscores!

# 2. Add to ALL_SKILLS array in skills.ts
{
  id: 'skill-name',
  title: 'Skill Title',
  category: 'Category Name',
  path: '/docs/skills/skill_name',
  description: 'Brief description',
  tags: ['tag1', 'tag2', 'tag3'],
  badge: 'NEW'  // Optional
}

# 3. Generate hero image
mcp__ideogram__generate_image  # Windows 3.1 + vaporwave aesthetic

# 4. Verify sync
echo "Skills: $(ls -d .claude/skills/*/ | wc -l)"
echo "In skills.ts: $(grep "{ id:" website/src/data/skills.ts | wc -l)"
```

## Tag Management

**3-5 tags per skill** from these types:
- **Skill Type** (purple): research, analysis, creation, coaching, validation, automation, orchestration
- **Domain** (blue): design, code, ml, cv, audio, 3d, robotics, photography, finance, health, devops...
- **Complexity** (orange): beginner-friendly, advanced, production-ready
- **Integration** (pink): mcp, elevenlabs, accessibility

**Full taxonomy**: See `references/tag-taxonomy.md`

## Badge Management

| Badge | Criteria | Duration |
|-------|----------|----------|
| `NEW` | First published | ~60 days |
| `UPDATED` | 50%+ content expansion | ~30 days |

**Full details**: See `references/badge-metadata-management.md`

## Artifact Creation

Create artifacts when:
- Multi-skill collaboration produces something cool
- New pattern emerges (first time X + Y work together)
- Interactive feature demonstrates capabilities

**Structure**: See `references/artifact-structure.md`
**Preservation guide**: See `guides/ARTIFACT_PRESERVATION.md`

## README Maintenance

The main `README.md` must stay in sync with actual skill inventory. Key sections:

1. **Skill count** in header: "46+ production-ready skills"
2. **Category tables** with accurate skill lists
3. **MCP server configs** with correct JSON
4. **Install instructions** for marketplace, manual, and download options

**Validation check**:
```bash
# Count actual skills vs README claim
ACTUAL=$(ls -d .claude/skills/*/ 2>/dev/null | wc -l | tr -d ' ')
echo "Actual skills: $ACTUAL"

# Check if README needs update (look for skill count pattern)
grep -E '\d+\+? production-ready skills' README.md
```

**When README needs updating**:
- New skill added to `.claude/skills/`
- Skill renamed or removed
- Category reorganization
- MCP server changes
- Install method changes

## Frontmatter Validation (CRITICAL)

When skills are uploaded to Claude's skill marketplace, **only these frontmatter keys are allowed**:
- `name` - Required, lowercase-hyphenated
- `description` - Required, includes activation keywords and NOT clause
- `license` - Optional (e.g., "MIT")
- `allowed-tools` - Comma-separated tool names
- `metadata` - Optional object for custom key-value pairs

**Invalid keys will cause upload failure:**
```
❌ integrates_with, triggers, tools, outputs, coordinates_with, python_dependencies
❌ Any custom YAML keys in frontmatter
```

**Move custom info to the skill body instead:**
```markdown
## Integrations
Works with: orchestrator, team-builder, swift-executor

## Triggers
Activates on: "document", "sync skills", "create artifact"
```

**Validation command:**
```bash
# Find skills with invalid frontmatter keys
for skill in .claude/skills/*/SKILL.md; do
  invalid=$(sed -n '/^---$/,/^---$/p' "$skill" | grep -E "^[a-zA-Z_-]+:" | cut -d: -f1 | grep -vE "^(name|description|license|allowed-tools|metadata)$")
  if [ -n "$invalid" ]; then
    echo "=== $(dirname "$skill" | xargs basename) ==="
    echo "$invalid"
  fi
done
```

## Category Validation (CRITICAL)

Skills **must** have a valid category for the browse page to be useful. Invalid or missing categories make skills invisible to users filtering by category.

### Valid Categories

| Category | Emoji | Description |
|----------|-------|-------------|
| AI & Machine Learning | 🤖 | ML models, computer vision, NLP, embeddings |
| Code Quality & Testing | ✅ | Testing, code review, refactoring, security |
| Content & Writing | ✍️ | Documentation, technical writing, diagrams |
| Data & Analytics | 📊 | Data pipelines, analytics, visualization |
| Design & Creative | 🎨 | UI/UX, graphics, audio, visual design |
| DevOps & Site Reliability | ⚙️ | CI/CD, infrastructure, monitoring |
| Business & Monetization | 💰 | Entrepreneurship, finance, marketing |
| Research & Analysis | 🔬 | Research, competitive analysis |
| Productivity & Meta | 🚀 | Workflow, orchestration, skill management |
| Lifestyle & Personal | 🧘 | Health, coaching, personal development |

### Category Validation Command

```bash
# Check all skills have valid categories
VALID_CATS="AI & Machine Learning|Code Quality & Testing|Content & Writing|Data & Analytics|Design & Creative|DevOps & Site Reliability|Business & Monetization|Research & Analysis|Productivity & Meta|Lifestyle & Personal"

for skill in .claude/skills/*/SKILL.md; do
  cat=$(grep -m1 "^category:" "$skill" | sed 's/category: *//')
  if [ -z "$cat" ]; then
    echo "❌ MISSING category: $(dirname "$skill" | xargs basename)"
  elif ! echo "$cat" | grep -qE "^($VALID_CATS)$"; then
    echo "❌ INVALID category '$cat': $(dirname "$skill" | xargs basename)"
  fi
done && echo "✅ All categories valid"
```

### When to Validate Categories

- **Before accepting skill submissions** (automated workflow checks this)
- **After running `npm run skills:generate`** (regenerates skills.ts)
- **When browse page filtering seems broken**

### Fixing Invalid Categories

1. Edit the skill's `SKILL.md` frontmatter
2. Change `category:` to one of the 10 valid values above
3. Run `cd website && npm run skills:generate` to regenerate skills.ts
4. Verify on browse page at `/skills`

## Validation Commands

```bash
# Find skills missing from skills.ts
for skill in .claude/skills/*/; do
  name=$(basename "$skill")
  grep -q "id: '$name'" website/src/data/skills.ts || echo "Missing: $name"
done

# Find skills without hero images
for skill in .claude/skills/*/; do
  name=$(basename "$skill")
  [ -f "website/static/img/skills/$name-hero.png" ] || echo "No hero: $name"
done

# Count badge usage
echo "NEW: $(grep "badge: 'NEW'" website/src/data/skills.ts | wc -l)"
echo "UPDATED: $(grep "badge: 'UPDATED'" website/src/data/skills.ts | wc -l)"

# Validate README skill count
ACTUAL=$(ls -d .claude/skills/*/ 2>/dev/null | wc -l | tr -d ' ')
README_COUNT=$(grep -oE '\d+\+? production-ready skills' README.md | grep -oE '\d+' | head -1)
[ "$ACTUAL" -gt "$README_COUNT" ] && echo "⚠️  README outdated: $ACTUAL skills exist, README says $README_COUNT"

# Find skills with subfolders not yet synced
for skill in .claude/skills/*/; do
  name=$(basename "$skill")
  docname="${name//-/_}"
  for sub in references templates examples guides; do
    if [ -d "$skill$sub" ]; then
      [ -d "website/docs/skills/$docname/$sub" ] || echo "Missing subpages: $name/$sub"
    fi
  done
done
```

## When to Use This Skill

**Use for:**
- Keeping README.md accurate (skill counts, categories, install instructions)
- Assigning and updating skill tags
- **Validating skill categories** (ensure browse page filtering works)
- Creating artifact documentation
- Validating skill-to-website sync
- Generating hero images
- **Maintaining OG image** (social preview with dynamic skill count)
- Writing changelogs and API docs
- Managing NEW/UPDATED badges
- Syncing skill subpages (references, guides, templates, examples)

**Do NOT use for:**
- Writing code (use domain-specific skills)
- Creating designs (use web-design-expert)
- Testing (use test-automator)
- Project planning (use orchestrator, team-builder)

## Anti-Patterns

### Anti-Pattern: Code Comments as Documentation
**What it looks like**: "The code is self-documenting"
**Why it's wrong**: Code shows HOW, not WHY. Comments for implementers, docs for users.
**Instead**: Separate code comments from user documentation.

### Anti-Pattern: Stale Documentation
**What it looks like**: Docs describe features that no longer exist
**Why it's wrong**: Erodes trust, wastes user time
**Instead**: Version docs with code, add timestamps, run CI checks.

### Anti-Pattern: Wall of Text
**What it looks like**: Dense paragraphs with no structure
**Why it's wrong**: Intimidating, unscannable
**Instead**: Headers, lists, code examples, diagrams.

### Anti-Pattern: Assuming Context
**What it looks like**: "Just run the script and it works"
**Why it's wrong**: Assumes reader knows which script, where, what args
**Instead**: Exact commands, full paths, expected output.

## Reference Files

- `references/tag-taxonomy.md` - Complete tag type reference
- `references/documentation-templates.md` - README, tutorial, API templates
- `references/badge-metadata-management.md` - Badge lifecycle and metadata
- `references/artifact-structure.md` - Artifact JSON schema and workflow
- `guides/ARTIFACT_PRESERVATION.md` - Complete preservation guide
- `guides/ARTIFACT_QUICKREF.md` - Quick checklist

## Documentation Quality Rules

**5-Minute Rule**: Can someone unfamiliar understand basics in 5 minutes?
**6-Month Rule**: Will YOU understand this in 6 months without context?

---

**Remember**: Documentation is a love letter to your future self and your users. Write it with care, maintain it with discipline, and it will compound value over time.

---

---
name: data-viz-2025
description: State-of-the-art data visualization for React/Next.js/TypeScript with Tailwind CSS. Creates compelling, tested, and accessible visualizations following Tufte principles and NYT Graphics standards.
  Activate on "data viz", "chart", "graph", "visualization", "dashboard", "plot", "Recharts", "Nivo", "D3". NOT for static images, print graphics, or basic HTML tables.
allowed-tools: Read,Write,Edit,Bash
metadata:
  category: Data & Analytics
  tags:
  - data
  - viz
  - '2025'
  - data-viz
  - chart
  pairs-with:
  - skill: react-performance-optimizer
    reason: Large dataset visualizations require React performance optimization for smooth rendering
  - skill: large-scale-map-visualization
    reason: Map visualizations are a specialized subset of the broader data viz discipline
  - skill: color-contrast-auditor
    reason: Data visualization accessibility depends on proper color contrast in charts and legends
  - skill: typescript-advanced-patterns
    reason: Type-safe chart data structures and generic visualization components benefit from advanced TS
---

# Data Visualization 2025: The Art & Science of Visual Communication

Create visualizations that Seaborn users, Tufte readers, and everyone else will love. Marry NYT Graphics rigor with MoMA aesthetics, Nike energy, and On Kawara precision.

## When to Use This Skill

✅ **Use for:**
- Building interactive charts, dashboards, and data stories
- Complex visualizations (chord diagrams, Sankey flows, network graphs)
- Real-time data displays with animations
- Mobile-responsive data components
- Accessible, tested visualizations for production

❌ **NOT for:**
- Static PNG/SVG exports without interaction (use design tools)
- Basic HTML tables (use semantic markup)
- Print-only graphics (different constraints)
- Simple icon displays (use icon libraries)

## Core Philosophy: The Three Pillars

### 1. **Clarity** (Tufte's Data-Ink Ratio)
Every visual element must earn its place. Remove chart junk, maximize signal-to-noise.

### 2. **Beauty** (Aesthetic Standards)
Visualizations are art. Use spring physics, thoughtful color, and premium design systems.

### 3. **Truth** (Graphical Integrity)
Data representation must be honest. Test rigorously, document assumptions, preserve context.

## Quick Decision Tree

```
What are you building?
├─ Exploratory analysis / many iterations
│  └─ → Observable Plot (grammar-of-graphics)
│
├─ Standard business charts (bars, lines, pies)
│  ├─ Simple React integration needed
│  │  └─ → Recharts (easiest, most popular)
│  └─ Premium aesthetics + theming
│     └─ → Nivo (beautiful out of the box)
│
├─ Custom, one-of-a-kind visualizations
│  ├─ Need low-level control
│  │  └─ → Visx (React + D3 primitives)
│  └─ Full D3 power
│     └─ → D3.js directly (steeper learning curve)
│
└─ Dashboard with Tailwind design system
   ├─ → Tremor (purpose-built for dashboards)
   └─ → shadcn-ui Charts (Recharts + shadcn styling)
```

## The Data Viz Stack (2025)

### Recommended Packages

```json
{
  "dependencies": {
    "@observablehq/plot": "^0.6.0",        // Exploratory, grammar-of-graphics
    "recharts": "^2.12.0",                  // React charts, simple & popular
    "@nivo/core": "^0.87.0",                // Beautiful, themeable charts
    "@visx/visx": "^3.10.0",                // Low-level D3 + React primitives
    "d3": "^7.9.0",                         // Direct D3 for custom work
    "@tremor/react": "^3.15.0",             // Tailwind dashboard components
    "framer-motion": "^11.0.0"              // Smooth animations
  },
  "devDependencies": {
    "@percy/cli": "^1.29.0",                // Visual regression testing
    "@testing-library/react": "^14.2.0",    // Component testing
    "@storybook/react": "^7.6.0"            // Component playground
  }
}
```

### When to Use Each Library

**Observable Plot** - You want ggplot2/Vega-Lite in JavaScript
- Grammar-of-graphics approach (marks, scales, transforms)
- Perfect for rapid prototyping
- Great for notebooks and exploratory analysis

**Recharts** - You want it to "just work" in React
- Component-based (everything is a `<Component />`)
- Excellent documentation and community
- TypeScript support built-in
- Smallest learning curve

**Nivo** - You want visually stunning results
- 20+ chart types with beautiful defaults
- Canvas, SVG, and HTML rendering
- Server-side rendering support (unique feature)
- Extensive customization via props

**Visx** - You want maximum control with React patterns
- Low-level primitives (scales, axes, shapes)
- Compose your own chart types
- Airbnb's D3 + React toolkit
- Best for novel visualizations

**D3.js** - You want unlimited power (and responsibility)
- Full control over every pixel
- Steepest learning curve
- Best for advanced, custom work
- Use with `useEffect` and `useRef` in React

## The Tufte Checklist

Before shipping any visualization, verify:

- [ ] **Data-ink ratio maximized** - Remove gridlines, decorations, 3D effects, shadows
- [ ] **Graphical integrity** - Visual representation proportional to data values
- [ ] **Clear labeling** - Direct labels on data (not legends requiring color matching)
- [ ] **No chart junk** - No unnecessary ornamentation or Moiré vibration
- [ ] **Layered information** - Use small multiples instead of overloaded single charts
- [ ] **Show data variation, not design variation** - Consistent visual encoding

Read `references/tufte-principles.md` for deep dive.

## The NYT Graphics Workflow

The New York Times graphics team process:

1. **Make 500 charts** → Pick the one that displays information best
2. **Simplify within reason** → Remove noise and clutter
3. **Annotate with insight** → Words should highlight patterns, not just describe data
4. **Test with real users** → Watch people interact, identify confusion
5. **Responsive by default** → Mobile-first, progressive enhancement

Read `references/nyt-workflow.md` for case studies.

## Animation & Micro-interactions

Data viz isn't static. Movement communicates:

### When to Animate
- **State transitions** - Data updates, filter changes
- **Draw attention** - Highlight insights, guide the eye
- **Show relationships** - Morphing between views reveals structure
- **Delight** - Thoughtful motion = premium feel

### Animation Principles
```typescript
// Use spring physics, not linear easing
const springConfig = {
  type: "spring",
  stiffness: 300,
  damping: 30
};

// Stagger for multiple elements
const staggerChildren = {
  delayChildren: 0.1,
  staggerChildren: 0.05
};

// Respect prefers-reduced-motion
const shouldAnimate = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
```

Read `references/animation-patterns.md` for complete patterns library.

## Color: Beyond the Rainbow

### Semantic Color Systems
```typescript
// Qualitative (categorical data)
const categorical = [
  "#d97706", "#7c3aed", "#059669", "#dc2626", "#2563eb"
];

// Sequential (ordered data, low to high)
const sequential = [
  "#fef3c7", "#fcd34d", "#f59e0b", "#d97706", "#92400e"
];

// Diverging (data with meaningful center)
const diverging = [
  "#dc2626", "#f87171", "#fef2f2", "#c7d2fe", "#6366f1"
];
```

### Accessibility Requirements
- **Contrast ratio ≥4.5:1** for text on backgrounds
- **Don't rely on color alone** - Use shapes, patterns, labels
- **Colorblind-safe palettes** - Test with simulators
- **Consider dark mode** - Colors must work in both themes

## Testing Data Visualizations

### Visual Regression Testing
```bash
# Percy - Automated visual testing
npx percy snapshot ./storybook-static

# Chromatic - For Storybook
npx chromatic --project-token=<token>
```

### Data Accuracy Testing
```typescript
// Verify rendered elements match data
test('bar chart renders correct number of bars', () => {
  const data = [{ x: 'A', y: 10 }, { x: 'B', y: 20 }];
  render(<BarChart data={data} />);

  const bars = screen.getAllByTestId('bar');
  expect(bars).toHaveLength(2);
});

// Verify scale accuracy
test('bar heights proportional to values', () => {
  const data = [{ x: 'A', y: 10 }, { x: 'B', y: 20 }];
  render(<BarChart data={data} />);

  const bars = screen.getAllByTestId('bar');
  const heights = bars.map(b => parseInt(b.style.height));
  expect(heights[1]).toBe(heights[0] * 2); // B is 2x A
});
```

Read `references/testing-strategies.md` for comprehensive test suites.

## Responsive Design Patterns

### Mobile-First Approach
```typescript
// Desktop: Show everything
// Tablet: Simplify axes, reduce labels
// Mobile: Minimal chart, key insights only

const ChartResponsive = ({ data }: Props) => {
  const isMobile = useMediaQuery('(max-width: 640px)');

  return (
    <ResponsiveContainer width="100%" height={isMobile ? 200 : 400}>
      <LineChart data={data}>
        {!isMobile && <CartesianGrid strokeDasharray="3 3" />}
        <XAxis
          dataKey="date"
          tick={isMobile ? { fontSize: 10 } : undefined}
          interval={isMobile ? 'preserveStartEnd' : 'auto'}
        />
        <YAxis tick={isMobile ? false : undefined} />
        <Tooltip />
        <Line type="monotone" dataKey="value" stroke="#d97706" />
      </LineChart>
    </ResponsiveContainer>
  );
};
```

### Touch-Friendly Interactions
- **Minimum touch target: 44×44px** - Tooltips, buttons, interactive elements
- **Swipe gestures** - Navigate time series, change views
- **Pinch-to-zoom** - For dense charts (use carefully)
- **Long-press context menus** - Advanced actions

## Data Storytelling

Every visualization tells a story. Follow the narrative arc:

1. **Hook** - What's the surprising insight?
2. **Context** - Why should we care?
3. **Evidence** - Show the data clearly
4. **Conclusion** - What should we do?

### Narrative Techniques
- **Scrollytelling** - Charts animate as user scrolls
- **Progressive disclosure** - Start simple, reveal complexity
- **Annotations** - Point out the insight, don't make users hunt
- **Comparison** - Show before/after, us vs. them, expected vs. actual

Read `references/data-storytelling.md` for narrative frameworks.

## Common Anti-Patterns

### ❌ The "Rainbow Vomit" Pie Chart
**Problem:** 12 colors, tiny slices, legend on the side
**Solution:** Max 5 categories, direct labels, consider bar chart instead

### ❌ The "Misleading Axis" Bar Chart
**Problem:** Y-axis doesn't start at zero, exaggerates differences
**Solution:** Always start at zero for bar charts (lines can vary)

### ❌ The "Dual-Axis Confusion" Line Chart
**Problem:** Two Y-axes with different scales mislead viewers
**Solution:** Use separate charts or normalize to same scale

### ❌ The "3D Perspective" Lie
**Problem:** 3D effects distort data perception
**Solution:** Stick to 2D, use color/size for third dimension

### ❌ The "Spinner of Death" Loading State
**Problem:** Empty screen with spinner for 2+ seconds
**Solution:** Skeleton loading that shows chart structure immediately

Read `references/antipatterns.md` for exhaustive catalog.

## Implementation Workflow

### 1. Explore Your Data
```bash
# Use Observable Plot for rapid iteration
npm install @observablehq/plot

# Create throwaway prototypes, iterate fast
# When you find the right chart, implement in production library
```

### 2. Build Production Component
```typescript
// Use Recharts for standard charts
// Use Nivo for beautiful, themeable charts
// Use Visx/D3 for custom visualizations

// Always wrap in error boundaries
// Always show skeleton loading state
// Always handle empty/loading/error states
```

### 3. Test Thoroughly
```bash
# Visual regression testing
npx percy snapshot

# Component testing
npm test -- --coverage

# Accessibility testing
npx axe-core src/components/charts
```

### 4. Document & Deploy
```typescript
// Storybook for component playground
// Props documentation with TypeScript
// Usage examples for each chart type
```

## AI-Enhanced Visualizations

### When to Use Claude/Haiku
- **Dynamic annotations** - Generate insights from data
- **Color palette suggestions** - AI-powered color harmony
- **Chart type recommendations** - "What's the best way to show this?"
- **Accessibility descriptions** - Auto-generate alt text

### Example: AI Annotation
```typescript
const generateInsight = async (data: DataPoint[]) => {
  const response = await fetch('/api/claude', {
    method: 'POST',
    body: JSON.stringify({
      model: 'claude-haiku',
      prompt: `Analyze this data and provide ONE key insight (max 15 words): ${JSON.stringify(data)}`
    })
  });

  return response.text(); // "Sales peaked in Q3, driven by mobile conversions"
};
```

## Inspiration Galleries

**Study these regularly:**
- [ObservableHQ Featured Notebooks](https://observablehq.com/@observablehq/explore-featured-collections)
- [Information is Beautiful Awards](https://www.informationisbeautifulawards.com/)
- [NYT Graphics on Twitter](https://twitter.com/nytgraphics)
- [FlowingData](https://flowingdata.com/)
- [Datawrapper River](https://river.datawrapper.de/)
- [The Pudding](https://pudding.cool/)

## Performance Optimization

### Bundle Size Management
```typescript
// ❌ DON'T import entire library
import { LineChart } from 'recharts';

// ✅ DO tree-shake where possible
import LineChart from 'recharts/lib/chart/LineChart';

// Use dynamic imports for heavy charts
const HeavyChart = dynamic(() => import('./HeavyChart'), {
  loading: () => <ChartSkeleton />,
  ssr: false // Disable SSR for client-only charts
});
```

### Canvas vs SVG
- **SVG** - Better for &lt; 1000 data points, accessibility, crisp at any scale
- **Canvas** - Better for > 1000 data points, animations, performance
- **WebGL** - Best for > 10,000 data points, 3D, gaming-level performance

### Virtualization
For large datasets, render only visible portion:
```typescript
// Use react-window or react-virtualized for long lists
// Aggregate/sample data for chart display
// Store full dataset separately for export
```

## Accessibility Standards (WCAG AA)

### Requirements
- **Keyboard navigation** - All interactive elements accessible via Tab
- **Screen reader support** - Provide data tables as alternative
- **Focus indicators** - Visible focus states for interactive elements
- **Color contrast** - ≥4.5:1 for small text, ≥3:1 for large text
- **Reduced motion** - Respect `prefers-reduced-motion: reduce`

### Implementation
```typescript
<figure role="img" aria-labelledby="chart-title chart-desc">
  <h2 id="chart-title">Sales Over Time</h2>
  <p id="chart-desc">
    Line chart showing sales increased 45% from Q1 to Q4,
    peaking in November at $2.3M.
  </p>

  <LineChart data={data} />

  {/* Provide data table alternative */}
  <details>
    <summary>View data table</summary>
    <table>...</table>
  </details>
</figure>
```

## Reference Materials

This skill includes comprehensive reference documentation:

- **`references/tufte-principles.md`** - Edward Tufte's data visualization principles with examples
- **`references/library-comparison.md`** - Deep dive on Observable Plot, Recharts, Nivo, Visx, D3
- **`references/testing-strategies.md`** - Visual regression, component testing, accessibility testing
- **`references/animation-patterns.md`** - Motion design patterns for charts
- **`references/data-storytelling.md`** - Narrative techniques and scrollytelling patterns
- **`references/antipatterns.md`** - Common mistakes and how to avoid them
- **`references/nyt-workflow.md`** - New York Times graphics team best practices

## Utility Scripts

- **`scripts/data-transform.ts`** - Common data transformations (rollup, pivot, normalize)
- **`scripts/chart-test-helpers.ts`** - Testing utilities for verifying chart accuracy
- **`scripts/color-palette-generator.ts`** - Generate accessible color palettes
- **`scripts/performance-benchmark.ts`** - Benchmark chart rendering performance

## Quick Start: Building Your First Chart

```typescript
// 1. Install dependencies
// npm install recharts framer-motion

// 2. Create a simple line chart
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const data = [
  { month: 'Jan', value: 400 },
  { month: 'Feb', value: 300 },
  { month: 'Mar', value: 600 },
];

export const SalesChart = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#d97706"
          strokeWidth={2}
          dot={{ fill: '#d97706', r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
});

// 3. Test it
// 4. Ship it with confidence
```

---

**Remember:** The best visualization is the one that makes the insight obvious. When in doubt, simplify. When confused, prototype 10 options. When shipping, test ruthlessly.

This skill guides: Chart selection | Library integration | Testing strategies | Animation patterns | Accessibility compliance | Performance optimization

---

---
name: ux-friction-analyzer
description: Comprehensive UX analysis using cognitive psychology, ADHD-friendly design, Gestalt principles, and flow state engineering. Specializes in friction audits, user journey simulation, cognitive
  load optimization, and Fitts' Law application. Activate on "analyze UX", "friction audit", "user journey", "ADHD-friendly", "optimize flow", "reduce cognitive load", "UX audit", "conversion optimization".
  NOT for visual design execution (use web-design-expert), A/B testing implementation (use frontend-developer), or accessibility compliance auditing (use accessibility-auditor).
allowed-tools: Read,Write,Edit,WebFetch
metadata:
  category: Design & Creative
  pairs-with:
  - skill: web-design-expert
    reason: Implement UX recommendations
  - skill: adhd-design-expert
    reason: Deep neurodivergent design patterns
  - skill: frontend-developer
    reason: Technical implementation of UX fixes
  tags:
  - ux
  - accessibility
  - cognitive-load
  - adhd-friendly
  - user-research
---

# UX Friction Analyzer

A comprehensive skill for analyzing and optimizing user experience through cognitive psychology, ADHD-friendly design, and flow state engineering.

## Activation

Use this skill when:
- Designing new interfaces or user flows
- Auditing existing UX for friction points
- Optimizing for neurodivergent users (ADHD, autism)
- Simulating user journeys before building
- Reducing cognitive load in complex applications

Trigger phrases: "analyze UX", "friction audit", "user journey", "ADHD-friendly", "optimize flow", "reduce cognitive load"

---

## Core Frameworks

### 1. ADHD-Friendly Design Principles

Apply these patterns to ALL interfaces:

| Principle | Implementation | Why It Matters |
|-----------|----------------|----------------|
| **Progressive Disclosure** | Show one task at a time; hide future steps | Prevents overwhelm, maintains focus |
| **Context Preservation** | Auto-save every keystroke; never lose work | Reduces anxiety about losing progress |
| **Gentle Reminders** | Status updates, not alarms; no red urgency | Avoids panic, maintains calm |
| **Pause & Resume** | Session state persists across days/weeks | Respects inconsistent schedules |
| **Minimal Distractions** | Single focus area; dim non-active panels | Reduces competing stimuli |
| **Chunked Progress** | Visual cards/steps, not endless scrolling | Creates completion dopamine hits |
| **Predictable Navigation** | Same layout always; no surprises | Reduces reorientation cost |
| **Calm Mode Option** | Reduced animations, muted colors on demand | Accommodates sensory sensitivity |

### 2. Gestalt Psychology

Apply these perception principles:

```
PROXIMITY
─────────
Elements close together = perceived as related
White space creates natural boundaries

┌─────────┐  ┌─────────┐     ┌─────────┐  ┌─────────┐
│ Related │  │ Related │     │ Other   │  │ Other   │
│ Item A  │  │ Item B  │     │ Group A │  │ Group B │
└─────────┘  └─────────┘     └─────────┘  └─────────┘
     ↑ CLOSE = GROUPED            ↑ SEPARATE = DISTINCT

SIMILARITY
──────────
Same color/shape/size = perceived as related function

┌──────┐  ┌──────┐  ┌──────┐     ┌──────┐  ┌──────┐
│ BLUE │  │ BLUE │  │ BLUE │     │ CORAL│  │ CORAL│
│ Save │  │ Copy │  │ Edit │     │ Del  │  │ Clear│
└──────┘  └──────┘  └──────┘     └──────┘  └──────┘
     ↑ SAME = Related actions         ↑ DIFFERENT = Destructive

CONTINUITY
──────────
Eye follows lines/paths naturally

Step 1 ──→ Step 2 ──→ Step 3 ──→ Complete
   ●──────────●──────────●──────────●

CLOSURE
───────
Brain completes incomplete shapes
Use for progress indicators, loading states

[ ████████░░░░░░░░ ] 50% - brain "sees" the end
```

### 3. Cognitive Load Theory

Three types of mental load to manage:

| Type | Definition | Strategy |
|------|------------|----------|
| **Intrinsic** | Task complexity itself | Can't eliminate; acknowledge it |
| **Extraneous** | Poor design adding effort | ELIMINATE THIS - your job |
| **Germane** | Learning/understanding | Minimize for repeat users |

**Working Memory Limits:**
- 7±2 items maximum (Miller's Law)
- 4 chunks optimal for complex tasks
- Micro-breaks every 25 minutes

**Reduce Extraneous Load By:**
- Removing unnecessary choices
- Using recognition over recall
- Providing smart defaults
- Eliminating decorative elements that don't inform

### 4. Fitts' Law

Time to acquire target = f(Distance / Size)

```
IMPLICATIONS FOR BUTTONS:
─────────────────────────

  ┌───────────────────┐          vs          ┌──┐
  │     GENERATE      │                      │Go│
  │                   │                      └──┘
  └───────────────────┘
         ↑                                     ↑
  44px+ touch target                   Hard to hit
  Easy to acquire                      Frustrating

MINIMUM SIZES:
- iOS: 44x44 CSS pixels
- Android: 48x48 CSS pixels
- Desktop: 32x32 minimum, 44x44 preferred

EDGE TARGETS ARE INFINITE:
  ┌─────────────────────────────────────────────────────┐
  │ ■ LOGO                                    MENU ■   │
  │                                                     │
  │   Screen edges = can't overshoot                   │
  │   Place critical actions at corners/edges          │
  │                                                     │
  │ ■ HELP                                  EXPORT ■   │
  └─────────────────────────────────────────────────────┘

ICON + LABEL > ICON ALONE:
- Larger target area
- Reduced ambiguity
- Faster acquisition
```

### 5. Flow State Engineering

**Key Metrics:**
- 15-25 minutes to enter flow state
- 23 minutes to recover from interruption
- 40% productivity loss with frequent interruptions
- Only 41% of work time spent in flow (McKinsey)

**Flow Conditions:**
1. Clear goals for the current task
2. Immediate feedback on actions
3. Balance between challenge and skill
4. No anxiety about failure

**Preserve Flow By:**
- Background processing (don't block UI)
- Push notifications when ready (bring user back faster)
- Quick re-orientation panels after breaks
- Auto-save eliminating "save anxiety"
- Undo everything (confidence to experiment)

---

## Analysis Methodology

### Step 1: Create Decision Tree

Map every user path with probabilities:

```
                    ┌─────────────┐
                    │ USER LANDS  │
                    └──────┬──────┘
                           │
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
     ┌──────────┐   ┌──────────┐   ┌──────────┐
     │ Action A │   │ Action B │   │ Action C │
     │  (40%)   │   │  (45%)   │   │  (15%)   │
     └────┬─────┘   └────┬─────┘   └────┬─────┘
          │              │              │
          ▼              ▼              ▼
        [Next]         [Next]         [Next]
```

**For each edge, record:**
- Probability (%)
- Friction score (1-10)
- Time to complete (seconds/minutes)
- Cognitive load (low/medium/high)

### Step 2: Simulate User Journeys

Create detailed simulations for each persona:

**Template:**
```
TIME    ACTION                           COGNITIVE STATE           FRICTION
─────────────────────────────────────────────────────────────────────────────
0:00    [User action]                    [Mental state]            Low/Med/High
        └─ [System response or UI shown]

0:15    [Next action]                    [How they feel]           Low/Med/High
        └─ [What happens]
        └─ PROBLEM: [Friction point if any]

...continue...
─────────────────────────────────────────────────────────────────────────────
TOTAL TIME: X minutes
FRICTION POINTS: N (list them)
ABANDONMENT RISKS: N (critical moments)
DELIGHT MOMENTS: N (positive surprises)
```

**Personas to simulate:**
1. **Expert User** - Knows the system, moving fast
2. **New User** - First time, needs guidance
3. **Distracted User** - Context switching, interruptions
4. **Explorer** - No goal, seeing what's possible
5. **Completer** - Trying to finish, hitting obstacles

### Step 3: Friction Analysis Matrix

Quantify and prioritize:

| Friction Point | Users Affected | Severity (1-10) | Fix Difficulty | Priority Score |
|----------------|---------------|-----------------|----------------|----------------|
| [Issue 1]      | X%            | N               | Easy/Med/Hard  | HIGH/MED/LOW   |
| [Issue 2]      | X%            | N               | Easy/Med/Hard  | HIGH/MED/LOW   |

**Priority Formula:**
```
Priority = (Users Affected × Severity) / Fix Difficulty
```

### Step 4: Impedance Mapping

Compare current vs ideal:

```
TASK                          CURRENT IMPEDANCE     IDEAL IMPEDANCE
────────────────────────────────────────────────────────────────────
[Task 1]                      Low (X sec)           ✓ Optimal
[Task 2]                      Medium (X sec)        Could be Y sec
[Task 3]                      HIGH (X min)          Should be Y sec
```

### Step 5: Time-Loss Analysis

Calculate context switch costs:

```
Action                        Frequency    Time Lost Each    Total Impact
─────────────────────────────────────────────────────────────────────────
[Interruption type 1]         X/session    Y min             Z min
[Interruption type 2]         X/session    Y min             Z min
─────────────────────────────────────────────────────────────────────────
TOTAL CONTEXT SWITCH LOSS                                    Z min/session
```

---

## Optimization Patterns

### Immediate Fixes (Low Effort, High Impact)

1. **Giant CTA on Landing**
   ```html
   <button class="cta" style="min-height: 60px; min-width: 200px;">
     Primary Action
     <span class="subtext">Supporting text</span>
   </button>
   ```

2. **Visible Edit Affordances**
   - Show pencil/edit icons by default, not just on hover
   - Add tooltips: "Click to edit"

3. **Auto-Fill Prompts**
   - After user completes 1 item manually, offer to auto-complete rest
   - "Want me to fill in the remaining X items?"

4. **Floating Action Buttons**
   - Critical actions always visible (not buried in menus)
   - Bottom-right for mobile thumb zone

5. **Progress Indicators**
   - Show "Step X of Y" always
   - Visual progress bar at top

### Medium-Term Improvements

1. **Re-Orientation Panels**
   ```
   ┌─────────────────────────────────────────────┐
   │  Welcome back! Here's where you left off:  │
   │                                            │
   │  ✓ Step 1: Complete                        │
   │  → Step 2: In progress (60%)               │
   │  ○ Step 3: Not started                     │
   │                                            │
   │  [Continue where I left off]               │
   └─────────────────────────────────────────────┘
   ```

2. **Keyboard Shortcuts**
   - Number keys for mode switching (1, 2, 3...)
   - Cmd+Enter for primary action
   - Escape for cancel/close

3. **Background Processing**
   - Never block UI for long operations
   - Show progress, allow user to continue
   - Push notification when complete

4. **Smart Defaults**
   - Pre-fill based on user history
   - Remember last-used settings
   - Suggest most common option first

### Long-Term Vision

1. **Predictive UI**
   - Anticipate next action based on patterns
   - Pre-load likely next screens
   - Suggest before user asks

2. **Personalized Complexity**
   - Simple mode for new users
   - Power user mode unlocks over time
   - User controls their complexity level

3. **Accessibility Suite**
   - High contrast mode
   - Reduced motion option
   - Screen reader optimization
   - Keyboard-only navigation

---

## Checklist for New Features

Before shipping any feature, verify:

### Cognitive Load
- [ ] Can user complete with ≤4 things in working memory?
- [ ] Are there unnecessary choices that could be defaults?
- [ ] Is recognition used instead of recall?

### ADHD-Friendly
- [ ] Can user pause and resume without losing context?
- [ ] Are there gentle progress indicators (not anxiety-inducing)?
- [ ] Is the interface calm (not visually noisy)?

### Fitts' Law
- [ ] Are primary buttons ≥44px tall?
- [ ] Are destructive actions away from common paths?
- [ ] Do buttons have labels, not just icons?

### Flow Preservation
- [ ] Does any action block the UI for &gt;2 seconds?
- [ ] Can long operations run in background?
- [ ] Is there a clear "done" state?

### Error Recovery
- [ ] Can every action be undone?
- [ ] Are error messages actionable (not just "Error")?
- [ ] Is auto-save enabled?

---

## Example Analysis Output

When running this skill, produce a document with:

1. **Executive Summary** - Key findings in 3 bullets
2. **Decision Tree** - All user paths with probabilities
3. **User Journey Simulations** - 3-5 personas, full timeline
4. **Friction Matrix** - Prioritized issues table
5. **Optimization Recommendations** - Immediate/Medium/Long-term
6. **Implementation Checklist** - Specific changes to make

---

## Integration Points

- **web-design-expert**: Implement UX recommendations visually
- **adhd-design-expert**: Deep neurodivergent design patterns
- **frontend-developer**: Technical implementation of fixes
- **diagramming-expert**: Create user flow diagrams

---

## Sources

- [NN/g: Minimize Cognitive Load](https://www.nngroup.com/articles/minimize-cognitive-load/)
- [NN/g: Fitts's Law](https://www.nngroup.com/articles/fitts-law/)
- [Laws of UX](https://lawsofux.com/)
- [IxDF: Gestalt Principles](https://www.interaction-design.org/literature/topics/gestalt-principles)
- [Stack Overflow: Developer Flow State](https://stackoverflow.blog/2018/09/10/developer-flow-state-and-its-impact-on-productivity/)
- [Medium: ADHD UX Design](https://medium.com/design-bootcamp/ux-design-for-adhd-when-focus-becomes-a-challenge-afe160804d94)

---

**Core Philosophy**: Every click, every second of confusion, every moment of "where am I?" is friction stealing from your users. Design for the distracted, optimize for the overwhelmed, and everyone benefits.

---

---
name: github-actions-pipeline-builder
description: Build production CI/CD pipelines with GitHub Actions. Implements matrix builds, caching, deployments, testing, security scanning. Use for automated testing, deployments, release workflows.
  Activate on "GitHub Actions", "CI/CD", "workflow", "deployment pipeline", "automated testing". NOT for Jenkins/CircleCI, manual deployments, or non-GitHub repositories.
allowed-tools: Read,Write,Edit,Bash
metadata:
  category: DevOps & Site Reliability
  tags:
  - github
  - actions
  - pipeline
  - github-actions
  - ci/cd
  pairs-with:
  - skill: devops-automator
    reason: GitHub Actions is one of the primary CI/CD platforms that DevOps automation targets
  - skill: docker-containerization
    reason: Container builds and registry pushes are the most common GitHub Actions workflow steps
  - skill: git-workflow-expert
    reason: Git branching strategies determine pipeline trigger rules and deployment gates
  - skill: test-automation-expert
    reason: Automated test suites run as CI pipeline stages with matrix builds and caching
---

# GitHub Actions Pipeline Builder

Expert in building production-grade CI/CD pipelines with GitHub Actions that are fast, reliable, and secure.

## When to Use

✅ **Use for**:
- Automated testing on every commit
- Deployment to staging/production
- Docker image building and publishing
- Release automation with versioning
- Security scanning and dependency audits
- Code quality checks (linting, type checking)
- Multi-environment workflows

❌ **NOT for**:
- Non-GitHub repositories (use Jenkins, CircleCI, etc.)
- Complex pipelines better suited for dedicated CI/CD tools
- Self-hosted runners (covered in advanced patterns)

## Quick Decision Tree

```
Does your project need:
├── Testing on every PR? → GitHub Actions
├── Automated deployments? → GitHub Actions
├── Matrix builds (Node 16, 18, 20)? → GitHub Actions
├── Secrets management? → GitHub Actions secrets
├── Multi-cloud deployments? → GitHub Actions + OIDC
└── Sub-second builds? → Consider build caching
```

---

## Technology Selection

### GitHub Actions vs Alternatives

**Why GitHub Actions in 2024**:
- **Native integration**: No third-party setup
- **Free for public repos**: 2000 minutes/month for private
- **Matrix builds**: Test multiple versions in parallel
- **Marketplace**: 10,000+ pre-built actions
- **OIDC support**: Keyless cloud deployments

**Timeline**:
- 2019: GitHub Actions released
- 2020: Became standard for OSS projects
- 2022: OIDC support for secure cloud auth
- 2024: De facto CI/CD for GitHub repos

### When to Use Alternatives

| Scenario | Use | Why |
|----------|-----|-----|
| Self-hosted GitLab | GitLab CI | Native integration |
| Complex enterprise workflows | Jenkins | More flexible |
| Bitbucket repos | Bitbucket Pipelines | Native integration |
| Extremely large repos (&gt;10GB) | BuildKite | Better for monorepos |

---

## Common Anti-Patterns

### Anti-Pattern 1: No Dependency Caching

**Novice thinking**: "Install dependencies fresh every time for consistency"

**Problem**: Wastes 2-5 minutes per build installing unchanged dependencies.

**Wrong approach**:
```yaml
# ❌ Slow: Downloads all dependencies every run
- name: Install dependencies
  run: npm install
```

**Correct approach**:
```yaml
# ✅ Fast: Cache dependencies, only download changes
- name: Cache node_modules
  uses: actions/cache@v3
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-

- name: Install dependencies
  run: npm ci  # Faster than npm install
```

**Impact**: Reduces install time from 3 minutes → 30 seconds.

**Timeline**:
- Pre-2020: Most workflows had no caching
- 2020+: Caching became standard
- 2024: Setup actions include built-in caching

---

### Anti-Pattern 2: Duplicate YAML (No Matrix Builds)

**Problem**: Copy-paste workflows for different Node versions.

**Wrong approach**:
```yaml
# ❌ Duplicated workflows
jobs:
  test-node-16:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 16
      - run: npm test

  test-node-18:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm test

  test-node-20:
    # ... same steps again
```

**Correct approach**:
```yaml
# ✅ DRY: Matrix build
jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [16, 18, 20]
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      - run: npm ci
      - run: npm test
```

**Benefits**: 66% less YAML, tests run in parallel.

---

### Anti-Pattern 3: Secrets in Code

**Problem**: Hardcoded API keys, tokens visible in repo.

**Symptoms**: Security scanner alerts, leaked credentials.

**Correct approach**:
```yaml
# ✅ Use GitHub Secrets
- name: Deploy to production
  env:
    API_KEY: ${{ secrets.PRODUCTION_API_KEY }}
    AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY }}
  run: |
    ./deploy.sh
```

**Setting secrets**:
1. Repo Settings → Secrets and variables → Actions
2. New repository secret
3. Name: `PRODUCTION_API_KEY`, Value: `sk-...`

**Timeline**:
- Pre-2022: Some teams committed .env files
- 2022+: GitHub secret scanning blocks commits with keys
- 2024: OIDC eliminates need for long-lived credentials

---

### Anti-Pattern 4: No Failure Notifications

**Problem**: CI fails silently, team doesn't notice for hours.

**Correct approach**:
```yaml
# ✅ Slack notification on failure
- name: Notify on failure
  if: failure()
  uses: slackapi/slack-github-action@v1
  with:
    payload: |
      {
        "text": "❌ Build failed: ${{ github.event.head_commit.message }}",
        "blocks": [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "*Build Failed*\n<${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}|View logs>"
            }
          }
        ]
      }
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

---

### Anti-Pattern 5: Running All Tests on Every Commit

**Problem**: Slow feedback loop (10+ minute test suites).

**Symptom**: Developers avoid committing frequently.

**Correct approach**:
```yaml
# ✅ Fast feedback: Run subset on PR, full suite on merge
on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  quick-tests:
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    steps:
      - run: npm run test:unit  # Fast: 2 minutes

  full-tests:
    if: github.event_name == 'push'
    runs-on: ubuntu-latest
    steps:
      - run: npm run test  # Slow: 10 minutes (unit + integration + e2e)
```

**Alternative**: Use changed-files action to run only affected tests.

---

## Implementation Patterns

### Pattern 1: Basic CI Pipeline

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run type check
        run: npm run typecheck

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build
```

### Pattern 2: Multi-Environment Deployment

```yaml
name: Deploy

on:
  push:
    branches:
      - main        # → staging
      - production  # → production

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: ${{ github.ref_name }}  # staging or production

    steps:
      - uses: actions/checkout@v3

      - name: Deploy to ${{ github.ref_name }}
        run: |
          if [ "${{ github.ref_name }}" == "production" ]; then
            ./deploy.sh production
          else
            ./deploy.sh staging
          fi
        env:
          API_KEY: ${{ secrets.API_KEY }}
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

### Pattern 3: Release Automation

```yaml
name: Release

on:
  push:
    tags:
      - 'v*'  # Trigger on version tags (v1.0.0)

jobs:
  release:
    runs-on: ubuntu-latest
    permissions:
      contents: write  # Required for creating releases

    steps:
      - uses: actions/checkout@v3

      - name: Build artifacts
        run: npm run build

      - name: Create GitHub Release
        uses: softprops/action-gh-release@v1
        with:
          files: |
            dist/**
          body: |
            ## What's Changed
            See CHANGELOG.md for details.
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Publish to npm
        run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### Pattern 4: Docker Build & Push

```yaml
name: Docker

on:
  push:
    branches: [main]

jobs:
  build-and-push:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2

      - name: Login to DockerHub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}

      - name: Build and push
        uses: docker/build-push-action@v4
        with:
          context: .
          push: true
          tags: |
            myapp:latest
            myapp:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

---

## Production Checklist

```
□ Dependency caching configured
□ Matrix builds for multiple versions
□ Secrets stored in GitHub Secrets (not code)
□ Failure notifications (Slack, email, etc.)
□ Deploy previews for pull requests
□ Staging → Production promotion workflow
□ Release automation with versioning
□ Docker layer caching enabled
□ CODEOWNERS file for required reviews
□ Branch protection rules enabled
□ Status checks required before merge
□ Security scanning (Dependabot, CodeQL)
```

---

## When to Use vs Avoid

| Scenario | Use GitHub Actions? |
|----------|---------------------|
| GitHub-hosted repo | ✅ Yes |
| Need matrix builds | ✅ Yes |
| Deploying to AWS/GCP/Azure | ✅ Yes (with OIDC) |
| GitLab repo | ❌ No - use GitLab CI |
| Extremely large monorepo | ⚠️ Maybe - consider BuildKite |
| Need GUI pipeline builder | ❌ No - use Jenkins/Azure DevOps |

---

## References

- `/references/advanced-caching.md` - Cache strategies for faster builds
- `/references/oidc-deployments.md` - Keyless cloud authentication
- `/references/security-hardening.md` - Security best practices

## Scripts

- `scripts/workflow_validator.ts` - Validate YAML syntax locally
- `scripts/action_usage_analyzer.ts` - Find outdated actions

## Assets

- `assets/workflows/` - Ready-to-use workflow templates

---

**This skill guides**: CI/CD pipelines | GitHub Actions workflows | Matrix builds | Caching | Deployments | Release automation

---

---
name: performance-profiling
description: Application performance profiling and bottleneck identification — Node.js profiling, Chrome DevTools, flame graphs, memory leak detection, CPU profiling, React rendering performance. Activate
  on "profiling", "performance bottleneck", "flame graph", "memory leak", "slow app", "CPU profiling", "heap snapshot", "React re-renders", "EXPLAIN ANALYZE", "event loop lag", "clinic.js", "Core Web Vitals".
  NOT for infrastructure monitoring or observability (use logging-observability), load testing (use a load-testing skill), or database schema optimization.
allowed-tools: Read,Write,Edit,Bash,Grep,Glob
metadata:
  category: DevOps & Site Reliability
  tags:
  - performance
  - profiling
  - performance-bottleneck
  - flame-graph
  pairs-with:
  - skill: react-performance-optimizer
    reason: React DevTools profiling identifies component re-render bottlenecks for optimization
  - skill: caching-strategies
    reason: Profiling reveals cache miss patterns that inform caching architecture decisions
  - skill: postgresql-optimization
    reason: Database query profiling with EXPLAIN ANALYZE identifies slow query bottlenecks
  - skill: logging-observability
    reason: Performance metrics and traces collected by observability systems feed profiling analysis
---

# Performance Profiling

Find where your application actually spends time before touching a line of code. Covers the full stack: Node.js CPU and memory profiling, browser flame graphs, React render profiling, and database query analysis. The discipline here is profile first, optimize second — premature optimization is not a workflow, it is a guess.

## When to Use

**Use for**:
- Diagnosing slow Node.js applications (CPU-bound, I/O-bound, memory pressure)
- Generating and reading flame graphs to find hot code paths
- Detecting memory leaks via heap snapshots and growth trends
- Profiling React component render performance with React Profiler
- Measuring browser rendering performance (Core Web Vitals, layout thrashing, long tasks)
- Database query profiling with EXPLAIN ANALYZE
- Measuring event loop utilization and latency

**NOT for**:
- Infrastructure monitoring, distributed tracing, or log aggregation (use `logging-observability`)
- Load testing and capacity planning (a separate domain)
- Network latency analysis between services (use distributed tracing tools)
- Database schema design optimization (separate from query profiling)

---

## Core Decision: Where Is My App Slow?

```mermaid
flowchart TD
    Start[App is slow. Where?] --> Layer{Which layer?}
    Layer -->|Backend| Backend{What kind?}
    Layer -->|Frontend/browser| Browser{What symptom?}
    Layer -->|Unknown| Measure[Instrument first — add timing logs]

    Backend -->|CPU pegged, slow responses| CPU[CPU Profiling]
    Backend -->|Memory growing, crashes| Mem[Memory / Heap Profiling]
    Backend -->|Fast CPU, slow I/O| IO{I/O type?}
    IO -->|Database queries| DB[EXPLAIN ANALYZE + query profiler]
    IO -->|Network calls| Network[Trace external calls, add timeouts]
    IO -->|File system| FS[Check event loop utilization]

    Browser -->|Slow initial load| Lighthouse[Lighthouse + bundle analysis]
    Browser -->|Janky scrolling, animations| Rendering[Chrome Performance tab — layout thrashing]
    Browser -->|Slow after interaction| React{React app?}
    React -->|Yes| ReactProfiler[React Profiler + why-did-you-render]
    React -->|No| JS[Chrome Performance — long tasks, main thread blocking]

    CPU --> FlameGraph[Generate flame graph with 0x or clinic flame]
    Mem --> HeapSnap[Take heap snapshots before/after suspected leak]
    FS --> ELU[clinic bubbles — event loop utilization]
```

---

## Node.js: CPU Profiling

### V8 Inspector (Built-in)

```bash
# Attach inspector and capture a CPU profile
node --inspect src/index.js

# Or start paused and wait for DevTools
node --inspect-brk src/index.js
```

Then open `chrome://inspect` in Chrome, click the target, go to the **Profiler** tab, and record while sending load to the server.

### 0x: Flame Graphs from the Terminal

```bash
npm install -g 0x

# Profile a script (runs it, generates flame graph)
0x -- node src/index.js

# Profile with a load generator running simultaneously
0x -- node src/server.js &
npx autocannon -d 30 http://localhost:3000/api/heavy
```

0x generates an interactive HTML flame graph. The **widest stacks** are where time is spent. Look for:
- Functions that appear wide near the bottom (called frequently by everything)
- Unexpected width in library code (serialization, template engines, parsers)
- Idle / `[idle]` blocks — I/O wait, not CPU (look elsewhere for those)

### Clinic.js Suite

```bash
npm install -g clinic

# Doctor: overview of what is wrong
clinic doctor -- node src/server.js

# Flame: CPU flame graph (wraps 0x)
clinic flame -- node src/server.js

# Bubbles: event loop utilization
clinic bubbles -- node src/server.js
```

Clinic Doctor gives you a triage view: CPU, memory, event loop, and handles. Start here when you do not know what kind of bottleneck you have.

### Event Loop Utilization (ELU)

```js
const { performance } = require('perf_hooks');

// Sample ELU every 5 seconds
let last = performance.eventLoopUtilization();
setInterval(() => {
  const current = performance.eventLoopUtilization();
  const diff = performance.eventLoopUtilization(current, last);
  console.log(`ELU: ${(diff.utilization * 100).toFixed(1)}%`);
  last = current;
}, 5000);
```

ELU above 80% means the event loop is saturated — CPU-bound work or sync blocking. ELU near 0% with slow responses means I/O wait (network, disk, database).

---

## Node.js: Memory Profiling

### Heap Snapshots

```bash
# Take heap snapshot via CLI
node --inspect src/index.js
# In chrome://inspect → Memory tab → Take Heap Snapshot
```

**Three-snapshot technique for leak detection**:
1. Snapshot after startup (baseline)
2. Snapshot after N requests (warm)
3. Snapshot after 2N requests (growth)

Compare Snapshot 3 to Snapshot 2 — objects that grew proportionally to request count are leaking.

### Common Leak Patterns

**Closure captures** — Variables captured in long-lived closures that should have been released:

```js
// LEAK: handler is registered but never removed
emitter.on('data', (chunk) => {
  processedData.push(chunk);  // processedData grows unbounded
});

// FIX: remove listener when done, or use once()
emitter.once('data', handler);
// or
const handler = (chunk) => { ... };
emitter.on('data', handler);
// later:
emitter.off('data', handler);
```

**Growing caches without eviction**:

```js
// LEAK: cache grows forever
const cache = new Map();
app.get('/user/:id', async (req, res) => {
  if (!cache.has(req.params.id)) {
    cache.set(req.params.id, await db.getUser(req.params.id));
  }
  res.json(cache.get(req.params.id));
});

// FIX: use LRU cache with max size
const LRU = require('lru-cache');
const cache = new LRU({ max: 1000, ttl: 1000 * 60 * 5 });
```

**WeakRef and FinalizationRegistry** (for intentional weak references):

```js
const cache = new Map();

function cacheValue(key, obj) {
  const ref = new WeakRef(obj);
  const registry = new FinalizationRegistry((k) => cache.delete(k));
  registry.register(obj, key);
  cache.set(key, ref);
}
```

---

## Anti-Pattern: Optimizing Without Profiling

**Novice**: "This function looks expensive, I'll rewrite it in a more efficient algorithm."

**Expert**: Rewrote the wrong function. Profiling would have shown that this function is called once per startup and contributes 0.1% of runtime. The actual bottleneck was JSON serialization in the response handler, called 10,000 times per second. Optimization effort must follow measurement, never intuition.

**Detection**: The "optimized" code is measurably faster in microbenchmark isolation but production p99 latency is unchanged.

---

## Anti-Pattern: Micro-Benchmarking in Isolation

**Novice**: Writes a benchmark comparing two sorting algorithms on an array of 1000 items, concludes Algorithm B is 2x faster, rewrites production code.

**Expert**: Micro-benchmarks measure JIT-compiled hot paths under artificial conditions. Real workloads have different data shapes, mixed call patterns, GC pressure, and I/O interspersed. The JIT may optimize the benchmark differently than the real call site. Profile the actual application under real load — or at minimum, profile with realistic data shapes and call patterns embedded in the actual application code path.

**The test**: Does your benchmark run in a tight loop 10,000 times before measuring? If yes, V8 has JIT-compiled it differently than it will compile the real code, which runs cold at startup and is called with varied inputs.

---

## React Rendering Performance

### React Profiler (DevTools)

1. Open React DevTools → Profiler tab
2. Click "Record"
3. Perform the slow interaction
4. Stop recording
5. Examine the flame chart — bars represent components, width represents render time

Key columns: **"Why did this render?"** shows which prop or state change triggered each render.

### why-did-you-render

```bash
npm install @welldone-software/why-did-you-render
```

```js
// src/wdyr.js (import before React)
import React from 'react';
if (process.env.NODE_ENV === 'development') {
  const whyDidYouRender = require('@welldone-software/why-did-you-render');
  whyDidYouRender(React, { trackAllPureComponents: true });
}
```

```js
// Mark a specific component for tracking
MyExpensiveComponent.whyDidYouRender = true;
```

This logs to the console every time a component re-renders with the same props — exposing unnecessary renders caused by reference equality failures.

### Common React Performance Patterns

```js
// Memoize expensive components
const ExpensiveList = React.memo(({ items, onSelect }) => {
  return items.map(item => <Item key={item.id} item={item} onSelect={onSelect} />);
});

// Stable callback references — prevent re-renders downstream
const handleSelect = useCallback((id) => {
  setSelected(id);
}, []); // no deps: stable forever

// Memoize expensive computations
const sortedItems = useMemo(() => {
  return [...items].sort((a, b) => a.name.localeCompare(b.name));
}, [items]);

// Virtualize long lists
import { FixedSizeList } from 'react-window';
<FixedSizeList height={600} itemCount={items.length} itemSize={50} width="100%">
  {({ index, style }) => <Row item={items[index]} style={style} />}
</FixedSizeList>
```

---

## Database Query Profiling

### PostgreSQL EXPLAIN ANALYZE

```sql
-- Wrap any query in EXPLAIN (ANALYZE, BUFFERS) to see execution plan
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT u.*, COUNT(o.id) as order_count
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
WHERE u.created_at > NOW() - INTERVAL '30 days'
GROUP BY u.id;
```

Read the output bottom-up. Each node shows:
- `actual time=X..Y` — startup time to first row, total time for all rows
- `rows=N` — actual rows returned
- `loops=N` — how many times this node executed

**Red flags**:
- `Seq Scan` on large tables — missing index
- `rows=1000` estimated vs `rows=1` actual — stale statistics, run `ANALYZE`
- `Hash Join` with large hash batches — memory pressure, tune `work_mem`
- `Nested Loop` on large outer result — cartesian product risk

### Finding Slow Queries in Production

```sql
-- Enable pg_stat_statements extension
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Top 10 slowest queries by total time
SELECT
  query,
  calls,
  total_exec_time / 1000 AS total_seconds,
  mean_exec_time AS mean_ms,
  rows
FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 10;
```

---

## Browser Profiling

See `references/browser-profiling.md` for the full Chrome Performance tab workflow, Core Web Vitals measurement, and layout thrashing diagnosis.

---

## Bottleneck Classification Rules

When the user provides profiling data, classify and rank bottlenecks using these rules. Process signals in priority order — higher-priority signals override lower ones.

### Priority 1: Database (check first — it's the bottleneck 70% of the time)

| Signal | Classification |
|--------|---------------|
| Any query >500ms | **Critical** — `type: database`. Next step: Run `EXPLAIN ANALYZE` on the query. Look for sequential scans on large tables (missing index) and N+1 patterns (same query repeated with different IDs). |
| Multiple queries >100ms per request | **High** — `type: database`. Next step: Aggregate query count per endpoint. If >5 queries per request, look for N+1 or missing JOINs. Consider a query count budget per endpoint. |
| Query count >20 per page load | **High** — `type: database`. Even if individual queries are fast, connection overhead and round-trip latency compound. Next step: Batch with `WHERE id IN (...)` or use a DataLoader pattern. |

### Priority 2: Event Loop (Node.js-specific — the most underdiagnosed bottleneck)

| Signal | Classification |
|--------|---------------|
| ELU >0.8 | **Critical** — `type: cpu`. The event loop is saturated. Next step: Run `clinic flame` or `--prof` to find synchronous hot paths. Common culprits: JSON.parse on large payloads, synchronous crypto, regex backtracking. |
| ELU >0.5 with slow p99 latency | **High** — `type: cpu`. Event loop contention is causing tail latency. Next step: Look for blocking operations that run infrequently but hold the loop when they do (large sorts, template rendering, PDF generation). |
| ELU <0.2 with slow responses | **This is NOT a CPU problem.** `type: io`. Next step: The app is waiting on something external (DB, API calls, file system). Trace outbound requests with `clinic bubbleprof` or add timing logs to external calls. |

### Priority 3: Memory

| Signal | Classification |
|--------|---------------|
| Heap growth rate >10MB/min sustained | **Critical** — `type: memory`. Memory leak will OOM the process. Next step: Take two heap snapshots 5 minutes apart, compare in Chrome DevTools, look for growing object counts (retained size). Common suspects: event listener accumulation, closures capturing request objects, unbounded caches. |
| Heap growth proportional to request rate (resets on GC) | **Medium** — `type: memory`. Not a leak, just high allocation pressure. Next step: Check for unnecessary object creation in hot paths (cloning large objects, building strings with concatenation). Reduce allocation, don't chase GC. |
| `suspects` array from heap analysis | List each suspect with its retained size. **High** if any single object retains >50MB. Next step: Trace the retainer tree to find why it's not being collected. |

### Priority 4: React Rendering (frontend)

| Signal | Classification |
|--------|---------------|
| Component render time >16ms | **High** — `type: rendering`. Dropping frames. Next step: Check if the component re-renders on every parent render (missing `React.memo` or unstable props). Profile with React DevTools "Why did this render?" |
| >5 re-renders per user interaction | **Medium** — `type: rendering`. Next step: Check for state updates that trigger cascading re-renders. Move state closer to where it's used, or split context providers. |
| Large component tree (>500 components mounted) | **Medium** — `type: rendering`. Next step: Virtualize lists (`react-window`), lazy-load off-screen components, check for unnecessary mount/unmount cycles. |

### Priority 5: CPU (non-event-loop)

| Signal | Classification |
|--------|---------------|
| Single function >30% of `selfTime` in CPU profile | **High** — `type: cpu`. Hot function dominates. Next step: Read the function. If it's in your code, optimize it. If it's in a library, check if you're calling it unnecessarily or with pathologically large input. |
| Flame graph shows wide, flat profile (no single hot function) | **Medium** — `type: cpu`. Death by a thousand cuts. Next step: Look for patterns — are many functions doing similar work? This often means redundant computation (computing the same derived value multiple times per request). |

### Output Ranking

After classifying all signals, rank the bottleneck list by:
1. **Severity** (critical first)
2. **Actionability** (clear next step ranks higher than vague "investigate further")
3. **Estimated impact** — "Adding an index will reduce this query from 800ms to 5ms" is more useful than "This might help"

Always include `estimatedImpact` as a concrete prediction: "Adding an index will reduce this query from 800ms to 5ms" is more useful than "This might help"

---

## References

- `references/node-profiling.md` — Consult for detailed Node.js profiling: --inspect flags, clinic.js commands, heap snapshot analysis, event loop monitoring, stream backpressure diagnosis
- `references/browser-profiling.md` — Consult for browser performance: Chrome Performance tab workflow, Lighthouse CI integration, React Profiler deep-dive, Core Web Vitals measurement, layout thrashing patterns

---

---
name: product-appeal-analyzer
description: Evaluate product desirability, market positioning, and emotional resonance—the complement to friction analysis. Assess whether users will WANT a product (not just use it), identity fit, trust
  signals, and value proposition clarity. Activate on "will they like it", "market positioning", "appeal analysis", "product desirability", "value proposition", "why would someone choose this", "landing
  page review", "conversion optimization", "messaging strategy". NOT for UX friction analysis (use ux-friction-analyzer), visual design implementation (use web-design-expert), or A/B test setup (use frontend-developer).
allowed-tools: Read,Write,Edit,WebFetch
metadata:
  category: Research & Analysis
  pairs-with:
  - skill: ux-friction-analyzer
    reason: Appeal asks "do they want it?" Friction asks "can they use it?" Use both.
  - skill: competitive-cartographer
    reason: Position against alternatives with strategic mapping
  - skill: web-design-expert
    reason: Implement visual identity recommendations
  tags:
  - product-strategy
  - marketing
  - positioning
  - value-proposition
  - conversion
  - user-research
---

# Product Appeal Analyzer

Evaluate whether users will *want* a product—not just use it. The complement to friction analysis.

**Core insight**: Users don't choose the best product—they choose the product that feels most like it was made for them.

## When to Use

✅ **Use for:**
- Evaluating landing pages, product pages, app store listings
- Positioning a product against alternatives
- Crafting messaging, tone, visual identity direction
- Assessing emotional resonance with target personas
- Pre-launch "will this convert?" analysis

❌ **NOT for:**
- UX friction audits (→ use ux-friction-analyzer)
- Visual design execution (→ use web-design-expert)
- A/B test implementation (→ use frontend-developer)
- Market size estimation or financial forecasting
- Feature comparison matrices

---

## The Desirability Triangle

**All three must be present.** Missing any one kills conversion:

```
                    IDENTITY FIT
                    "This is for people like me"
                         /\
                        /  \
                       /    \
                      /  ★   \
                     / DESIRE \
                    /          \
                   /______________\
        PROBLEM               TRUST
        URGENCY               SIGNALS
   "I need this now"     "This will actually work"
```

| Missing Element | User Reaction |
|-----------------|---------------|
| Identity Fit | "Seems useful, but not for me" |
| Problem Urgency | "Cool, maybe someday" |
| Trust Signals | "Looks sketchy / too good to be true" |

**Decision tree**: When analyzing, score each vertex 1-10. If any is &lt;5, that's your priority fix.

---

## Quick Analysis: The 5-Second Test

Within 5 seconds of landing, a visitor should know:

1. **What is this?** (Category recognition)
2. **Who is it for?** (Identity signal)
3. **What's the core promise?** (Value proposition)
4. **What do I do next?** (Clear CTA)

**How to run it:**
- Show landing page to someone unfamiliar for exactly 5 seconds
- Hide it, then ask: "What was that? Who's it for? What would you do there?"
- Record verbatim—don't coach or clarify

**Scoring:**

| Result | Score | Action |
|--------|-------|--------|
| All 4 clear in &lt;3 sec | 9-10 | Ship it |
| All 4 clear in 3-5 sec | 7-8 | Minor polish |
| 3 of 4 clear | 5-6 | Fix the gap |
| 2 or fewer clear | 2-4 | Significant rework |
| Confusing/unclear | 0-1 | Start over |

---

## Analysis Process

### Step 1: Identify Target Personas

For each persona, document:
- **Who**: One-sentence description
- **Problem**: What's broken + how it feels
- **Current workaround**: What they do today (and why it sucks)
- **Identity**: How they see themselves, who they want to become

### Step 2: Score the Desirability Triangle

For each persona:

```
PERSONA: [Name]

IDENTITY FIT                    [/10]
  Visual identity match         [/10]  "Does this look like my kind of tool?"
  Language resonance            [/10]  "Do they speak my language?"
  Implied user match            [/10]  "Are people like me shown?"

PROBLEM URGENCY                 [/10]
  Pain point acknowledged       [/10]  "They understand my problem"
  Emotional resonance           [/10]  "They get how frustrating it is"
  Solution clarity              [/10]  "I see how this fixes it"

TRUST SIGNALS                   [/10]
  Professional execution        [/10]  "This looks legitimate"
  Social proof                  [/10]  "Others like me use it"
  Risk reduction                [/10]  "What if it doesn't work?"

OVERALL APPEAL SCORE:           [/90]
```

### Step 3: Map Objections

| Objection | Type | How Addressed? |
|-----------|------|----------------|
| "Is this legit?" | Trust | [Answer] |
| "I've tried things before" | Skepticism | [Answer] |
| "Too expensive" | Value | [Answer] |
| "Too complicated" | Effort | [Answer] |
| "Not for people like me" | Identity | [Answer] |
| "What if it doesn't work?" | Risk | [Answer] |
| "I'll do it later" | Urgency | [Answer] |

### Step 4: Generate Recommendations

Use priority formula: `Impact = (Users Affected × Severity) / Fix Difficulty`

Categorize into:
- **Immediate** (ship this week)
- **Medium-term** (this sprint)
- **Long-term** (roadmap)

---

## Common Anti-Patterns

### Feature Soup Headline

**Novice thinking**: "List all capabilities to show value"

**Reality**: Visitors scan for 2-3 seconds. Feature lists feel generic.

**What to use instead**:
| Bad | Good |
|-----|------|
| "AI-Powered Recovery Planning Tool with Analytics" | "Know exactly what to do next in your recovery" |
| "Comprehensive Legal Document Platform" | "Find out in 2 minutes if your record can be expunged" |

**Detection**: Headline contains 3+ nouns or buzzwords like "AI-powered", "comprehensive", "platform"

### Screenshot Hero

**Novice thinking**: "Show the product interface so people know what they're getting"

**Reality**: Strangers don't understand your UI. They care about outcomes.

**What to use instead**:
- Person experiencing the benefit
- The outcome/result they'll get
- Abstract visualization of the transformation

**Detection**: Hero image is a product screenshot with no context

### Trust Ladder Violation

**Novice thinking**: "Get their email immediately, then convert them"

**Reality**: Trust builds in stages. Asking for too much too early kills conversion.

**The Trust Ladder** (each rung requires more trust):
1. Land on page → Professional design, no broken elements
2. Click/explore → Clear navigation, fast load
3. Spend &gt;2 min → Demonstrated value, clear progress
4. Enter info → Why you need it explained, no dark patterns
5. Create account → Privacy visible, minimal fields, clear benefit
6. Pay money → Guarantee, testimonials, recognizable processor

**Detection**: Asking for account creation before demonstrating value

### Identity Mismatch

**Novice thinking**: "Broad appeal = more users"

**Reality**: When everyone is the target, no one feels targeted.

**What to use instead**:
| Signal Type | How It Works |
|-------------|--------------|
| Visual identity | Dark mode = "power user"; Soft pastels = "wellness" |
| Language/tone | "Crush your goals" vs "Find your balance" |
| Social proof | Company logos vs individual testimonials |
| Complexity | Minimal = simplicity-seeker; Feature-rich = power user |

**Detection**: Homepage tries to appeal to 3+ different personas

---

## Self-Contained Tools

### Analysis Workflow

1. **Read** the landing page content and structure
2. **WebFetch** the target URL to analyze live content
3. **Write** analysis results to a markdown file
4. **Edit** recommendations into actionable copy changes

### Appeal Scorer Script

Run: `python scripts/appeal_scorer.py <url>`

Produces structured JSON output with scores and recommendations.

### Reference Files (See for deep dives)

| File | When to Use |
|------|-------------|
| `references/scoring-templates.md` | Full scoring matrices and templates |
| `references/trust-ladder.md` | Deep dive on trust building stages |
| `references/identity-signals.md` | Visual/verbal identity signal catalog |
| `references/objection-catalog.md` | Common objections by product type |

---

## Output Format

When running this skill, produce:

1. **Executive Summary** - 3 bullet key findings
2. **Desirability Triangle Scores** - Per persona
3. **5-Second Test Assessment** - What's clear, what's not
4. **Top 3 Objections** - And how to address them
5. **Priority Recommendations** - Immediate / Medium / Long-term

---

## Integration with ux-friction-analyzer

**Appeal + Friction = Complete picture**

| This Skill Answers | ux-friction-analyzer Answers |
|--------------------|------------------------------|
| "Do they want it?" | "Can they use it?" |
| Will they choose this over alternatives? | Can they complete the task? |
| Does it feel made for them? | Does the flow make sense? |
| Is the promise compelling? | Is the experience smooth? |

**Run both**: High appeal + high friction = frustrated users. Low friction + low appeal = abandoned product.

---

**Philosophy**: A product with low friction but low appeal gets abandoned. A product with high appeal but high friction gets frustrated users. You need both.

---

---
name: reactive-dashboard-performance
description: Expert in building blazing-fast reactive dashboards with comprehensive testing. Masters React performance patterns, testing strategies for async components, and real-world patterns from Linear,
  Vercel, Notion.
allowed-tools: Read,Write,Edit,Bash,Grep,Glob
version: 1.0.0
metadata:
  category: Frontend Development
  tags:
  - react
  - performance
  - testing
  - dashboard
  - optimization
  pairs-with:
  - skill: react-performance-optimizer
    reason: Dashboard performance depends on React memoization, virtualization, and state management
  - skill: admin-dashboard
    reason: Admin dashboards are the primary consumer of reactive dashboard performance patterns
  - skill: data-viz-2025
    reason: Dashboard charts and graphs require performant data visualization rendering
---

# Reactive Dashboard Performance

Expert in building production-grade reactive dashboards that load in &lt;100ms and have comprehensive test coverage.

## Core Expertise

### Performance Patterns (Linear, Vercel, Notion-grade)

1. **Skeleton-First Loading**
   - Render skeleton immediately (0ms perceived load)
   - Stream in data progressively
   - Never show spinners for &lt;200ms loads

2. **Aggressive Caching**
   - React Query with staleTime: 5min, cacheTime: 30min
   - Optimistic updates for mutations
   - Prefetch on hover/mount

3. **Code Splitting**
   - Route-based splitting (Next.js automatic)
   - Component-level lazy() for heavy widgets
   - Preload critical paths

4. **Memoization Strategy**
   - useMemo for expensive computations
   - React.memo for pure components
   - useCallback for stable references

### Testing Reactive Dashboards

1. **Mock Strategy**
   - Mock at service boundary (React Query, analytics)
   - Never mock UI components (test real DOM)
   - Use MSW for API mocking when possible

2. **Async Handling**
   ```typescript
   // WRONG - races with React
   render(<Dashboard />);
   const element = screen.getByText('Welcome');

   // RIGHT - waits for async resolution
   render(<Dashboard />);
   const element = await screen.findByText('Welcome');
   ```

3. **Timeout Debugging**
   - Timeouts mean: missing mock, wrong query, or component not rendering
   - Use screen.debug() to see actual DOM
   - Check console for unmocked errors

4. **Test Wrapper Pattern**
   ```typescript
   const TestProviders = ({ children }) => (
     <QueryClientProvider client={testQueryClient}>
       <AuthProvider>
         {children}
       </AuthProvider>
     </QueryClientProvider>
   );
   ```

### Real-World Examples

- **Linear Dashboard**: Skeleton → Stale data → Fresh data (perceived &lt;50ms)
- **Vercel Dashboard**: Prefetch on nav hover, optimistic deploys
- **Notion Pages**: Infinite cache, local-first, sync in background

## Diagnostic Protocol

### Integration Test Timeouts

1. **Check what's actually rendering**
   ```typescript
   render(<Component />);
   screen.debug(); // See actual DOM
   ```

2. **Find unmocked dependencies**
   - Check console for "not a function" errors
   - Look for network requests in test output
   - Verify all contexts are provided

3. **Fix async queries**
   - Use findBy* instead of getBy*
   - Increase timeout if needed: `waitFor(() => {...}, { timeout: 3000 })`
   - Mock React Query properly

4. **Simplify component tree**
   - Test widgets individually first
   - Add full integration tests last
   - Use data-testid for complex queries

## Performance Optimization

### Dashboard Load Budget

| Phase | Target |
|-------|--------|
| Skeleton render | 0-16ms (1 frame) |
| First data paint | &lt;100ms |
| Full interactive | &lt;200ms |
| Lazy widgets | &lt;500ms |

### React Query Config

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5min
      cacheTime: 30 * 60 * 1000, // 30min
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      retry: 1,
    },
  },
});
```

### Skeleton Pattern

```typescript
function Dashboard() {
  const { data, isLoading } = useQuery('dashboard', fetchDashboard);

  // Show skeleton immediately, no loading check
  return (
    <div>
      {data ? <RealWidget data={data} /> : <SkeletonWidget />}
    </div>
  );
}
```

## Common Pitfalls

1. **Spinners for fast loads** - Use skeletons instead
2. **Unmemoized expensive computations** - Wrap in useMemo
3. **Testing implementation details** - Test user behavior
4. **Mocking too much** - Mock at boundaries only
5. **Synchronous test expectations** - Everything is async

When debugging test timeouts, ALWAYS start with `screen.debug()` to see what actually rendered.

---

