# Cloudflare Tunnel 자동 설정 스크립트

Write-Host "🌐 Cloudflare Tunnel 설정 시작" -ForegroundColor Cyan
Write-Host ""

# Cloudflared 설치 확인
$cloudflaredInstalled = Get-Command cloudflared -ErrorAction SilentlyContinue

if (-not $cloudflaredInstalled) {
    Write-Host "❌ Cloudflared가 설치되지 않았습니다." -ForegroundColor Red
    Write-Host ""
    Write-Host "설치 방법:" -ForegroundColor Yellow
    Write-Host "1. winget 사용 (권장):" -ForegroundColor White
    Write-Host "   winget install --id Cloudflare.cloudflared" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "2. 직접 다운로드:" -ForegroundColor White
    Write-Host "   https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/" -ForegroundColor Cyan
    Write-Host ""
    $install = Read-Host "지금 설치하시겠습니까? (y/n)"
    if ($install -eq "y") {
        Write-Host "winget으로 설치 중..." -ForegroundColor Yellow
        winget install --id Cloudflare.cloudflared
        Write-Host "✅ 설치 완료! PowerShell을 재시작한 후 다시 실행하세요." -ForegroundColor Green
        exit
    } else {
        Write-Host "설치 후 다시 이 스크립트를 실행하세요." -ForegroundColor Yellow
        exit
    }
}

Write-Host "✅ Cloudflared가 설치되어 있습니다." -ForegroundColor Green
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

if (-not $backendRunning -or -not $frontendRunning) {
    Write-Host ""
    Write-Host "서버를 실행한 후 다시 이 스크립트를 실행하세요." -ForegroundColor Yellow
    exit
}

Write-Host "✅ 서버가 실행 중입니다!" -ForegroundColor Green
Write-Host ""

# Cloudflare 로그인 확인
Write-Host "Cloudflare 로그인 상태 확인 중..." -ForegroundColor Cyan
$configPath = "$env:USERPROFILE\.cloudflared\config.yml"
$accountPath = "$env:USERPROFILE\.cloudflared\cert.pem"

if (-not (Test-Path $accountPath)) {
    Write-Host "⚠️ Cloudflare에 로그인되지 않았습니다." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "다음 단계를 따라주세요:" -ForegroundColor Yellow
    Write-Host "1. 브라우저가 자동으로 열립니다" -ForegroundColor White
    Write-Host "2. Cloudflare 계정으로 로그인하세요" -ForegroundColor White
    Write-Host "3. 권한을 승인하세요" -ForegroundColor White
    Write-Host ""
    $continue = Read-Host "계속하시겠습니까? (y/n)"
    if ($continue -ne "y") {
        exit
    }
    
    Write-Host "Cloudflare 로그인 중..." -ForegroundColor Cyan
    cloudflared tunnel login
    Write-Host ""
}

Write-Host "✅ Cloudflare 로그인 완료!" -ForegroundColor Green
Write-Host ""

# 터널 생성
Write-Host "터널 생성 중..." -ForegroundColor Cyan
Write-Host "터널 이름을 입력하세요 (기본값: freeshell):" -ForegroundColor Yellow
$tunnelName = Read-Host "터널 이름"
if ([string]::IsNullOrWhiteSpace($tunnelName)) {
    $tunnelName = "freeshell"
}

Write-Host "터널 '$tunnelName' 생성 중..." -ForegroundColor Cyan
cloudflared tunnel create $tunnelName
Write-Host "✅ 터널 생성 완료!" -ForegroundColor Green
Write-Host ""

# 설정 파일 생성
Write-Host "설정 파일 생성 중..." -ForegroundColor Cyan

$configDir = "$env:USERPROFILE\.cloudflared"
if (-not (Test-Path $configDir)) {
    New-Item -ItemType Directory -Path $configDir -Force | Out-Null
}

# 터널 ID 가져오기
$tunnelList = cloudflared tunnel list
$tunnelId = ""
foreach ($line in $tunnelList) {
    if ($line -match "$tunnelName\s+([a-f0-9-]+)") {
        $tunnelId = $matches[1]
        break
    }
}

if ([string]::IsNullOrWhiteSpace($tunnelId)) {
    Write-Host "⚠️ 터널 ID를 찾을 수 없습니다. 수동으로 설정하세요." -ForegroundColor Yellow
    $tunnelId = Read-Host "터널 ID를 입력하세요"
}

# 도메인 입력
Write-Host ""
Write-Host "도메인을 입력하세요:" -ForegroundColor Yellow
Write-Host "예: yourdomain.com" -ForegroundColor Gray
$domain = Read-Host "도메인"

if ([string]::IsNullOrWhiteSpace($domain)) {
    Write-Host "⚠️ 도메인을 입력하지 않았습니다. 나중에 수동으로 설정하세요." -ForegroundColor Yellow
    $domain = "yourdomain.com"
}

$apiDomain = "api.$domain"
$frontendDomain = $domain

# 설정 파일 내용
$configContent = @"
tunnel: $tunnelId
credentials-file: $env:USERPROFILE\.cloudflared\$tunnelId.json

