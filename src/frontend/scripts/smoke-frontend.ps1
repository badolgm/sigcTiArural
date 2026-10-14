param(
    [int]$Port = 5173,
    [int]$TimeoutSec = 60
)

$ErrorActionPreference = "Stop"
$repoRoot = Resolve-Path "$PSScriptRoot/../../.."
$composeFile = Join-Path $repoRoot "docker-compose.yml"
$baseUrl = "http://localhost:$Port"

function Write-Result($name, $ok, $detail) {
    $symbol = if ($ok) { "PASS" } else { "FAIL" }
    Write-Host "[$symbol] $name - $detail"
}

Write-Host "=== FRONTEND SMOKE TEST ===" -ForegroundColor Cyan
Write-Host "Repo root : $repoRoot"
Write-Host "Base URL  : $baseUrl"
Write-Host ""

$passed = 0
$failed = 0

try {
    Write-Host "[1/4] docker compose build frontend" -ForegroundColor Yellow
    Push-Location $repoRoot
    $buildOut = cmd /c "docker compose -f `"$composeFile`" build frontend 2>&1"
    $buildOut | ForEach-Object { Write-Host $_ }
    if ($LASTEXITCODE -ne 0) { throw "docker compose build failed (exit $LASTEXITCODE)" }
    Write-Result "build frontend" $true "exit 0"
    $passed++

    Write-Host ""
    Write-Host "[2/4] docker compose up -d frontend" -ForegroundColor Yellow
    $upOut = cmd /c "docker compose -f `"$composeFile`" up -d frontend 2>&1"
    $upOut | ForEach-Object { Write-Host $_ }
    if ($LASTEXITCODE -ne 0) { throw "docker compose up failed (exit $LASTEXITCODE)" }

    Write-Host ""
    Write-Host "[3/4] Esperando que el contenedor sirva en $baseUrl ..." -ForegroundColor Yellow
    $deadline = (Get-Date).AddSeconds($TimeoutSec)
    $rootOk = $false
    while ((Get-Date) -lt $deadline) {
        try {
            $resp = Invoke-WebRequest -Uri $baseUrl -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
            if ($resp.StatusCode -eq 200) { $rootOk = $true; break }
        } catch {
            Start-Sleep -Seconds 2
        }
    }
    if (-not $rootOk) { throw "No se obtuvo HTTP 200 de $baseUrl en $TimeoutSec s" }
    $content = (Invoke-WebRequest -Uri $baseUrl -UseBasicParsing).Content
    $hasRoot = $content -match '<div\s+id="root"'
    Write-Result "GET / -> 200" $rootOk "status 200"
    if ($rootOk) { $passed++ } else { $failed++ }
    Write-Result "HTML contiene <div id=root>" $hasRoot "root div presente"
    if ($hasRoot) { $passed++ } else { $failed++ }

    Write-Host ""
    Write-Host "[4/4] Verificar proxy /api" -ForegroundColor Yellow
    try {
        $apiResp = Invoke-WebRequest -Uri "$baseUrl/api/health" -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
        Write-Result "GET /api/health" $true "status $($apiResp.StatusCode)"
        $passed++
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode -in @(404, 502, 504)) {
            Write-Result "GET /api/health" $true "proxy responde ($statusCode) - backend no disponible es aceptable"
            $passed++
        } else {
            Write-Result "GET /api/health" $false "error inesperado: $($_.Exception.Message)"
            $failed++
        }
    }
}
catch {
    Write-Result "smoke test" $false $_.Exception.Message
    $failed++
}
finally {
    Write-Host ""
    Write-Host "Teardown: docker compose down frontend" -ForegroundColor Yellow
    $downOut = cmd /c "docker compose -f `"$composeFile`" down frontend 2>&1"
    $downOut | ForEach-Object { Write-Host $_ }
    Pop-Location
}

Write-Host ""
Write-Host "=== RESULTADO: $passed PASS, $failed FAIL ===" -ForegroundColor $(if ($failed -eq 0) { "Green" } else { "Red" })
exit $(if ($failed -eq 0) { 0 } else { 1 })
