# 로컬 테스트 환경 설정 스크립트 (PowerShell)

Write-Host "🚀 로컬 테스트 환경 설정 시작..." -ForegroundColor Green

# 1. .env 파일 확인
if (-not (Test-Path .env)) {
    Write-Host "📝 .env 파일 생성 중..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "⚠️  .env 파일을 열어서 API 키를 설정해주세요!" -ForegroundColor Red
} else {
    Write-Host "✅ .env 파일이 이미 존재합니다" -ForegroundColor Green
}

# 2. 필수 디렉토리 생성
Write-Host "📁 필수 디렉토리 생성 중..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path data | Out-Null
New-Item -ItemType Directory -Force -Path uploads\images | Out-Null
New-Item -ItemType Directory -Force -Path uploads\videos | Out-Null
New-Item -ItemType Directory -Force -Path uploads\temp | Out-Null
New-Item -ItemType Directory -Force -Path logs | Out-Null

# 3. Prisma 클라이언트 생성
Write-Host "🔧 Prisma 클라이언트 생성 중..." -ForegroundColor Yellow
npx prisma generate

# 4. 데이터베이스 마이그레이션
Write-Host "🗄️  데이터베이스 마이그레이션 실행 중..." -ForegroundColor Yellow
npx prisma migrate dev --name init

Write-Host ""
Write-Host "✅ 로컬 테스트 환경 설정 완료!" -ForegroundColor Green
Write-Host ""
Write-Host "다음 단계:" -ForegroundColor Cyan
Write-Host "1. .env 파일을 열어서 API 키를 설정하세요"
Write-Host "2. npm.cmd run dev 로 서버를 시작하세요"

