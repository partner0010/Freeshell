@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ========================================
echo JSX 타입 import 추가 배포
echo ========================================
echo.

echo [1/4] Git 상태 확인...
git status

echo.
echo [2/4] 모든 변경사항 추가...
git add -A

echo.
echo [3/4] 변경사항 커밋...
git commit -m "fix: JSX 타입 import 추가로 컴파일러 오류 수정"

echo.
echo [4/4] GitHub에 푸시...
git push origin main

echo.
echo ========================================
echo 완료!
echo ========================================
pause

