# Cloudflare Tunnel과 함께 서버 시작 스크립트

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "   FreeShell 서버 + Cloudflare Tunnel 시작" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# 환경 변수 PATH 설정
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# 프로젝트 루트로 이동
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot

Write-Host "1. 백엔드 서버 시작 중..." -ForegroundColor Yellow
Write-Host ""

# 백엔드 서버 시작 (백그라운드)
$backendJob = Start-Job -ScriptBlock {
    param($projectRoot)
    Set-Location "$projectRoot\backend"
    npm run dev
} -ArgumentList $projectRoot

Write-Host "✅ 백엔드 서버 시작됨 (포트 3001)" -ForegroundColor Green
Write-Host ""

# 백엔드 서버가 시작될 때까지 대기
Write-Host "백엔드 서버 준비 대기 중..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

$maxRetries = 10
$retries = 0
$backendReady = $false

while (-not $backendReady -and $retries -lt $maxRetries) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3001/api/health" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
        $backendReady = $true
        Write-Host "✅ 백엔드 서버 준비 완료!" -ForegroundColor Green
    } catch {
        $retries++
        Write-Host "대기 중... ($retries/$maxRetries)" -ForegroundColor Gray
        Start-Sleep -Seconds 2
    }
}

if (-not $backendReady) {
    Write-Host "❌ 백엔드 서버 시작 실패" -ForegroundColor Red
    Stop-Job $backendJob
    Remove-Job $backendJob
    exit 1
}

Write-Host ""
Write-Host "2. 프론트엔드 서버 시작 중..." -ForegroundColor Yellow
Write-Host ""

# 프론트엔드 서버 시작 (백그라운드)
$frontendJob = Start-Job -ScriptBlock {
    param($projectRoot)
    Set-Location $projectRoot
    npm run dev
} -ArgumentList $projectRoot

Write-Host "✅ 프론트엔드 서버 시작됨 (포트 3000)" -ForegroundColor Green
Write-Host ""

# 프론트엔드 서버가 시작될 때까지 대기
Write-Host "프론트엔드 서버 준비 대기 중..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

$retries = 0
$frontendReady = $false

while (-not $frontendReady -and $retries -lt $maxRetries) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
        $frontendReady = $true
        Write-Host "✅ 프론트엔드 서버 준비 완료!" -ForegroundColor Green
    } catch {
        $retries++
        Write-Host "대기 중... ($retries/$maxRetries)" -ForegroundColor Gray
        Start-Sleep -Seconds 2
    }
}

if (-not $frontendReady) {
    Write-Host "❌ 프론트엔드 서버 시작 실패" -ForegroundColor Red
    Stop-Job $backendJob, $frontendJob
    Remove-Job $backendJob, $frontendJob
    exit 1
}

Write-Host ""
Write-Host "3. Cloudflare Tunnel 시작 중..." -ForegroundColor Yellow
Write-Host ""

# Cloudflare Tunnel 시작 (백그라운드)
$tunnelJob = Start-Job -ScriptBlock {
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
    cloudflared tunnel run freeshell
}

Write-Host "✅ Cloudflare Tunnel 시작됨" -ForegroundColor Green
Write-Host ""

Start-Sleep -Seconds 3

Write-Host "==================================================" -ForegroundColor Green
Write-Host "   모든 서비스가 실행 중입니다!" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
Write-Host ""
Write-Host "접속 주소:" -ForegroundColor Cyan
Write-Host "  - 로컬 프론트엔드: http://localhost:3000" -ForegroundColor White
Write-Host "  - 로컬 백엔드: http://localhost:3001/api" -ForegroundColor White
Write-Host "  - 공개 프론트엔드: https://freeshell.co.kr" -ForegroundColor Yellow
Write-Host "  - 공개 백엔드: https://api.freeshell.co.kr/api" -ForegroundColor Yellow
Write-Host ""
Write-Host "실행 중인 작업:" -ForegroundColor Cyan
Write-Host "  - 백엔드 서버 (Job ID: $($backendJob.Id))" -ForegroundColor Gray
Write-Host "  - 프론트엔드 서버 (Job ID: $($frontendJob.Id))" -ForegroundColor Gray
Write-Host "  - Cloudflare Tunnel (Job ID: $($tunnelJob.Id))" -ForegroundColor Gray
Write-Host ""
Write-Host "로그 확인:" -ForegroundColor Cyan
Write-Host "  Receive-Job -Id [작업 ID] -Keep" -ForegroundColor White
Write-Host ""
Write-Host "종료하려면:" -ForegroundColor Cyan
Write-Host "  Stop-Job $($backendJob.Id), $($frontendJob.Id), $($tunnelJob.Id)" -ForegroundColor White
Write-Host "  Remove-Job $($backendJob.Id), $($frontendJob.Id), $($tunnelJob.Id)" -ForegroundColor White
Write-Host ""
Write-Host "Ctrl+C를 눌러 이 스크립트를 종료할 수 있습니다." -ForegroundColor Yellow
Write-Host "모든 서비스는 백그라운드에서 계속 실행됩니다." -ForegroundColor Yellow
Write-Host ""

# 작업 상태 모니터링
try {
    while ($true) {
        Start-Sleep -Seconds 5
        
        # 작업 상태 확인
        $backendState = (Get-Job -Id $backendJob.Id).State
        $frontendState = (Get-Job -Id $frontendJob.Id).State
        $tunnelState = (Get-Job -Id $tunnelJob.Id).State
        
        if ($backendState -ne "Running" -or $frontendState -ne "Running" -or $tunnelState -ne "Running") {
            Write-Host ""
            Write-Host "⚠️ 일부 서비스가 중지되었습니다:" -ForegroundColor Yellow
            Write-Host "  백엔드: $backendState" -ForegroundColor Gray
            Write-Host "  프론트엔드: $frontendState" -ForegroundColor Gray
            Write-Host "  터널: $tunnelState" -ForegroundColor Gray
            break
        }
    }
} catch {
    Write-Host ""
    Write-Host "스크립트 종료 중..." -ForegroundColor Yellow
} finally {
    Write-Host ""
    Write-Host "서비스는 백그라운드에서 계속 실행됩니다." -ForegroundColor Green
    Write-Host "종료하려면 위의 명령어를 사용하세요." -ForegroundColor Yellow
}

