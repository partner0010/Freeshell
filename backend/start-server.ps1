# 백엔드 서버 시작 스크립트
# 이 스크립트는 백엔드 폴더에서 직접 실행해야 합니다

Write-Host "========================================" -ForegroundColor Green
Write-Host "🚀 백엔드 서버 시작" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# 현재 위치 확인
$currentPath = Get-Location
Write-Host "현재 위치: $currentPath" -ForegroundColor Cyan

# backend 폴더인지 확인
if (-not (Test-Path "package.json")) {
    Write-Host "❌ 오류: package.json을 찾을 수 없습니다!" -ForegroundColor Red
    Write-Host "이 스크립트는 backend 폴더에서 실행해야 합니다." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "사용법:" -ForegroundColor Cyan
    Write-Host "  cd backend" -ForegroundColor White
    Write-Host "  .\start-server.ps1" -ForegroundColor White
    exit 1
}

# 포트 3001 확인 및 정리
Write-Host "포트 3001 확인 중..." -ForegroundColor Yellow
$port3001 = netstat -ano | Select-String ":3001"
if ($port3001) {
    Write-Host "  ⚠️  포트 3001 사용 중 - 기존 프로세스 종료 중..." -ForegroundColor Yellow
    $port3001 | ForEach-Object {
        $line = $_.ToString().Trim()
        $pid = ($line -split '\s+')[-1]
        if ($pid -match '^\d+$') {
            taskkill /F /PID $pid 2>$null
        }
    }
    Start-Sleep -Seconds 2
}
Write-Host "  ✅ 포트 3001 준비됨" -ForegroundColor Green
Write-Host ""

# .env 파일 확인
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  .env 파일이 없습니다. 기본 파일을 생성합니다..." -ForegroundColor Yellow
    # autoSetup이 자동으로 생성할 것입니다
}

# Prisma 클라이언트 확인
Write-Host "Prisma 클라이언트 확인 중..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules\.prisma")) {
    Write-Host "  Prisma 클라이언트 생성 중..." -ForegroundColor Gray
    npx prisma generate 2>&1 | Out-Null
}
Write-Host "  ✅ Prisma 클라이언트 준비됨" -ForegroundColor Green
Write-Host ""

# 데이터베이스 확인
Write-Host "데이터베이스 확인 중..." -ForegroundColor Yellow
$dbPath = "prisma\data\database.db"
if (Test-Path $dbPath) {
    Write-Host "  ✅ 데이터베이스 파일 존재" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  데이터베이스 파일 없음 - 마이그레이션 필요할 수 있음" -ForegroundColor Yellow
}
Write-Host ""

# 백엔드 실행
Write-Host "========================================" -ForegroundColor Green
Write-Host "백엔드 서버 시작 중..." -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "포트: 3001" -ForegroundColor Cyan
Write-Host "API: http://localhost:3001/api" -ForegroundColor Cyan
Write-Host ""
Write-Host "중지하려면 Ctrl+C를 누르세요" -ForegroundColor Gray
Write-Host ""

# npm run dev 실행
npm run dev

