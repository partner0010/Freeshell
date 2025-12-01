# 데이터베이스 마이그레이션 스크립트

Write-Host "데이터베이스 마이그레이션 시작..." -ForegroundColor Green

# 환경 변수 설정
$env:DATABASE_URL = "file:./data/database.db"

# data 디렉토리 생성
if (-not (Test-Path "data")) {
    New-Item -ItemType Directory -Path "data" -Force | Out-Null
    Write-Host "✅ data 디렉토리 생성 완료" -ForegroundColor Green
}

# Prisma 클라이언트 생성
Write-Host "`n📦 Prisma 클라이언트 생성 중..." -ForegroundColor Yellow
npx prisma generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Prisma 클라이언트 생성 실패" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Prisma 클라이언트 생성 완료" -ForegroundColor Green

# 마이그레이션 실행
Write-Host "`n🔄 데이터베이스 마이그레이션 실행 중..." -ForegroundColor Yellow
npx prisma migrate dev --name comprehensive_upgrade
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 마이그레이션 실패" -ForegroundColor Red
    exit 1
}
Write-Host "✅ 마이그레이션 완료" -ForegroundColor Green

Write-Host "`n🎉 모든 작업이 완료되었습니다!" -ForegroundColor Green

