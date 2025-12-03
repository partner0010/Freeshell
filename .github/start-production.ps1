# FreeShell 프로덕션 시작 스크립트

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🚀 FreeShell 프로덕션 모드 시작" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. 기존 프로세스 종료
Write-Host "[1/5] 기존 프로세스 종료..." -ForegroundColor Yellow
pm2 stop all 2>$null
pm2 delete all 2>$null
Get-Process -Name node,cloudflared -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2
Write-Host "✅ 종료 완료" -ForegroundColor Green
Write-Host ""

# 2. 프로덕션 빌드
Write-Host "[2/5] 프로덕션 빌드..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 빌드 실패!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ 빌드 완료" -ForegroundColor Green
Write-Host ""

# 3. PM2로 백엔드/프론트엔드 시작
Write-Host "[3/5] PM2로 서버 시작..." -ForegroundColor Yellow
pm2 start ecosystem.config.js
Start-Sleep -Seconds 5
Write-Host "✅ 서버 시작 완료" -ForegroundColor Green
Write-Host ""

# 4. Cloudflare Tunnel 시작
Write-Host "[4/5] Cloudflare Tunnel 시작..." -ForegroundColor Yellow
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cloudflared tunnel run freeshell" -WindowStyle Normal
Start-Sleep -Seconds 5
Write-Host "✅ Tunnel 시작 완료" -ForegroundColor Green
Write-Host ""

# 5. 상태 확인
Write-Host "[5/5] 서버 상태 확인..." -ForegroundColor Yellow
pm2 status
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host "✅ 프로덕션 모드 시작 완료!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "🌍 접속 주소:" -ForegroundColor Cyan
Write-Host ""
Write-Host "   외부: https://freeshell.co.kr" -ForegroundColor Yellow -BackgroundColor Black
Write-Host "   내부: http://localhost:3000" -ForegroundColor Gray
Write-Host ""

Write-Host "📊 서버 관리:" -ForegroundColor Cyan
Write-Host "   pm2 status        - 상태 확인" -ForegroundColor White
Write-Host "   pm2 logs          - 로그 확인" -ForegroundColor White
Write-Host "   pm2 restart all   - 재시작" -ForegroundColor White
Write-Host "   pm2 stop all      - 정지" -ForegroundColor White
Write-Host ""

Write-Host "🎉 프로덕션 모드로 실행 중입니다!" -ForegroundColor Green
Write-Host ""

