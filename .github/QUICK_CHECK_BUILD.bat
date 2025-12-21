@echo off
chcp 65001 >nul
echo ========================================
echo Vercel 빌드 로그 확인 가이드
echo ========================================
echo.

echo [현재 상황]
echo ✅ Prisma schema가 프로젝트 루트로 이동됨
echo ✅ GitHub에 커밋 및 푸시 완료
echo ❌ Vercel 배포가 여전히 Error 상태
echo.

echo [다음 단계]
echo.
echo 1. Vercel 대시보드 접속:
echo    https://vercel.com/dashboard
echo.
echo 2. Freeshell 프로젝트 클릭
echo.
echo 3. Deployments 탭 클릭
echo.
echo 4. 최신 Error 배포 선택 (가장 위에 있는 것)
echo.
echo 5. "Build Logs" 탭 클릭
echo.
echo 6. 오류 메시지 확인 및 복사
echo.
echo ========================================
echo.
echo Vercel 대시보드를 열까요?
echo.
pause

start https://vercel.com/dashboard

