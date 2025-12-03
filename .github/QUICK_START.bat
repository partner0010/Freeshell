@echo off
chcp 65001 > nul
cls

echo.
echo ========================================
echo    🚀 Freeshell 자동 설치 시작
echo ========================================
echo.
echo 이 스크립트는 자동으로:
echo  ✅ 백엔드 의존성 설치
echo  ✅ 데이터베이스 초기화
echo  ✅ 관리자 계정 생성
echo  ✅ 프론트엔드 의존성 설치
echo.
pause

echo.
echo ========================================
echo    📦 백엔드 설치 중...
echo ========================================
echo.

cd backend
if errorlevel 1 (
    echo ❌ backend 폴더를 찾을 수 없습니다
    pause
    exit /b 1
)

call npm install
if errorlevel 1 (
    echo ❌ 백엔드 의존성 설치 실패
    pause
    exit /b 1
)

echo.
echo ========================================
echo    🔄 데이터베이스 초기화 중...
echo ========================================
echo.

call npm run reset-db
if errorlevel 1 (
    echo ❌ 데이터베이스 초기화 실패
    pause
    exit /b 1
)

echo.
echo ========================================
echo    📦 프론트엔드 설치 중...
echo ========================================
echo.

cd ..
call npm install
if errorlevel 1 (
    echo ❌ 프론트엔드 의존성 설치 실패
    pause
    exit /b 1
)

echo.
echo ========================================
echo    ✅ 설치 완료!
echo ========================================
echo.
echo 👑 관리자 계정 정보:
echo    이메일: admin@freeshell.co.kr
echo    비밀번호: Admin123!@#
echo.
echo 🚀 서버 시작 방법:
echo.
echo    [백엔드 서버]
echo    cd backend
echo    npm run dev
echo.
echo    [프론트엔드 서버] (새 터미널)
echo    npm run dev
echo.
echo 🌐 접속 주소:
echo    프론트엔드: http://localhost:5173
echo    백엔드 API: http://localhost:5000
echo    Swagger: http://localhost:5000/api-docs
echo.
echo ========================================
echo.
echo 자세한 내용은 START_HERE.md를 참고하세요.
echo.
pause

