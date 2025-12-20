@echo off
chcp 65001 >nul
echo ========================================
echo .github 폴더 정리
echo ========================================
echo.

cd /d "%~dp0"

echo [1/3] 중복 문서 파일 삭제...
echo.

REM 중복된 FIX 문서들 삭제 (통합본 BUILD_ERRORS.md로 대체)
if exist "FIX_BUILD_ERRORS.md" del "FIX_BUILD_ERRORS.md"
if exist "FIX_BCRYPTJS_ERROR.md" del "FIX_BCRYPTJS_ERROR.md"
if exist "FIX_ESLINT_ERRORS.md" del "FIX_ESLINT_ERRORS.md"
if exist "FIX_403_ERROR.md" del "FIX_403_ERROR.md"
if exist "FIX_ACCESS_ERRORS.md" del "FIX_ACCESS_ERRORS.md"
if exist "URGENT_BUILD_FIX.md" del "URGENT_BUILD_FIX.md"
if exist "QUICK_FIX_BUILD.md" del "QUICK_FIX_BUILD.md"
if exist "CHECK_BUILD_ERRORS.md" del "CHECK_BUILD_ERRORS.md"
if exist "CHECK_VERCEL_BUILD_LOG.md" del "CHECK_VERCEL_BUILD_LOG.md"
if exist "READY_STALE_FIX.md" del "READY_STALE_FIX.md"

echo ✅ 중복 문서 파일 삭제 완료
echo.

echo [2/3] 중복 배치 파일 정리...
echo.

REM 중복된 check 스크립트들 삭제 (통합본으로 대체)
if exist "check-commit-deployment.bat" del "check-commit-deployment.bat"
if exist "check-deploy-status.bat" del "check-deploy-status.bat"
if exist "check-deployment-status.bat" del "check-deployment-status.bat"
if exist "check-domain-access.bat" del "check-domain-access.bat"
if exist "check-external-access.bat" del "check-external-access.bat"
if exist "check-site-access.bat" del "check-site-access.bat"
if exist "check-vercel-build.bat" del "check-vercel-build.bat"
if exist "check-vercel-status.bat" del "check-vercel-status.bat"
if exist "check-local-build.bat" del "check-local-build.bat"
if exist "test-vercel-urls.bat" del "test-vercel-urls.bat"
if exist "get-vercel-url.bat" del "get-vercel-url.bat"
if exist "final-fix-eslint.bat" del "final-fix-eslint.bat"
if exist "fix-eslint-errors.bat" del "fix-eslint-errors.bat"
if exist "fix-bcryptjs-and-deploy.bat" del "fix-bcryptjs-and-deploy.bat"
if exist "quick-fix-bcryptjs.bat" del "quick-fix-bcryptjs.bat"
if exist "fix-build-errors.bat" del "fix-build-errors.bat"
if exist "deploy-content-upgrade.bat" del "deploy-content-upgrade.bat"
if exist "deploy-to-server.bat" del "deploy-to-server.bat"
if exist "trigger-fresh-deploy.bat" del "trigger-fresh-deploy.bat"

echo ✅ 중복 배치 파일 정리 완료
echo.

echo [3/3] 중복 가이드 문서 정리...
echo.

REM 중복된 가이드 문서들 삭제 (통합본으로 대체)
if exist "DNS_CHECK.md" del "DNS_CHECK.md"
if exist "DNS_FIX_GUIDE.md" del "DNS_FIX_GUIDE.md"
if exist "EXTERNAL_ACCESS_FIX.md" del "EXTERNAL_ACCESS_FIX.md"
if exist "URGENT_FIX.md" del "URGENT_FIX.md"
if exist "TROUBLESHOOTING.md" del "TROUBLESHOOTING.md"
if exist "SITE_ACCESS_TROUBLESHOOTING.md" del "SITE_ACCESS_TROUBLESHOOTING.md"
if exist "DIAGNOSTIC.md" del "DIAGNOSTIC.md"
if exist "CHECK_STATUS.md" del "CHECK_STATUS.md"
if exist "FIXES_SUMMARY.md" del "FIXES_SUMMARY.md"
if exist "IMPLEMENTATION_SUMMARY.md" del "IMPLEMENTATION_SUMMARY.md"

echo ✅ 중복 가이드 문서 정리 완료
echo.

echo ========================================
echo 정리 완료!
echo ========================================
echo.
echo 남은 주요 파일들:
echo   - README.md (메인 가이드)
echo   - BUILD_ERRORS.md (빌드 오류 통합 가이드)
echo   - DOMAIN_ACCESS_GUIDE.md (도메인 접속 가이드)
echo   - fix-build.bat (빌드 오류 수정)
echo   - deploy.bat (배포)
echo   - preview-local.bat (로컬 프리뷰)
echo.
pause

