@echo off
chcp 65001 > nul
cls

echo.
echo ========================================
echo    🧹 완전히 깨끗하게 시작
echo ========================================
echo.

echo 🛑 모든 Node 프로세스 종료 중...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo 🔍 포트 확인 중...
netstat -ano | findstr :3001
if %errorlevel% equ 0 (
    echo ⚠️  포트 3001이 아직 사용 중입니다.
    echo    잠시 후 다시 시도하겠습니다...
    timeout /t 3 /nobreak >nul
)

echo.
echo ========================================
echo    🚀 백엔드 서버 시작
echo ========================================
echo.

cd backend
if errorlevel 1 (
    echo ❌ backend 폴더를 찾을 수 없습니다
    pause
    exit /b 1
)

echo 📍 디렉토리: %cd%
echo 🌐 서버 주소: http://localhost:3001
echo 📚 Swagger: http://localhost:3001/api-docs
echo.
echo ⚠️  서버를 중지하려면 Ctrl+C를 누르세요
echo.
echo ========================================
echo.

npm run dev

pause

