@echo off
chcp 65001 >nul
cd /d "%~dp0\.."

echo ========================================
echo 불필요한 파일 정리 및 재배포
echo ========================================
echo.

echo [1/5] Git 상태 확인...
git status

echo.
echo [2/5] 모든 변경사항 추가 (삭제된 파일 포함)...
git add -A

echo.
echo [3/5] 변경사항 커밋...
git commit -m "chore: 불필요한 문서 파일 삭제 및 @dnd-kit 의존성 추가"

echo.
echo [4/5] GitHub에 푸시...
git push origin main

echo.
echo [5/5] 완료!
echo Vercel이 자동으로 재배포를 시작합니다.
echo.
echo ========================================
pause

