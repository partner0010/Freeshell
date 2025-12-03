@echo off
chcp 65001 > nul
echo.
echo ========================================
echo   🚀 Freeshell 빠른 시작
echo ========================================
echo.

cd backend

echo 📦 의존성 설치 중...
call npm install
if errorlevel 1 (
    echo ❌ 의존성 설치 실패
    pause
    exit /b 1
)

echo.
echo 🔄 데이터베이스 초기화 중...
call npm run reset-db
if errorlevel 1 (
    echo ❌ 데이터베이스 초기화 실패
    pause
    exit /b 1
)

echo.
echo ========================================
echo   ✅ 설치 완료!
echo ========================================
echo.
echo 👑 관리자 계정 정보:
echo    이메일: admin@freeshell.co.kr
echo    비밀번호: Admin123!@#
echo.
echo 🚀 서버 시작 방법:
echo    cd backend
echo    npm run dev
echo.
echo ========================================
echo.
pause

