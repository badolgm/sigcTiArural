param(
    [switch]$SkipStartServices
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $ProjectRoot

Write-Host "=== SIGC&T Continuity Check ===" -ForegroundColor Cyan
Write-Host "Project root: $ProjectRoot" -ForegroundColor Gray

if (-not $SkipStartServices) {
    Write-Host "`n[1] Starting required services..." -ForegroundColor Yellow
    docker-compose up -d db backend ai_service frontend
    Write-Host "Waiting for services to become responsive..." -ForegroundColor Gray
} else {
    Write-Host "`n[1] Skipping service start (as requested)." -ForegroundColor Gray
}

$deadline = (Get-Date).AddMinutes(3)
$backendReady = $false
$aiReady = $false

while ((Get-Date) -lt $deadline) {
    try {
        $backendResp = curl.exe -s --max-time 5 http://localhost:8000/api/telemetry/history/
        if ($LASTEXITCODE -eq 0 -and $backendResp) {
            $backendReady = $true
        }
    } catch {
        $backendReady = $false
    }

    try {
        $aiResp = curl.exe -s --max-time 5 http://localhost:8081/health
        if ($LASTEXITCODE -eq 0 -and $aiResp -match '"status"\s*:\s*"ok"') {
            $aiReady = $true
        }
    } catch {
        $aiReady = $false
    }

    if ($backendReady -and $aiReady) {
        break
    }

    Start-Sleep -Seconds 5
}

if ($backendReady) {
    Write-Host "Backend endpoint ready." -ForegroundColor Green
} else {
    Write-Warning "Backend endpoint did not become ready in time."
}

if ($aiReady) {
    Write-Host "AI service endpoint ready." -ForegroundColor Green
} else {
    Write-Warning "AI service endpoint did not become ready in time."
}

Write-Host "`n[2] Running full verification script..." -ForegroundColor Yellow
powershell -ExecutionPolicy Bypass -File "$ProjectRoot/scripts/verify_refactor.ps1"
exit $LASTEXITCODE
