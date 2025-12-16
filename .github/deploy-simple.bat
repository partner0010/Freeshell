@echo off
chcp 65001 >nul
echo 빌드 오류 수정사항 배포 시작...
echo.

cd /d "%~dp0"

git add .
echo.

git commit -m "fix: Button 컴포넌트 motion.button을 motion.div로 감싸서 타입 충돌 해결"
echo.

git push origin main
echo.

echo 완료! Vercel에서 자동으로 빌드가 시작됩니다.
pause
