# FreeShell 프로덕션 시작 (간단 버전)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🚀 FreeShell 프로덕션 배포" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 기존 프로세스 종료
Get-Process -Name node,cloudflared -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

# 백엔드 시작 (별도 창)
Write-Host "[1/3] 백엔드 서버 시작..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host '=== 백엔드 프로덕션 ===' -ForegroundColor Cyan; cd '$PWD\backend'; `$env:NODE_ENV='production'; npm run dev" -WindowStyle Normal
Start-Sleep -Seconds 5
Write-Host "✅ 백엔드 시작" -ForegroundColor Green
Write-Host ""

# 프론트엔드 시작 (serve 사용)
Write-Host "[2/3] 프론트엔드 서버 시작..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host '=== 프론트엔드 프로덕션 ===' -ForegroundColor Cyan; cd '$PWD'; serve -s dist -l 3000 --cors" -WindowStyle Normal
Start-Sleep -Seconds 5
Write-Host "✅ 프론트엔드 시작" -ForegroundColor Green
Write-Host ""

# Cloudflare Tunnel 시작
Write-Host "[3/3] Cloudflare Tunnel 시작..." -ForegroundColor Yellow
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host '=== Cloudflare Tunnel ===' -ForegroundColor Cyan; cloudflared tunnel run freeshell" -WindowStyle Normal
Start-Sleep -Seconds 4
Write-Host "✅ Tunnel 시작" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host "✅ 프로덕션 배포 완료!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "🌍 접속 주소:" -ForegroundColor Cyan
Write-Host ""
Write-Host "   https://freeshell.co.kr" -ForegroundColor Yellow -BackgroundColor Black
Write-Host ""

Write-Host "💡 특징:" -ForegroundColor Magenta
Write-Host "   ✅ 프로덕션 빌드 사용" -ForegroundColor White
Write-Host "   ✅ serve로 정적 파일 제공" -ForegroundColor White
Write-Host "   ✅ 개발 모드 아님!" -ForegroundColor White
Write-Host "   ✅ 외부 접속 완벽 지원" -ForegroundColor White
Write-Host ""

Write-Host "🎉 이제 일반 모드(프로덕션)로 실행됩니다!" -ForegroundColor Green
Write-Host ""

