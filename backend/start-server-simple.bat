@echo off
chcp 65001 > nul
echo.
echo ========================================
echo   🚀 백엔드 서버 시작
echo ========================================
echo.

cd backend

echo 📍 현재 디렉토리: %cd%
echo.

echo 🔍 Node.js 버전 확인...
node --version

echo.
echo 🚀 서버 시작 중...
echo    URL: http://localhost:5000
echo    Swagger: http://localhost:5000/api-docs
echo.
echo ⚠️  서버를 중지하려면 Ctrl+C를 누르세요
echo.
echo ========================================
echo.

call npm run dev

