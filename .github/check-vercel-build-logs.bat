@echo off
chcp 65001 >nul
echo ========================================
echo Vercel 빌드 로그 확인 가이드
echo ========================================
echo.

echo Vercel 빌드 로그를 확인하여 정확한 오류를 파악해야 합니다.
echo.

echo [단계별 가이드]
echo.
echo 1. Vercel 대시보드 접속
echo    https://vercel.com/dashboard
echo.
echo 2. Freeshell 프로젝트 클릭
echo.
echo 3. Deployments 탭 클릭
echo.
echo 4. 최신 Error 배포 클릭 (가장 위에 있는 빨간색 Error 배포)
echo.
echo 5. Build Logs 탭 클릭
echo.
echo 6. 오류 메시지 전체 복사
echo.
echo 7. 오류 메시지를 공유하면 정확한 해결책을 제시할 수 있습니다.
echo.

echo ========================================
echo 일반적인 해결 방법
echo ========================================
echo.

echo [방법 1] package.json에 postinstall 추가
echo.
echo package.json의 scripts 섹션에 추가:
echo   "postinstall": "prisma generate",
echo   "build": "prisma generate && next build"
echo.

echo [방법 2] Vercel Build Command 수정
echo.
echo Vercel Settings → Build & Development Settings
echo Build Command를 다음으로 변경:
echo   prisma generate && npm run build
echo.

echo ========================================
echo Vercel 대시보드 열기
echo ========================================
echo.

timeout /t 2 >nul
start https://vercel.com/dashboard

pause

