#!/bin/bash
set -euo pipefail

# niteshift-setup.sh - Setup script for niteshiftdev/umami
# This script sets up the Umami analytics application with all required dependencies

# Logging setup
LOG_FILE="${NITESHIFT_LOG_FILE:-/dev/stdout}"

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE" >/dev/null
  echo "$*"
}

log_error() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $*" | tee -a "$LOG_FILE" >&2
  echo "ERROR: $*" >&2
}

# Pre-flight checks
log "Starting niteshift setup for umami..."

# 1. Check DATABASE_URL is set
if [ -z "${DATABASE_URL:-}" ]; then
  log_error "DATABASE_URL environment variable is not set"
  log_error "This script assumes DATABASE_URL is already configured"
  exit 1
fi
log "✓ DATABASE_URL is set"

# 2. Check Node.js version
if ! command -v node &> /dev/null; then
  log_error "Node.js is not installed"
  exit 1
fi

NODE_VERSION=$(node -v | sed 's/v//')
NODE_MAJOR=$(echo "$NODE_VERSION" | cut -d. -f1)
if [ "$NODE_MAJOR" -lt 18 ]; then
  log_error "Node.js 18.18+ is required, found version $NODE_VERSION"
  exit 1
fi
log "✓ Node.js $NODE_VERSION is installed"

# 3. Enable corepack for pnpm
if ! command -v pnpm &> /dev/null; then
  log "Enabling corepack for pnpm..."
  corepack enable
  if ! command -v pnpm &> /dev/null; then
    log_error "Failed to enable pnpm via corepack"
    exit 1
  fi
fi
log "✓ pnpm is available"

# 4. Install dependencies
log "Installing dependencies with pnpm..."
if ! pnpm install --frozen-lockfile; then
  log_error "Failed to install dependencies"
  exit 1
fi
log "✓ Dependencies installed"

# 5. Build only what's needed for dev (skip production Next.js build)
# For dev mode we need:
# - check-env: validates environment variables
# - build-db: generates Prisma client and builds database
# - check-db: verifies database connection and applies migrations
# - build-tracker: bundles tracker script (needed for tracking functionality)
# - build-geo: processes geographic data (needed for geo features)
# We skip build-app (production Next.js build) since dev mode compiles on-the-fly
log "Validating environment..."
if ! pnpm run check-env; then
  log_error "Environment validation failed"
  exit 1
fi
log "✓ Environment validated"

log "Building database client..."
if ! pnpm run build-db; then
  log_error "Database client build failed"
  exit 1
fi
log "✓ Database client built"

log "Checking database and applying migrations..."
if ! pnpm run check-db; then
  log_error "Database check failed"
  exit 1
fi
log "✓ Database migrations applied"

log "Building tracker script..."
if ! pnpm run build-tracker; then
  log_error "Tracker build failed"
  exit 1
fi
log "✓ Tracker script built"

log "Building geo database..."
if ! pnpm run build-geo; then
  log_error "Geo build failed"
  exit 1
fi
log "✓ Geo database built"

# 6. Start the dev server in the background
log "Starting development server on port 3001 (with hot reload)..."
# Log dev server output to NITESHIFT_LOG_FILE (or stdout if not set)
pnpm run dev >> "$LOG_FILE" 2>&1 &
SERVER_PID=$!
log "✓ Dev server started with PID $SERVER_PID"

# 7. Wait for dev server to be ready
log "Waiting for dev server to be ready (this may take 30-60 seconds on first run)..."
MAX_ATTEMPTS=60
ATTEMPT=0
while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
  if curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/heartbeat 2>/dev/null | grep -q "200"; then
    log "✓ Dev server is ready and responding"
    break
  fi
  ATTEMPT=$((ATTEMPT + 1))
  if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
    log_error "Dev server failed to start within 60 seconds"
    log_error "Check the log file for details: $LOG_FILE"
    kill $SERVER_PID 2>/dev/null || true
    exit 1
  fi
  sleep 1
done

log ""
log "================================================================"
log "Setup complete! Umami dev server is running on http://localhost:3001"
log "================================================================"
log ""
log "Default credentials:"
log "  Username: admin"
log "  Password: umami"
log ""
log "Server PID: $SERVER_PID"
if [ "$LOG_FILE" != "/dev/stdout" ]; then
  log "Server logs: $LOG_FILE"
fi
log ""
log "Hot reload is enabled - changes will be reflected automatically"
log ""
log "To stop the server: kill $SERVER_PID"
log ""
