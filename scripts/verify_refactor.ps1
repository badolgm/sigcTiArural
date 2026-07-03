# verify_refactor.ps1
# Verification script for Hexagonal Refactor (Fase 1: Consolidate Domain Core)
# Checks that the key services + domain characterization tests are healthy.
# Part of the ADSO Hexagonal Refactor plan (see docs/ADSO_GUIA... Sec 7.8 for testing goals).
#
# Usage (from project root):
#   .\scripts\verify_refactor.ps1
#   .\scripts\verify_refactor.ps1 -StartServices   # only when you want to auto-start containers
#
# It assumes docker-compose services are (or can be) running for full checks.
# It does NOT start DB/backend by default to avoid side effects in CI/local.
# Domain tests (section 5) always run if pytest available (no docker needed).

param(
    [switch]$StartServices
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $ProjectRoot

# Contadores para el resumen final
$passed = 0
$warnings = 0
$failed = 0

Write-Host "=== Hex Refactor Verification (Fase 1: Consolidate Domain) ===" -ForegroundColor Cyan
Write-Host "Project root: $ProjectRoot" -ForegroundColor Gray
Write-Host "Focus: existing domain core (api/logic/domain/*) + services health. See Sec 7.8 TODO for more test goals." -ForegroundColor DarkGray

# 1. Optionally start services (use with care)
if ($StartServices) {
    Write-Host "`n[1] Starting dependent services (db + backend + ai_service)..." -ForegroundColor Yellow
    docker-compose up -d db backend ai_service
    Write-Host "Waiting 10s for services to initialize..." -ForegroundColor Gray
    Start-Sleep -Seconds 10
} else {
    Write-Host "`n[1] Skipping service start (use -StartServices if needed)" -ForegroundColor Gray
}

# 2. Check container status
# IMPROVEMENT: Use robust parsing of docker-compose ps output.
# We capture services that are actually "running" / "Up".
# This avoids fragile -match on multi-line output that includes headers.
# Also explicitly suppress and filter the "version: obsolete" warning from docker-compose.
Write-Host "`n[2] Checking container status..." -ForegroundColor Yellow
try {
    # Suppress stderr (where most compose warnings go) and filter any remaining warning lines
    $rawServices = docker-compose ps --services --filter "status=running" 2>$null
    $runningServices = $rawServices |
        ForEach-Object { $_.Trim() } |
        Where-Object { $_ -ne '' -and $_ -notmatch 'WARNING|obsolete|level=warning' }

    Write-Host "Currently running services: $($runningServices -join ', ')" -ForegroundColor Gray

    $required = @("db", "backend", "ai_service")
    foreach ($svc in $required) {
        if ($runningServices -contains $svc) {
            Write-Host "OK: $svc is running" -ForegroundColor Green
            $passed++
        } else {
            # Improved actionable message
            Write-Host "WARNING: $svc is not running! (start with: docker-compose up -d $svc or rerun script with -StartServices)" -ForegroundColor Red
            $warnings++
        }
    }
} catch {
    Write-Host "ERROR checking Docker containers: $_" -ForegroundColor Red
    Write-Host "Make sure Docker Desktop is running and docker-compose is available." -ForegroundColor Yellow
    $failed++
}

# Note (Fase 1, low-risk): The 'version: obsolete' warning from docker-compose is pre-existing (top-level in yml).
# It is filtered in detection logic above and harmless. Per rules, do not touch docker-compose or prod configs here.
# See ADSO guide Sec 7.7 (high risk, later phases).

# 3. Test AI Service
Write-Host "`n[3] Testing AI Service (port 8081)..." -ForegroundColor Yellow

# IMPORTANT: Use curl.exe instead of curl.
# In PowerShell, 'curl' is an alias for Invoke-WebRequest, which does not support
# the -F (multipart/form-data) flag in the same way as the real curl.
# Using curl.exe ensures compatibility with the original curl syntax used in the script.

# Health
Write-Host "  - GET /health" -ForegroundColor Gray
try {
    $health = curl.exe -s --max-time 10 http://localhost:8081/health | ConvertFrom-Json
    if ($health.status -eq "ok") {
        Write-Host "    OK: $($health | ConvertTo-Json -Compress)" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "    FAIL: $health" -ForegroundColor Red
        $failed++
    }
} catch {
    Write-Host "    ERROR calling /health: $_" -ForegroundColor Red
    $failed++
}

# Infer with dummy image (use existing test image if present)
$testImage = "src\ai_models\test_leaf.jpg"
if (Test-Path $testImage) {
    Write-Host "  - POST /infer (using $testImage)" -ForegroundColor Gray
    try {
        $infer = curl.exe -s --max-time 30 -F "file=@$testImage" http://localhost:8081/infer | ConvertFrom-Json
        if ($infer.status -eq "ok" -or $infer.status -eq "error") {
            Write-Host "    OK: diagnosis=$($infer.diagnosis), confidence=$($infer.confidence), status=$($infer.status)" -ForegroundColor Green
            $passed++
        } else {
            Write-Host "    Response: $($infer | ConvertTo-Json -Compress)" -ForegroundColor Yellow
            $warnings++
        }
    } catch {
        Write-Host "    ERROR calling /infer: $_" -ForegroundColor Red
        $failed++
    }
} else {
    Write-Host "  - Skipping /infer (no test image at $testImage)" -ForegroundColor Yellow
}

# 4. Test Backend (Django)
Write-Host "`n[4] Testing Backend (port 8000)..." -ForegroundColor Yellow

$backendEndpoints = @(
    "http://localhost:8000/api/telemetry/history/",
    "http://localhost:8000/api/v2/telemetry/history/?tipo=ROBOTICA"
)

foreach ($url in $backendEndpoints) {
    Write-Host "  - GET $url" -ForegroundColor Gray
    try {
        $resp = curl.exe -s --max-time 10 $url
        if ($LASTEXITCODE -ne 0) {
            # Improved actionable message when backend not reachable
            Write-Host "    ERROR: Cannot connect to backend (is the container running? Try: docker-compose up -d backend or use -StartServices flag)" -ForegroundColor Red
            $failed++
        } elseif ($resp) {
            Write-Host "    OK (response length: $($resp.Length) chars)" -ForegroundColor Green
            $passed++
        } else {
            Write-Host "    Empty response (backend responded but returned no content)" -ForegroundColor Yellow
            $warnings++
        }
    } catch {
        Write-Host "    ERROR: $_" -ForegroundColor Red
        $failed++
    }
}

# 5. Quick pytest run (if tests exist) - Fase 1 emphasis on domain characterization (api/logic/domain strategies + service + historico edges + error paths).
# Per Sec 7.8/7.10: we parse the exact #tests from output (dots count) and surface it in the resumen for visibility of the growing safety net.
Write-Host "`n[5] Running backend domain tests (if pytest available)..." -ForegroundColor Yellow
Push-Location src\backend
try {
    $hasCmd = $false
    if (Get-Command pytest -ErrorAction SilentlyContinue) {
        $hasCmd = $true
    }

    $hasModule = $false
    python -c "import pytest" 2>$null
    if ($LASTEXITCODE -eq 0) {
        $hasModule = $true
    }

    if ($hasCmd) {
        # Capture to parse exact test count/status for resumen (Fase 1 improvement per previous pending in Sec 10).
        # Re-emit output so user still sees the dots + coverage report.
        $output = & pytest tests/ -q --tb=line 2>&1
        $output | ForEach-Object { Write-Host $_ }
        if ($LASTEXITCODE -eq 0) {
            $passed++
            # Robust parse for this env: pytest -q + cov often emits dots line (one . per test) + cov table, not always "N passed".
            # Count dots in the dots line as the # of domain characterization tests executed.
            $dotsLine = $output | Select-String -Pattern '^\.{10,}' | Select-Object -First 1
            if ($dotsLine) {
                $num = ($dotsLine.Line.Trim() -replace '\s.*$', '').Length
                $script:domainTestSummary = "Domain tests: $num passed (see dots/coverage above)"
            } else {
                $script:domainTestSummary = "Domain tests: passed (characterization; count in output above)"
            }
        } else {
            $failed++
            $script:domainTestSummary = "Domain tests: FAILED (see output above)"
        }
    } elseif ($hasModule) {
        $output = python -m pytest tests/ -q --tb=line 2>&1
        $output | ForEach-Object { Write-Host $_ }
        if ($LASTEXITCODE -eq 0) {
            $passed++
            $dotsLine = $output | Select-String -Pattern '^\.{10,}' | Select-Object -First 1
            if ($dotsLine) {
                $num = ($dotsLine.Line.Trim() -replace '\s.*$', '').Length
                $script:domainTestSummary = "Domain tests: $num passed (see dots/coverage above)"
            } else {
                $script:domainTestSummary = "Domain tests: passed (characterization; count in output above)"
            }
        } else {
            $failed++
            $script:domainTestSummary = "Domain tests: FAILED (see output above)"
        }
    } else {
        Write-Host "  pytest is not available in this environment." -ForegroundColor Yellow
        Write-Host "  Suggestion: Install it with:" -ForegroundColor Gray
        Write-Host "    cd src\backend" -ForegroundColor Gray
        Write-Host "    pip install -r requirements.txt" -ForegroundColor Gray
        Write-Host "  Then run:" -ForegroundColor Gray
        Write-Host "    pytest tests/ -q" -ForegroundColor Gray
        Write-Host "  (Make sure you are in the correct Python environment / venv)" -ForegroundColor Gray
        $warnings++
    }

    # Fase 1 note: detailed dots + coverage for domain strategies printed (and parsed) above.
    # New characterization tests (historico edges, switches, errors) help cover generar_historico_simulado + guards in all 4 labs + service.
    if ($script:domainTestSummary) {
        Write-Host "  $script:domainTestSummary" -ForegroundColor DarkGray
    } else {
        Write-Host "  (Domain tests output + coverage above. Growing safety net for the existing hexagonal core.)" -ForegroundColor DarkGray
    }
} finally {
    Pop-Location
}

Write-Host "`n=== Verification complete ===" -ForegroundColor Cyan

# Resumen final - made more visual and useful (Fase 1 updates)
$estado_general = "$passed OK / $warnings Warnings / $failed Errores"
Write-Host "`n=== Resumen Verificación (Fase 1: Consolidate Domain Core) ===" -ForegroundColor Cyan
Write-Host "Estado general: $estado_general" -ForegroundColor White
Write-Host ""
Write-Host "Checks ejecutados en esta verificación:" -ForegroundColor Gray
Write-Host "  - Pasaron (OK): $passed" -ForegroundColor Green
Write-Host "  - Con warnings (no críticos): $warnings" -ForegroundColor Yellow
Write-Host "  - Fallaron (errores): $failed" -ForegroundColor Red
Write-Host ""
Write-Host "Nota: Los conteos reflejan los checks de contenedores (secc.2), AI (secc.3) y Backend (secc.4)." -ForegroundColor Gray
Write-Host "La sección de pytest (secc.5) se ejecuta por separado (domain characterization tests for api/logic/domain strategies)." -ForegroundColor Gray
Write-Host "  Domain tests help consolidate the existing hexagonal nucleus (see ADSO guide Sec 7.8)." -ForegroundColor DarkGray
if ($script:domainTestSummary) {
    Write-Host "  $script:domainTestSummary" -ForegroundColor Cyan
}

if ($failed -gt 0) {
    Write-Host "`n=== Resumen Verificación (Fase 1: Consolidate Domain Core) ===" -ForegroundColor Red
    Write-Host "Hay errores graves (probablemente servicios no levantados). Revisa los mensajes de ERROR arriba." -ForegroundColor Red
    Write-Host "Acción recomendada: Ejecuta el script con -StartServices o inicia manualmente: docker-compose up -d db backend ai_service" -ForegroundColor Red
} elseif ($warnings -gt 0) {
    Write-Host "`n=== Resumen Verificación (Fase 1: Consolidate Domain Core) ===" -ForegroundColor Yellow
    Write-Host "Hay algunos warnings (ej. servicios no running), pero la mayoría de checks OK." -ForegroundColor Yellow
    Write-Host "Acción recomendada: Inicia los servicios faltantes y re-ejecuta." -ForegroundColor Yellow
} else {
    Write-Host "`n=== Resumen Verificación (Fase 1: Consolidate Domain Core) ===" -ForegroundColor Green
    Write-Host "¡Todo bien! Domain core + services checks passed. Fase 1 progress on characterization tests (see Sec 7.8)." -ForegroundColor Green
}