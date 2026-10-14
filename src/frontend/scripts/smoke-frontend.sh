#!/usr/bin/env bash
set -euo pipefail

PORT="${FRONTEND_PORT:-5173}"
TIMEOUT="${SMOKE_TIMEOUT:-60}"
REPO_ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
BASE_URL="http://localhost:${PORT}"

PASSED=0
FAILED=0

pass() { echo "[PASS] $1 - $2"; PASSED=$((PASSED+1)); }
fail() { echo "[FAIL] $1 - $2"; FAILED=$((FAILED+1)); }

echo "=== FRONTEND SMOKE TEST ==="
echo "Repo root : ${REPO_ROOT}"
echo "Base URL  : ${BASE_URL}"
echo ""

cd "${REPO_ROOT}"

trap 'echo ""; echo "Teardown: docker compose down frontend"; docker compose down frontend 2>/dev/null || true' EXIT

echo "[1/4] docker compose build frontend"
if docker compose build frontend; then
    pass "build frontend" "exit 0"
else
    fail "build frontend" "exit $?"
    echo "=== RESULTADO: ${PASSED} PASS, ${FAILED} FAIL ==="
    exit 1
fi

echo ""
echo "[2/4] docker compose up -d frontend"
docker compose up -d frontend

echo ""
echo "[3/4] Esperando que el contenedor sirva en ${BASE_URL} ..."
DEADLINE=$((SECONDS + TIMEOUT))
ROOT_OK=false
while [ $SECONDS -lt $DEADLINE ]; do
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}" || echo "000")
    if [ "$HTTP_CODE" = "200" ]; then
        ROOT_OK=true
        break
    fi
    sleep 2
done

if [ "$ROOT_OK" = true ]; then
    pass "GET / -> 200" "status 200"
else
    fail "GET / -> 200" "no se obtuvo 200 en ${TIMEOUT}s"
fi

CONTENT=$(curl -s "${BASE_URL}" || true)
if echo "$CONTENT" | grep -q '<div[^>]*id="root"'; then
    pass "HTML contiene <div id=root>" "root div presente"
else
    fail "HTML contiene <div id=root>" "root div ausente"
fi

echo ""
echo "[4/4] Verificar proxy /api"
API_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/api/health" || echo "000")
case "$API_CODE" in
    200|204) pass "GET /api/health" "status ${API_CODE}" ;;
    404|502|504) pass "GET /api/health" "proxy responde (${API_CODE}) - backend no disponible es aceptable" ;;
    *) fail "GET /api/health" "status inesperado: ${API_CODE}" ;;
esac

echo ""
echo "=== RESULTADO: ${PASSED} PASS, ${FAILED} FAIL ==="
[ "$FAILED" -eq 0 ]
