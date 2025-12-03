Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🚀 FreeShell 서버 시작" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 기존 프로세스 종료
Write-Host "기존 프로세스 정리..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2
Write-Host "✅ 정리 완료" -ForegroundColor Green
Write-Host ""

# 포트 확인 및 정리
Write-Host "포트 확인..." -ForegroundColor Yellow
$port3001 = netstat -ano | Select-String ":3001"
if ($port3001) {
    $port3001 | ForEach-Object {
        $line = $_.ToString().Trim()
        $pid = ($line -split '\s+')[-1]
        taskkill /F /PID $pid 2>$null
    }
    Start-Sleep -Seconds 2
}
Write-Host "✅ 포트 준비됨" -ForegroundColor Green
Write-Host ""

# 백엔드 시작
Write-Host "1️⃣  백엔드 시작..." -ForegroundColor Green
$backendScript = Join-Path $PSScriptRoot "start-backend.ps1"
Start-Process powershell -ArgumentList "-NoExit", "-File", "`"$backendScript`""
Start-Sleep -Seconds 12

# 프론트엔드 시작  
Write-Host "2️⃣  프론트엔드 시작..." -ForegroundColor Blue
$frontendScript = Join-Path $PSScriptRoot "start-frontend.ps1"
Start-Process powershell -ArgumentList "-NoExit", "-File", "`"$frontendScript`""
Start-Sleep -Seconds 8

# Cloudflare Tunnel 시작
Write-Host "3️⃣  Cloudflare Tunnel 시작..." -ForegroundColor Magenta
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host '========================================' -ForegroundColor Magenta; Write-Host ' Cloudflare Tunnel' -ForegroundColor Magenta; Write-Host '========================================' -ForegroundColor Magenta; Write-Host ''; cloudflared tunnel run freeshell"
Start-Sleep -Seconds 8

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✅ 모든 서버 시작 완료!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "📊 서버 상태:" -ForegroundColor Cyan
Write-Host "  🟢 백엔드:     http://localhost:3001" -ForegroundColor White
Write-Host "  🔵 프론트엔드: http://localhost:3000" -ForegroundColor White
Write-Host "  🟣 외부 접속:  https://freeshell.co.kr" -ForegroundColor White
Write-Host ""
Write-Host "🔐 관리자 계정:" -ForegroundColor Yellow
Write-Host "  master@freeshell.co.kr" -ForegroundColor White
Write-Host "  Master2024!@#" -ForegroundColor White
Write-Host ""
Write-Host "⏳ 약 30초 후 접속 가능" -ForegroundColor Magenta
Write-Host ""

# 로그인 테스트
Write-Host "로그인 테스트 (30초 대기)..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

$body = @{
    email = "master@freeshell.co.kr"
    password = "Master2024!@#"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 10
    Write-Host ""
    Write-Host "================================================" -ForegroundColor Green
    Write-Host "   ✅ 로그인 테스트 성공!" -ForegroundColor Green
    Write-Host "================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌍 지금 접속하세요: https://freeshell.co.kr" -ForegroundColor Cyan
    Write-Host ""
} catch {
    Write-Host ""
    Write-Host "⚠️  백엔드 초기화 중..." -ForegroundColor Yellow
    Write-Host "조금만 더 기다려주세요 (약 1분)" -ForegroundColor Gray
}

