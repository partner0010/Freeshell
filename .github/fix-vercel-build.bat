@echo off
chcp 65001 >nul
echo ========================================
echo Vercel 빌드 오류 수정
echo ========================================
echo.

cd /d "%~dp0"
cd ..

echo [문제] 로컬 빌드는 성공했지만 Vercel 배포가 실패
echo [해결] package.json에 prisma generate 추가 필요
echo.

echo [1/3] package.json 확인...
if not exist "package.json" (
    echo ❌ package.json 파일을 찾을 수 없습니다!
    echo    프로젝트 루트에서 실행하세요.
    pause
    exit /b 1
)
echo ✅ package.json 확인됨
echo.

echo [2/3] package.json에 postinstall 스크립트 추가...
echo.
echo ⚠️  package.json 파일을 열고 다음을 추가하세요:
echo.
echo {
echo   "scripts": {
echo     "postinstall": "prisma generate",
echo     "build": "prisma generate && next build",
echo     ...
echo   }
echo }
echo.
echo 또는 수동으로 수정하세요.
echo.
pause

echo [3/3] 변경사항 확인...
echo.
echo package.json을 수정한 후:
echo   1. git add package.json
echo   2. git commit -m "fix: add prisma generate to build process"
echo   3. git push origin main
echo.
echo 또는 Vercel Build Settings에서:
echo   Build Command: prisma generate && npm run build
echo.
pause

