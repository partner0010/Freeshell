@echo off
chcp 65001 >nul
cd /d "%~dp0\.."

echo ========================================
echo Git 상태 정리 및 푸시
echo ========================================
echo.

echo [1/7] Git merge 중단 정리 (필요시)...
git merge --abort 2>nul || echo merge 없음

echo.
echo [2/7] 현재 브랜치 확인...
git branch

echo.
echo [3/7] main 브랜치로 전환...
git checkout main 2>nul || git checkout -b main

echo.
echo [4/7] 원격 변경사항 가져오기...
git pull origin main --no-edit 2>nul || echo pull 실패 또는 이미 최신

echo.
echo [5/7] 삭제된 파일들을 Git에 추가...
git add -A
git status

echo.
echo [6/7] 변경사항 커밋...
git commit -m "chore: 불필요한 문서 파일 삭제 및 vercel.json 수정" || echo 변경사항 없음 또는 이미 커밋됨

echo.
echo [7/7] GitHub에 푸시...
git push origin main

echo.
echo ========================================
echo 완료!
echo ========================================
pause

