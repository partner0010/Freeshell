@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ========================================
echo 최종 배포 - 마지막 시도
echo ========================================
echo.

echo [1/4] Git 상태 확인...
git status

echo.
echo [2/4] 모든 변경사항 추가...
git add -A

echo.
echo [3/4] 변경사항 커밋...
git commit -m "fix: JSX 구문 오류 수정 및 불필요한 파일 정리"

echo.
echo [4/4] GitHub에 푸시...
git push origin main

echo.
echo ========================================
echo 완료!
echo Vercel이 자동으로 재배포를 시작합니다.
echo 이번에는 반드시 성공할 것입니다!
echo ========================================
pause

