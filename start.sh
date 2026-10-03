#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"

for command_name in node npm uv; do
  if ! command -v "$command_name" >/dev/null 2>&1; then
    echo "Missing required command: $command_name" >&2
    exit 1
  fi
done

if [[ ! -f "$PROJECT_ROOT/node_modules/next/dist/bin/next" ]]; then
  echo "Installing the web app dependencies..."
  (cd "$PROJECT_ROOT" && npm install)
fi

echo "Preparing the local API environment..."
(cd "$PROJECT_ROOT/backend" && uv sync --no-dev --locked)

(cd "$PROJECT_ROOT" && npm run dev -- --hostname 127.0.0.1) &
FRONTEND_PID=$!
(cd "$PROJECT_ROOT/backend" && uv run --no-sync fastapi dev --host 127.0.0.1 --port 8000) &
BACKEND_PID=$!

cleanup() {
  exit_code=$?
  trap - EXIT INT TERM
  kill "$FRONTEND_PID" "$BACKEND_PID" 2>/dev/null || true
  wait "$FRONTEND_PID" "$BACKEND_PID" 2>/dev/null || true
  exit "$exit_code"
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

echo "Web app: http://localhost:3000"
echo "API docs: http://localhost:8000/docs"
echo "Press Ctrl+C to stop both servers."
wait -n "$FRONTEND_PID" "$BACKEND_PID"

