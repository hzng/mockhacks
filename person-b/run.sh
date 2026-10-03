#!/usr/bin/env bash
# Starts Person B's bounty API (port 8001) and the team's Next.js app (port 3000)
# in one terminal. Ctrl+C stops both. Open http://localhost:3000/feature-2
set -euo pipefail

ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND="$ROOT/person-b/backend"

for port in 8001 3000; do
  if lsof -nP -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1; then
    echo "Port $port is already in use. Stop whatever is running there (Ctrl+C in its terminal) and try again." >&2
    exit 1
  fi
done

if [[ ! -x "$BACKEND/.venv/bin/uvicorn" ]]; then
  echo "Setting up the bounty API environment..."
  python3 -m venv "$BACKEND/.venv"
  "$BACKEND/.venv/bin/pip" install -q -r "$BACKEND/requirements.txt"
fi

(cd "$BACKEND" && exec .venv/bin/uvicorn app:app --port 8001 --reload) &
API_PID=$!
trap 'kill "$API_PID" 2>/dev/null || true' EXIT

echo "Bounty API: http://localhost:8001/docs"
echo "App:        http://localhost:3000/feature-2"
cd "$ROOT" && npm run dev
