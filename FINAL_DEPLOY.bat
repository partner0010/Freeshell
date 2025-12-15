@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ========================================
echo 최종 배포
echo ========================================
echo.

echo [1/4] Git 상태 확인...
git status

echo.
echo [2/4] 모든 변경사항 추가...
git add -A

echo.
echo [3/4] 변경사항 커밋...
git commit -m "fix: tsconfig 및 next.config 설정 개선 (중복 제거)"

echo.
echo [4/4] GitHub에 푸시...
git push origin main

echo.
echo ========================================
echo 완료!
echo ========================================
pause

