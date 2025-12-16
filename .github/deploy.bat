@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo.
echo ========================================
echo   Vercel 배포 시작
echo ========================================
echo.

echo [1/3] Git 상태 확인...
git status --short
echo.

echo [2/3] 변경사항 커밋...
git add .
git commit -m "fix: Button 컴포넌트 motion.button을 motion.div로 변경"
if errorlevel 1 (
    echo 경고: 커밋할 변경사항이 없거나 오류가 발생했습니다.
)
echo.

echo [3/3] GitHub에 푸시...
git push origin main
if errorlevel 1 (
    echo.
    echo 오류: 푸시 실패!
    pause
    exit /b 1
)
echo.

echo ========================================
echo   완료! Vercel에서 자동 빌드가 시작됩니다.
echo ========================================
echo.
pause

