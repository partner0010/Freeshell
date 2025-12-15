@echo off
chcp 65001 >nul
cd /d "%~dp0\.."

echo ========================================
echo 최종 수정 및 재배포
echo ========================================
echo.

echo [1/5] package.json 확인...
cd /d "%~dp0\.."
if not exist "package.json" (
    echo 오류: package.json 파일이 없습니다!
    pause
    exit /b 1
)
findstr "@dnd-kit" package.json >nul
if errorlevel 1 (
    echo 오류: @dnd-kit 패키지가 package.json에 없습니다!
    pause
    exit /b 1
)
echo package.json에 @dnd-kit 패키지가 확인되었습니다.

echo.
echo [2/5] Git 상태 확인...
git status

echo.
echo [3/5] 모든 변경사항 추가...
git add -A

echo.
echo [4/5] 변경사항 커밋...
git commit -m "fix: package.json @dnd-kit 패키지 확인"

echo.
echo [5/5] GitHub에 푸시...
git push origin main

echo.
echo ========================================
echo 완료!
echo Vercel이 자동으로 재배포를 시작합니다.
echo ========================================
pause
