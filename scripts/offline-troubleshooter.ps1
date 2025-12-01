# 오프라인 문제 해결 스크립트
# 온라인이 안 될 때 이 스크립트를 실행하세요

Write-Host "🔧 오프라인 문제 해결 도구 시작..." -ForegroundColor Green
Write-Host ""

# 1. 시스템 진단
Write-Host "1️⃣ 시스템 진단 중..." -ForegroundColor Yellow

# Node.js 확인
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js 설치됨: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js가 설치되지 않았습니다" -ForegroundColor Red
    Write-Host "   해결: https://nodejs.org 에서 Node.js를 설치하세요" -ForegroundColor Yellow
    exit 1
}

# npm 확인
try {
    $npmVersion = npm --version
    Write-Host "✅ npm 설치됨: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm이 설치되지 않았습니다" -ForegroundColor Red
    exit 1
}

# 프로젝트 디렉토리 확인
if (-not (Test-Path "backend")) {
    Write-Host "❌ backend 디렉토리를 찾을 수 없습니다" -ForegroundColor Red
    Write-Host "   현재 디렉토리에서 실행하세요" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ 프로젝트 구조 확인됨" -ForegroundColor Green

# 2. 환경 변수 확인
Write-Host ""
Write-Host "2️⃣ 환경 변수 확인 중..." -ForegroundColor Yellow

if (-not (Test-Path "backend\.env")) {
    Write-Host "⚠️  .env 파일이 없습니다" -ForegroundColor Yellow
    if (Test-Path "backend\.env.example") {
        Write-Host "   .env.example을 복사하여 .env 파일을 생성합니다..." -ForegroundColor Yellow
        Copy-Item "backend\.env.example" "backend\.env"
        Write-Host "   ✅ .env 파일 생성 완료" -ForegroundColor Green
        Write-Host "   ⚠️  .env 파일을 열어서 API 키를 설정하세요!" -ForegroundColor Red
    } else {
        Write-Host "   ❌ .env.example 파일도 없습니다" -ForegroundColor Red
    }
} else {
    Write-Host "✅ .env 파일 존재" -ForegroundColor Green
}

# 3. 필수 디렉토리 확인 및 생성
Write-Host ""
Write-Host "3️⃣ 필수 디렉토리 확인 중..." -ForegroundColor Yellow

$requiredDirs = @(
    "backend\data",
    "backend\uploads\images",
    "backend\uploads\videos",
    "backend\uploads\temp",
    "backend\logs"
)

foreach ($dir in $requiredDirs) {
    if (-not (Test-Path $dir)) {
        Write-Host "   생성 중: $dir" -ForegroundColor Yellow
        New-Item -ItemType Directory -Force -Path $dir | Out-Null
        Write-Host "   ✅ 생성 완료" -ForegroundColor Green
    } else {
        Write-Host "   ✅ $dir 존재" -ForegroundColor Green
    }
}

# 4. 의존성 확인
Write-Host ""
Write-Host "4️⃣ 의존성 확인 중..." -ForegroundColor Yellow

if (-not (Test-Path "backend\node_modules")) {
    Write-Host "⚠️  node_modules가 없습니다" -ForegroundColor Yellow
    Write-Host "   의존성 설치를 시작합니다..." -ForegroundColor Yellow
    Set-Location backend
    npm.cmd install
    Set-Location ..
    Write-Host "   ✅ 의존성 설치 완료" -ForegroundColor Green
} else {
    Write-Host "✅ node_modules 존재" -ForegroundColor Green
}

# 5. Prisma 확인
Write-Host ""
Write-Host "5️⃣ 데이터베이스 확인 중..." -ForegroundColor Yellow

Set-Location backend

try {
    npx prisma generate
    Write-Host "✅ Prisma 클라이언트 생성 완료" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Prisma 클라이언트 생성 실패" -ForegroundColor Yellow
    Write-Host "   수동으로 실행: npx prisma generate" -ForegroundColor Yellow
}

# 데이터베이스 마이그레이션 확인
if (-not (Test-Path "data\database.db")) {
    Write-Host "⚠️  데이터베이스 파일이 없습니다" -ForegroundColor Yellow
    Write-Host "   마이그레이션을 실행합니다..." -ForegroundColor Yellow
    try {
        npx prisma migrate dev --name init
        Write-Host "   ✅ 마이그레이션 완료" -ForegroundColor Green
    } catch {
        Write-Host "   ⚠️  마이그레이션 실패" -ForegroundColor Yellow
        Write-Host "   수동으로 실행: npx prisma migrate dev" -ForegroundColor Yellow
    }
} else {
    Write-Host "✅ 데이터베이스 파일 존재" -ForegroundColor Green
}

Set-Location ..

# 6. 포트 확인
Write-Host ""
Write-Host "6️⃣ 포트 확인 중..." -ForegroundColor Yellow

$port = 3001
$portInUse = $false

try {
    $result = netstat -ano | Select-String ":$port"
    if ($result) {
        Write-Host "⚠️  포트 $port 가 사용 중입니다" -ForegroundColor Yellow
        Write-Host "   사용 중인 프로세스:" -ForegroundColor Yellow
        $result | ForEach-Object { Write-Host "   $_" -ForegroundColor Yellow }
        Write-Host "   해결: 다른 포트를 사용하거나 프로세스를 종료하세요" -ForegroundColor Yellow
        $portInUse = $true
    } else {
        Write-Host "✅ 포트 $port 사용 가능" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  포트 확인 실패" -ForegroundColor Yellow
}

# 7. 최종 요약
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "진단 완료!" -ForegroundColor Green
Write-Host ""

if ($portInUse) {
    Write-Host "⚠️  포트 문제가 있습니다. 해결 후 서버를 시작하세요" -ForegroundColor Yellow
} else {
    Write-Host "✅ 모든 기본 설정이 완료되었습니다!" -ForegroundColor Green
    Write-Host ""
    Write-Host "다음 단계:" -ForegroundColor Cyan
    Write-Host "1. backend\.env 파일을 열어서 API 키를 설정하세요" -ForegroundColor White
    Write-Host "2. backend 폴더에서 'npm.cmd run dev' 실행" -ForegroundColor White
    Write-Host "3. 프론트엔드는 프로젝트 루트에서 'npm.cmd run dev' 실행" -ForegroundColor White
}

Write-Host ""
Write-Host "문제가 계속되면:" -ForegroundColor Cyan
Write-Host "- logs 폴더의 로그 파일 확인" -ForegroundColor White
Write-Host "- http://localhost:3001/api/diagnosis 접속하여 자가 진단 실행" -ForegroundColor White

