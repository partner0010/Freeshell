@echo off
chcp 65001 >nul
echo ========================================
echo 사이트 재배포
echo ========================================
echo.

cd /d "%~dp0"
cd ..

echo [1/4] Git 상태 확인...
git status --short
echo.

echo [2/4] 변경사항 추가...
git add .
if errorlevel 1 (
    echo 오류: Git add 실패
    pause
    exit /b 1
)
echo ✅ 변경사항 추가 완료
echo.

echo [3/4] 커밋 생성...
set /p COMMIT_MSG="커밋 메시지를 입력하세요 (기본: redeploy): "
if "%COMMIT_MSG%"=="" set COMMIT_MSG=redeploy

git commit -m "%COMMIT_MSG%"
if errorlevel 1 (
    echo 경고: 커밋 실패 (변경사항이 없을 수 있음)
    echo 빈 커밋으로 재배포를 트리거합니다...
    git commit --allow-empty -m "chore: trigger redeploy"
)
echo ✅ 커밋 완료
echo.

echo [4/4] GitHub에 푸시...
git push origin main
if errorlevel 1 (
    echo 오류: git push 실패
    echo.
    echo 수동으로 푸시하세요:
    echo   git push origin main
    pause
    exit /b 1
)
echo.

echo ========================================
echo 재배포 트리거 완료!
echo ========================================
echo.
echo Vercel에서 자동으로 배포가 시작됩니다.
echo.
echo 배포 상태 확인:
echo https://vercel.com/dashboard
echo.
echo 배포 완료까지 약 1-2분 소요됩니다.
echo.
pause

