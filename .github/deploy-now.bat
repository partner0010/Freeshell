@echo off
chcp 65001 >nul
echo ========================================
echo 재배포 실행
echo ========================================
echo.

cd /d "%~dp0"
cd ..

echo [1/3] Git 경로 설정...
set REPO_PATH=C:/Users/partn/OneDrive/바탕 화면/Cursor/Freeshell
git config --global --add safe.directory "%REPO_PATH%"
if errorlevel 1 (
    echo ⚠️  Git 경로 설정 실패
    echo    수동으로 설정하세요:
    echo    git config --global --add safe.directory "%REPO_PATH%"
) else (
    echo ✅ Git 경로 설정 완료
)
echo.

echo [2/3] 변경사항 커밋...
git add .
git commit -m "fix: resolve all TypeScript and Prisma schema errors"
if errorlevel 1 (
    echo ⚠️  커밋 실패 (변경사항이 없을 수 있음)
    echo    빈 커밋으로 재배포를 트리거합니다...
    git commit --allow-empty -m "chore: trigger redeploy"
)
echo ✅ 커밋 완료
echo.

echo [3/3] GitHub에 푸시...
git push origin main
if errorlevel 1 (
    echo.
    echo ========================================
    echo ❌ Git 푸시 실패
    echo ========================================
    echo.
    echo 수동으로 푸시하거나 Vercel에서 직접 재배포하세요:
    echo.
    echo 방법 1: 수동 푸시
    echo   git push origin main
    echo.
    echo 방법 2: Vercel 대시보드에서 직접 재배포
    echo   1. https://vercel.com/dashboard 접속
    echo   2. Freeshell 프로젝트 클릭
    echo   3. Deployments 탭
    echo   4. 최신 배포의 "..." → "Redeploy"
    echo.
    pause
    exit /b 1
)
echo.

echo ========================================
echo ✅ 재배포 트리거 완료!
echo ========================================
echo.
echo Vercel에서 자동으로 배포가 시작됩니다.
echo.
echo 배포 상태 확인:
echo https://vercel.com/dashboard
echo.
timeout /t 2 >nul
start https://vercel.com/dashboard
pause

