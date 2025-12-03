@echo off
chcp 65001 >nul
echo ========================================
echo 🚀 백엔드 서버 시작
echo ========================================
echo.

cd /d "%~dp0backend"

if not exist "package.json" (
    echo ❌ 오류: backend 폴더를 찾을 수 없습니다!
    pause
    exit /b 1
)

echo 현재 위치: %CD%
echo.

echo 포트 3001 확인 중...
netstat -ano | findstr ":3001" >nul
if %errorlevel% == 0 (
    echo   ⚠️  포트 3001 사용 중 - 기존 프로세스 종료 중...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3001"') do (
        taskkill /F /PID %%a >nul 2>&1
    )
    timeout /t 2 /nobreak >nul
)
echo   ✅ 포트 3001 준비됨
echo.

echo 백엔드 서버 시작 중...
echo.
echo 포트: 3001
echo API: http://localhost:3001/api
echo.
echo 중지하려면 Ctrl+C를 누르세요
echo.

npm run dev

