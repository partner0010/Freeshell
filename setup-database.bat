@echo off
echo ========================================
echo 데이터베이스 설정 스크립트
echo ========================================
echo.

echo [1/3] Prisma Client 생성 중...
call npx prisma generate
if %errorlevel% neq 0 (
    echo 오류: Prisma Client 생성 실패
    pause
    exit /b 1
)

echo.
echo [2/3] 데이터베이스 마이그레이션 실행 중...
call npx prisma migrate dev --name init
if %errorlevel% neq 0 (
    echo 오류: 마이그레이션 실패
    echo DATABASE_URL 환경 변수를 확인하세요.
    pause
    exit /b 1
)

echo.
echo [3/3] 완료!
echo.
echo 다음 명령어로 Prisma Studio를 실행할 수 있습니다:
echo   npx prisma studio
echo.
pause