ingress:
  - hostname: $apiDomain
    service: http://localhost:3001
  - hostname: $frontendDomain
    service: http://localhost:3000
  - service: http_status:404
"@

$configContent | Out-File -FilePath $configPath -Encoding UTF8
Write-Host "✅ 설정 파일 생성 완료: $configPath" -ForegroundColor Green
Write-Host ""

# DNS 레코드 설정 안내
Write-Host "📋 DNS 레코드 설정이 필요합니다:" -ForegroundColor Cyan
Write-Host ""
Write-Host "Cloudflare 대시보드 (https://dash.cloudflare.com)에서:" -ForegroundColor Yellow
Write-Host "1. 도메인 선택" -ForegroundColor White
Write-Host "2. DNS → Records로 이동" -ForegroundColor White
Write-Host "3. 다음 레코드 추가:" -ForegroundColor White
Write-Host ""
Write-Host "   Type: CNAME" -ForegroundColor Cyan
Write-Host "   Name: api" -ForegroundColor Cyan
Write-Host "   Target: $tunnelId.cfargotunnel.com" -ForegroundColor Cyan
Write-Host "   Proxy: ON (주황색 구름)" -ForegroundColor Cyan
Write-Host ""
Write-Host "   Type: CNAME" -ForegroundColor Cyan
Write-Host "   Name: @ (또는 루트 도메인)" -ForegroundColor Cyan
Write-Host "   Target: $tunnelId.cfargotunnel.com" -ForegroundColor Cyan
Write-Host "   Proxy: ON (주황색 구름)" -ForegroundColor Cyan
Write-Host ""
Write-Host "DNS 레코드 설정 후 계속하세요." -ForegroundColor Yellow
$continue = Read-Host "DNS 레코드를 설정하셨나요? (y/n)"
if ($continue -ne "y") {
    Write-Host "DNS 레코드 설정 후 터널을 실행하세요:" -ForegroundColor Yellow
    Write-Host "  cloudflared tunnel run $tunnelName" -ForegroundColor Cyan
    exit
}

# 환경 변수 설정 안내
Write-Host ""
Write-Host "📝 환경 변수 설정이 필요합니다:" -ForegroundColor Cyan
Write-Host ""
Write-Host "backend/.env 파일에 추가:" -ForegroundColor Yellow
Write-Host "  FRONTEND_URL=https://$frontendDomain" -ForegroundColor Cyan
Write-Host ""
Write-Host "프론트엔드 .env 파일에 추가:" -ForegroundColor Yellow
Write-Host "  VITE_API_BASE_URL=https://$apiDomain/api" -ForegroundColor Cyan
Write-Host ""

$setupEnv = Read-Host "지금 환경 변수를 설정하시겠습니까? (y/n)"
if ($setupEnv -eq "y") {
    # 백엔드 .env 파일
    $backendEnvPath = "..\backend\.env"
    if (Test-Path $backendEnvPath) {
        $envContent = Get-Content $backendEnvPath -Raw
        if ($envContent -notmatch "FRONTEND_URL") {
            Add-Content -Path $backendEnvPath -Value "`nFRONTEND_URL=https://$frontendDomain"
            Write-Host "✅ backend/.env 파일 업데이트 완료" -ForegroundColor Green
        } else {
            Write-Host "⚠️ backend/.env에 FRONTEND_URL이 이미 있습니다." -ForegroundColor Yellow
        }
    } else {
        Write-Host "⚠️ backend/.env 파일을 찾을 수 없습니다." -ForegroundColor Yellow
    }
    
    # 프론트엔드 .env 파일
    $frontendEnvPath = "..\.env"
    if (Test-Path $frontendEnvPath) {
        $envContent = Get-Content $frontendEnvPath -Raw
        if ($envContent -notmatch "VITE_API_BASE_URL") {
            Add-Content -Path $frontendEnvPath -Value "`nVITE_API_BASE_URL=https://$apiDomain/api"
            Write-Host "✅ 프론트엔드 .env 파일 업데이트 완료" -ForegroundColor Green
        } else {
            Write-Host "⚠️ 프론트엔드 .env에 VITE_API_BASE_URL이 이미 있습니다." -ForegroundColor Yellow
        }
    } else {
        Write-Host "⚠️ 프론트엔드 .env 파일을 찾을 수 없습니다." -ForegroundColor Yellow
    }
}

# 터널 실행
Write-Host ""
Write-Host "🚀 Cloudflare Tunnel 실행 중..." -ForegroundColor Cyan
Write-Host ""
Write-Host "터널이 실행되면 다음 주소로 접속할 수 있습니다:" -ForegroundColor Yellow
Write-Host "  프론트엔드: https://$frontendDomain" -ForegroundColor Green
Write-Host "  백엔드 API: https://$apiDomain/api" -ForegroundColor Green
Write-Host ""
Write-Host "터널을 중지하려면 Ctrl+C를 누르세요." -ForegroundColor Gray
Write-Host ""

# 터널 실행
cloudflared tunnel run $tunnelName

