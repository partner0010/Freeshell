@echo off
chcp 65001 > nul
cls

echo.
echo ========================================
echo    🎨 Freeshell 프론트엔드 시작
echo ========================================
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

echo.
echo ========================================
echo    ✅ 프론트엔드 실행 중
echo ========================================
echo.
echo 🌐 접속 주소:
echo    http://localhost:5173
echo.
echo 👑 관리자 로그인:
echo    이메일: admin@freeshell.co.kr
echo    비밀번호: Admin123!@#
echo.
echo ⚠️  서버를 중지하려면 Ctrl+C를 누르세요
echo.
echo ========================================
echo.

call npm run dev

