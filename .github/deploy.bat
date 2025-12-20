@echo off
chcp 65001 >nul
echo ========================================
echo 배포
echo ========================================
echo.

cd /d "%~dp0"
cd ..

echo [1/3] 빌드 테스트...
call npm run build
if errorlevel 1 (
    echo ❌ 빌드 실패!
    echo.
    echo fix-build.bat를 먼저 실행하세요.
    pause
    exit /b 1
)
echo ✅ 빌드 성공
echo.

echo [2/3] Git 상태 확인...
git status --short
echo.

echo [3/3] 커밋 및 푸시...
set /p COMMIT_MSG="커밋 메시지를 입력하세요 (기본: deploy): "
if "%COMMIT_MSG%"=="" set COMMIT_MSG=deploy

git add .
git commit -m "%COMMIT_MSG%"
git push origin main

if errorlevel 1 (
    echo ❌ 푸시 실패
    pause
    exit /b 1
)

echo.
echo ✅ 배포 완료!
echo.
echo Vercel에서 자동으로 배포가 시작됩니다.
echo.
pause
