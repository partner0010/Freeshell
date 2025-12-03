# FreeShell 프로덕션 중지 스크립트

Write-Host "========================================" -ForegroundColor Red
Write-Host "🛑 FreeShell 프로덕션 모드 중지" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Red
Write-Host ""

# PM2 프로세스 종료
Write-Host "PM2 프로세스 종료..." -ForegroundColor Yellow
pm2 stop all
pm2 delete all
Write-Host "✅ PM2 종료 완료" -ForegroundColor Green
Write-Host ""

# Node 프로세스 종료
Write-Host "Node 프로세스 종료..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
Write-Host "✅ Node 종료 완료" -ForegroundColor Green
Write-Host ""

# Cloudflare 종료
Write-Host "Cloudflare Tunnel 종료..." -ForegroundColor Yellow
Get-Process -Name cloudflared -ErrorAction SilentlyContinue | Stop-Process -Force
Write-Host "✅ Tunnel 종료 완료" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host "✅ 모든 서버가 중지되었습니다" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

