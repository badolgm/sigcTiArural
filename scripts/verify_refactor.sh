#!/bin/bash
# verify_refactor.sh
# Basic verification for Fase 0 on Linux/macOS
set -e

echo "=== Fase 0 Refactor Verification ==="

# Go to project root
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd "$SCRIPT_DIR/.."

echo "[1] Container status"
docker-compose ps || true

echo "[2] AI Service health"
curl -s --max-time 10 http://localhost:8081/health || echo "AI /health failed"

echo "[3] Backend endpoints"
curl -s --max-time 10 http://localhost:8000/api/telemetry/history/ | head -c 200 || echo "Backend history failed"
echo

echo "[4] Domain tests (if pytest installed)"
(cd src/backend && python -m pytest tests/domain/ -q --tb=no) || echo "pytest run failed or not installed"

echo "=== Done ==="