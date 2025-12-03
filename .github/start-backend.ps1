Write-Host "========================================" -ForegroundColor Green
Write-Host "🚀 백엔드 서버 시작" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

$backendPath = Join-Path $PSScriptRoot "backend"
Write-Host "백엔드 경로: $backendPath" -ForegroundColor Cyan

Set-Location $backendPath

Write-Host "현재 위치: $(Get-Location)" -ForegroundColor Green
Write-Host ""

Write-Host "백엔드 실행 중..." -ForegroundColor Yellow
Write-Host ""

npm run dev

