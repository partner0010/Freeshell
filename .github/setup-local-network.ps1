# 로컬 네트워크 외부 접속 설정

Write-Host "🏠 로컬 네트워크 외부 접속 설정" -ForegroundColor Cyan
Write-Host ""

# 로컬 IP 주소 확인
Write-Host "로컬 IP 주소 확인 중..." -ForegroundColor Cyan
$localIP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { 
    $_.IPAddress -notlike "127.*" -and 
    $_.IPAddress -notlike "169.254.*" -and
    $_.InterfaceAlias -notlike "*Loopback*"
} | Select-Object -First 1).IPAddress

if ($localIP) {
    Write-Host "✅ 로컬 IP 주소: $localIP" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "❌ 로컬 IP 주소를 찾을 수 없습니다." -ForegroundColor Red
    exit
}

# 방화벽 규칙 추가
Write-Host "방화벽 규칙 추가 중..." -ForegroundColor Cyan

$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "⚠️ 관리자 권한이 필요합니다." -ForegroundColor Yellow
    Write-Host "   관리자 권한으로 PowerShell을 실행한 후 다시 시도하세요." -ForegroundColor White
    Write-Host ""
    Write-Host "또는 수동으로 설정:" -ForegroundColor Yellow
    Write-Host "1. Windows 보안 → 방화벽 및 네트워크 보호" -ForegroundColor White
    Write-Host "2. 고급 설정 → 인바운드 규칙 → 새 규칙" -ForegroundColor White
    Write-Host "3. 포트 선택 → TCP → 포트: 3000, 3001" -ForegroundColor White
    Write-Host "4. 연결 허용 선택" -ForegroundColor White
    exit
}

try {
    # 기존 규칙 확인
    $existingBackend = Get-NetFirewallRule -DisplayName "Freeshell Backend" -ErrorAction SilentlyContinue
    $existingFrontend = Get-NetFirewallRule -DisplayName "Freeshell Frontend" -ErrorAction SilentlyContinue
    
    if (-not $existingBackend) {
        New-NetFirewallRule -DisplayName "Freeshell Backend" -Direction Inbound -LocalPort 3001 -Protocol TCP -Action Allow | Out-Null
        Write-Host "✅ 백엔드 방화벽 규칙 추가됨 (포트 3001)" -ForegroundColor Green
    } else {
        Write-Host "ℹ️ 백엔드 방화벽 규칙이 이미 존재합니다." -ForegroundColor Cyan
    }
    
    if (-not $existingFrontend) {
        New-NetFirewallRule -DisplayName "Freeshell Frontend" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow | Out-Null
        Write-Host "✅ 프론트엔드 방화벽 규칙 추가됨 (포트 3000)" -ForegroundColor Green
    } else {
        Write-Host "ℹ️ 프론트엔드 방화벽 규칙이 이미 존재합니다." -ForegroundColor Cyan
    }
} catch {
    Write-Host "❌ 방화벽 규칙 추가 실패: $_" -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "✅ 방화벽 설정 완료!" -ForegroundColor Green
Write-Host ""

# 환경 변수 업데이트 안내
Write-Host "📝 환경 변수 업데이트 필요:" -ForegroundColor Yellow
Write-Host ""
Write-Host "백엔드 (.env):" -ForegroundColor Cyan
Write-Host "  FRONTEND_URL=http://$localIP:3000" -ForegroundColor White
Write-Host ""
Write-Host "프론트엔드 (.env):" -ForegroundColor Cyan
Write-Host "  VITE_API_BASE_URL=http://$localIP:3001/api" -ForegroundColor White
Write-Host ""

$update = Read-Host "환경 변수를 자동으로 업데이트하시겠습니까? (y/n)"
if ($update -eq "y") {
    # 백엔드 .env 업데이트
    $backendEnv = "backend\.env"
    if (Test-Path $backendEnv) {
        $content = Get-Content $backendEnv -Raw
        $content = $content -replace 'FRONTEND_URL=.*', "FRONTEND_URL=http://$localIP:3000"
        Set-Content $backendEnv $content
        Write-Host "✅ 백엔드 .env 업데이트 완료" -ForegroundColor Green
    }
    
    # 프론트엔드 .env 업데이트
    $frontendEnv = ".env"
    if (Test-Path $frontendEnv) {
        $content = Get-Content $frontendEnv -Raw
        $content = $content -replace 'VITE_API_BASE_URL=.*', "VITE_API_BASE_URL=http://$localIP:3001/api"
        Set-Content $frontendEnv $content
        Write-Host "✅ 프론트엔드 .env 업데이트 완료" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "=" * 60 -ForegroundColor Green
Write-Host "✅ 설정 완료!" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Green
Write-Host ""
Write-Host "📱 접속 주소:" -ForegroundColor Cyan
Write-Host "   프론트엔드: http://$localIP:3000" -ForegroundColor White
Write-Host "   백엔드: http://$localIP:3001" -ForegroundColor White
Write-Host ""
Write-Host "💡 같은 Wi-Fi 네트워크에 연결된 기기에서 접속 가능합니다!" -ForegroundColor Yellow
Write-Host ""

