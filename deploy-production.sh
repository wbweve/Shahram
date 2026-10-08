#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# deploy-production.sh — Leadership OS Production Deployment
#
# Usage:
#   ./deploy-production.sh              # Full deployment
#   ./deploy-production.sh --test       # Run tests only
#   ./deploy-production.sh --build      # Build Docker image only
#   ./deploy-production.sh --health     # Check health only
# ═══════════════════════════════════════════════════════════════════════════════

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() { echo -e "${BLUE}[$(date '+%H:%M:%S')]${NC} $1"; }
success() { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[⚠]${NC} $1"; }
error() { echo -e "${RED}[✗]${NC} $1"; }

# ─── Pre-flight checks ──────────────────────────────────────────────────────

preflight() {
  log "Running pre-flight checks..."

  # Check Node.js
  if ! command -v node &>/dev/null; then
    error "Node.js not found. Please install Node.js 18+."
    exit 1
  fi
  NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
  if [ "$NODE_VERSION" -lt 18 ]; then
    error "Node.js 18+ required. Found: $(node -v)"
    exit 1
  fi
  success "Node.js $(node -v)"

  # Check npm
  if ! command -v npm &>/dev/null; then
    error "npm not found."
    exit 1
  fi
  success "npm $(npm -v)"

  # Check Docker (optional)
  if command -v docker &>/dev/null; then
    success "Docker $(docker --version | cut -d' ' -f3 | tr -d ',')"
  else
    warn "Docker not found — will run natively"
  fi

  # Check env file
  if [ ! -f ".env.production" ]; then
    warn ".env.production not found — using defaults"
    if [ -f ".env.production.example" ]; then
      warn "Copy .env.production.example to .env.production and configure"
    fi
  else
    success ".env.production found"
  fi
}

# ─── Install dependencies ────────────────────────────────────────────────────

install_deps() {
  log "Installing dependencies..."
  npm ci --omit=dev 2>/dev/null || npm install --omit=dev
  success "Dependencies installed"
}

# ─── Verify modules ──────────────────────────────────────────────────────────

verify_modules() {
  log "Verifying all 31 production modules..."
  node verify-modules.js 2>/dev/null || node -e "
    var mods = [
      'ai-leadership-autopilot','calendar-intelligence','proactive-email-digest',
      'smart-delegation-recommender','nlu-register-parser','webhook-engine',
      'calendar-sync','proactive-background-monitor','meeting-followup-engine',
      'smart-nudge-engine','leadership-style-coach','predictive-risk-radar',
      'oauth2-calendar','relationship-graph','energy-time-optimizer',
      'realtime-push','leadership-dev-loop','conversation-intelligence',
      'mobile-push-firebase','workflow-orchestrator','meeting-scheduler',
      'turnover-predictor','context-briefing','portfolio-intelligence',
      'stakeholder-comms','emotional-intelligence-radar','nl-command-interface',
      'stakeholder-intelligence','ai-coaching-engine','auto-reporting-engine',
      'team-analytics'
    ];
    var ok=0, fail=0;
    mods.forEach(function(m){try{require('./js/'+m+'.js');ok++;}catch(e){fail++;console.error('FAIL: '+m);}});
    console.log(ok+' modules OK, '+fail+' failed');
    if(fail>0) process.exit(1);
  "
  success "All modules verified"
}

# ─── Run tests ───────────────────────────────────────────────────────────────

run_tests() {
  log "Running full test suite (546 tests across 11 suites)..."
  local PASS=0
  local FAIL=0

  for f in test/tier*.test.js test/enhanced-ai-modules.test.js test/webhook-calendar-sync.test.js test/dev-loop-convo-mobile.test.js test/e2e-autopilot-pipeline.test.js; do
    if [ -f "$f" ]; then
      RESULT=$(node "$f" 2>&1 | grep "Results:")
      if echo "$RESULT" | grep -q "0 failed"; then
        PASS=$((PASS + 1))
      else
        FAIL=$((FAIL + 1))
        error "FAIL: $f — $RESULT"
      fi
    fi
  done

  success "$PASS suites passed, $FAIL failed"
  if [ "$FAIL" -gt 0 ]; then
    error "Some tests failed — fix before deploying"
    exit 1
  fi
}

# ─── Build Docker image ─────────────────────────────────────────────────────

build_docker() {
  if ! command -v docker &>/dev/null; then
    warn "Docker not available — skipping image build"
    return
  fi

  log "Building Docker image..."
  docker build -t leadership-os:latest -t leadership-os:$(date +%Y%m%d) .
  success "Docker image built: leadership-os:latest"
}

# ─── Health check ────────────────────────────────────────────────────────────

health_check() {
  local PORT=${PORT:-8001}
  local URL="http://127.0.0.1:${PORT}/api/health"

  log "Checking health at $URL..."
  if curl -sf "$URL" >/dev/null 2>&1; then
    success "Health check passed"
    return 0
  else
    warn "Server not responding at $URL"
    return 1
  fi
}

# ─── Print summary ───────────────────────────────────────────────────────────

print_summary() {
  echo ""
  echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
  echo -e "${GREEN}  Leadership OS — Deployment Summary${NC}"
  echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
  echo ""
  echo -e "  Modules:     ${BLUE}31${NC} production modules"
  echo -e "  Tests:       ${BLUE}546${NC} tests across 11 suites"
  echo -e "  API Routes:  ${BLUE}65+${NC} endpoints"
  echo -e "  Tiers:       ${BLUE}7${NC} enhancement tiers complete"
  echo ""
  echo -e "  Start server:  ${YELLOW}node server.js${NC}"
  echo -e "  Docker:        ${YELLOW}docker-compose -f docker-compose.production.yml up${NC}"
  echo -e "  Health:        ${YELLOW}curl http://localhost:8001/api/health${NC}"
  echo -e "  API Docs:      ${YELLOW}http://localhost:8001/api-docs.html${NC}"
  echo -e "  Dashboard:     ${YELLOW}http://localhost:8001/dashboard.html${NC}"
  echo ""
  echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
}

# ─── Main ────────────────────────────────────────────────────────────────────

case "${1:-}" in
  --test)
    preflight
    install_deps
    run_tests
    ;;
  --build)
    preflight
    build_docker
    ;;
  --health)
    health_check
    ;;
  *)
    preflight
    install_deps
    verify_modules
    run_tests
    build_docker
    print_summary
    ;;
esac
