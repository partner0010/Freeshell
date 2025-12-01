# ngrok 자동 설정 스크립트

Write-Host "🚀 ngrok 외부 접속 설정" -ForegroundColor Cyan
Write-Host ""

# ngrok 설치 확인
$ngrokInstalled = Get-Command ngrok -ErrorAction SilentlyContinue

if (-not $ngrokInstalled) {
    Write-Host "❌ ngrok이 설치되지 않았습니다." -ForegroundColor Red
    Write-Host ""
    Write-Host "설치 방법:" -ForegroundColor Yellow
    Write-Host "1. https://ngrok.com/download 에서 다운로드" -ForegroundColor White
    Write-Host "2. 또는 Chocolatey: choco install ngrok" -ForegroundColor White
    Write-Host "3. 또는 Scoop: scoop install ngrok" -ForegroundColor White
    Write-Host ""
    Write-Host "설치 후 이 스크립트를 다시 실행하세요." -ForegroundColor Yellow
    exit
}

Write-Host "✅ ngrok이 설치되어 있습니다." -ForegroundColor Green
Write-Host ""

# 인증 토큰 확인
$ngrokConfig = "$env:USERPROFILE\.ngrok2\ngrok.yml"
if (-not (Test-Path $ngrokConfig)) {
    Write-Host "⚠️ ngrok 인증 토큰이 설정되지 않았습니다." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "인증 방법:" -ForegroundColor Yellow
    Write-Host "1. https://dashboard.ngrok.com/signup 에서 무료 계정 생성" -ForegroundColor White
    Write-Host "2. 인증 토큰 복사" -ForegroundColor White
    Write-Host "3. 다음 명령어 실행: ngrok config add-authtoken YOUR_TOKEN" -ForegroundColor White
    Write-Host ""
    $continue = Read-Host "인증 토큰을 입력하시겠습니까? (y/n)"
    if ($continue -eq "y") {
        $token = Read-Host "인증 토큰을 입력하세요"
        ngrok config add-authtoken $token
        Write-Host "✅ 인증 토큰이 설정되었습니다!" -ForegroundColor Green
    } else {
        Write-Host "인증 토큰 설정 후 다시 실행하세요." -ForegroundColor Yellow
        exit
    }
}

Write-Host "✅ ngrok 설정 완료!" -ForegroundColor Green
Write-Host ""

# 서버 실행 확인
Write-Host "서버 실행 상태 확인 중..." -ForegroundColor Cyan
$backendRunning = $false
$frontendRunning = $false

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/health" -UseBasicParsing -TimeoutSec 2 -ErrorAction SilentlyContinue
    $backendRunning = $true
} catch {
    $backendRunning = $false
}

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 2 -ErrorAction SilentlyContinue
    $frontendRunning = $true
} catch {
    $frontendRunning = $false
}

if (-not $backendRunning) {
    Write-Host "⚠️ 백엔드 서버가 실행되지 않았습니다." -ForegroundColor Yellow
    Write-Host "   먼저 백엔드 서버를 실행하세요: cd backend && npm run dev" -ForegroundColor White
}

if (-not $frontendRunning) {
    Write-Host "⚠️ 프론트엔드 서버가 실행되지 않았습니다." -ForegroundColor Yellow
    Write-Host "   먼저 프론트엔드 서버를 실행하세요: npm run dev" -ForegroundColor White
}

if ($backendRunning -and $frontendRunning) {
    Write-Host "✅ 서버가 실행 중입니다!" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "ngrok 터널을 시작합니다..." -ForegroundColor Cyan
    Write-Host ""
    Write-Host "백엔드 터널 (포트 3001):" -ForegroundColor Yellow
    Start-Process ngrok -ArgumentList "http 3001" -WindowStyle Normal
    
    Start-Sleep -Seconds 2
    
    Write-Host "프론트엔드 터널 (포트 3000):" -ForegroundColor Yellow
    Start-Process ngrok -ArgumentList "http 3000" -WindowStyle Normal
    
    Write-Host ""
    Write-Host "✅ ngrok 터널이 시작되었습니다!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📱 외부 접속 주소:" -ForegroundColor Cyan
    Write-Host "   - ngrok 대시보드: http://localhost:4040" -ForegroundColor White
    Write-Host "   - 대시보드에서 Forwarding 주소를 확인하세요" -ForegroundColor White
    Write-Host ""
    Write-Host "💡 팁:" -ForegroundColor Yellow
    Write-Host "   - ngrok 무료 플랜은 주소가 매번 변경됩니다" -ForegroundColor White
    Write-Host "   - 유료 플랜을 사용하면 고정 주소 사용 가능" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "서버를 실행한 후 다시 이 스크립트를 실행하세요." -ForegroundColor Yellow
}

