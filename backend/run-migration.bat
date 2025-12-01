@echo off
chcp 65001 >nul
echo 데이터베이스 마이그레이션 시작...
echo.

cd /d "%~dp0"

set DATABASE_URL=file:./data/database.db

if not exist data (
    mkdir data
    echo ✅ data 디렉토리 생성 완료
) else (
    echo ✅ data 디렉토리 존재 확인
)

echo.
echo 📦 Prisma 클라이언트 생성 중...
call npx prisma generate
if errorlevel 1 (
    echo ❌ Prisma 클라이언트 생성 실패
    pause
    exit /b 1
)
echo ✅ Prisma 클라이언트 생성 완료

echo.
echo 🔄 데이터베이스 마이그레이션 실행 중...
call npx prisma migrate dev --name comprehensive_upgrade
if errorlevel 1 (
    echo ❌ 마이그레이션 실패
    pause
    exit /b 1
)
echo ✅ 마이그레이션 완료

echo.
echo 🎉 모든 작업이 완료되었습니다!
pause

