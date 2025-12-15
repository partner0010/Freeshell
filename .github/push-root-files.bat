@echo off
chcp 65001 >nul
cd /d "%~dp0\.."

echo ========================================
echo 프로젝트 루트 파일 푸시
echo ========================================
echo.

echo [1/4] Git 상태 확인...
git status

echo.
echo [2/4] 모든 변경사항 추가...
git add -A

echo.
echo [3/4] 변경사항 커밋...
git commit -m "fix: 프로젝트 루트에 package.json 및 설정 파일 추가"

echo.
echo [4/4] GitHub에 푸시...
git push origin main

echo.
echo ========================================
echo 완료!
echo Vercel이 자동으로 재배포를 시작합니다.
echo ========================================
pause

