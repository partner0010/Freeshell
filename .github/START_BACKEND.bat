@echo off
chcp 65001 > nul
cls

echo.
echo ========================================
echo    🚀 Freeshell 백엔드 서버 시작
echo ========================================
echo.

cd backend
if errorlevel 1 (
    echo ❌ backend 폴더를 찾을 수 없습니다
    pause
    exit /b 1
)

echo 🔍 환경 확인 중...
echo.

if not exist "node_modules" (
    echo ⚠️  node_modules가 없습니다. 설치 중...
    call npm install
    if errorlevel 1 (
        echo ❌ 의존성 설치 실패
        pause
        exit /b 1
    )
)

if not exist "prisma\data\database.db" (
    echo ⚠️  데이터베이스가 없습니다. 초기화 중...
    call npm run reset-db
    if errorlevel 1 (
        echo ❌ 데이터베이스 초기화 실패
        pause
        exit /b 1
    )
)

echo.
echo ========================================
echo    ✅ 백엔드 서버 실행 중
echo ========================================
echo.
echo 🌐 서버 주소:
echo    API: http://localhost:5000
echo    Swagger: http://localhost:5000/api-docs
echo    Health: http://localhost:5000/api/health
echo.
echo ⚠️  서버를 중지하려면 Ctrl+C를 누르세요
echo.
echo ========================================
echo.

call npm run dev

