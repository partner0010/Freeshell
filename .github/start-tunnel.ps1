# Cloudflare Tunnel 시작 스크립트
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "  Cloudflare Tunnel 시작" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

# 서버 상태 확인
Write-Host "서버 상태 확인 중..." -ForegroundColor Yellow
Write-Host ""

$backendRunning = $false
$frontendRunning = $false

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/health" -UseBasicParsing -TimeoutSec 2
    $backendRunning = $true
    Write-Host "OK 백엔드 서버 실행 중 (포트 3001)" -ForegroundColor Green
} catch {
    Write-Host "! 백엔드 서버가 실행되지 않았습니다" -ForegroundColor Yellow
    Write-Host "  실행 명령: cd backend && npm run dev" -ForegroundColor Gray
}

Write-Host ""

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 2
    $frontendRunning = $true
    Write-Host "OK 프론트엔드 서버 실행 중 (포트 3000)" -ForegroundColor Green
} catch {
    Write-Host "! 프론트엔드 서버가 실행되지 않았습니다" -ForegroundColor Yellow
    Write-Host "  실행 명령: npm run dev" -ForegroundColor Gray
}

Write-Host ""

if (-not ($backendRunning -and $frontendRunning)) {
    Write-Host "===========================================" -ForegroundColor Yellow
    Write-Host "  경고: 서버가 실행되지 않았습니다" -ForegroundColor Yellow
    Write-Host "===========================================" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "터널만 시작됩니다." -ForegroundColor Yellow
    Write-Host "서버를 먼저 실행한 후 다시 시도하세요." -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "Cloudflare Tunnel 시작 중..." -ForegroundColor Cyan
Write-Host ""

cloudflared tunnel run freeshell

