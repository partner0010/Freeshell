Write-Host "========================================" -ForegroundColor Blue
Write-Host "🌐 프론트엔드 서버 시작" -ForegroundColor Blue  
Write-Host "========================================" -ForegroundColor Blue
Write-Host ""

Write-Host "프론트엔드 경로: $PSScriptRoot" -ForegroundColor Cyan

Set-Location $PSScriptRoot

Write-Host "현재 위치: $(Get-Location)" -ForegroundColor Green
Write-Host ""

Write-Host "프론트엔드 실행 중..." -ForegroundColor Yellow
Write-Host ""

serve -s dist -l 3000 --cors

