@echo off
chcp 65001 >nul
echo ========================================
echo 프로젝트 전체 폴더 정리
echo ========================================
echo.

cd /d "%~dp0"
cd ..

echo [1/6] .github 폴더 정리...
cd .github

REM 중복 문서 파일 삭제
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

REM 중복 배치 파일 삭제
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
if exist "quick-fix.bat" del "quick-fix.bat"
if exist "test-build.bat" del "test-build.bat"
if exist "upgrade-content-2025.bat" del "upgrade-content-2025.bat"

cd ..
echo ✅ .github 폴더 정리 완료
echo.

echo [2/6] public 폴더 정리...
if exist "public\next.config.optimized.js" (
    echo ⚠️  public/next.config.optimized.js 발견
    echo    이 파일은 루트에 있어야 합니다. 삭제합니다.
    del "public\next.config.optimized.js"
)
echo ✅ public 폴더 정리 완료
echo.

echo [3/6] 루트 폴더 정리...
if exist "FIX_BUILD_ERRORS.md" del "FIX_BUILD_ERRORS.md"
if exist "UPGRADE_SUMMARY_2025.md" del "UPGRADE_SUMMARY_2025.md"
if exist "CONTENT_CREATION_2025.md" del "CONTENT_CREATION_2025.md"
echo ✅ 루트 폴더 정리 완료
echo.

echo [4/6] src/lib 중복 폴더 확인...
echo.
echo 확인된 중복 가능성:
echo   - lib/scheduling vs lib/scheduler (중복 가능)
echo   - lib/documentation vs lib/docs (중복 가능)
echo.
echo 수동으로 확인이 필요합니다.
echo.

echo [5/6] 빌드 아티팩트 확인...
if exist ".next" (
    echo ⚠️  .next 폴더 발견 (빌드 아티팩트)
    echo    .gitignore에 추가되어 있으면 문제없습니다.
)
if exist "node_modules" (
    echo ⚠️  node_modules 폴더 발견
    echo    .gitignore에 추가되어 있으면 문제없습니다.
)
echo ✅ 빌드 아티팩트 확인 완료
echo.

echo [6/6] 정리 요약...
echo.
echo 정리된 항목:
echo   - .github 폴더: 중복 파일 삭제
echo   - public 폴더: 불필요한 파일 삭제
echo   - 루트 폴더: 중복 문서 삭제
echo.
echo 남은 주요 파일:
echo   - .github/README.md (메인 가이드)
echo   - .github/BUILD_ERRORS.md (빌드 오류 통합)
echo   - .github/fix-build.bat (빌드 수정)
echo   - .github/deploy.bat (배포)
echo.

echo ========================================
echo 정리 완료!
echo ========================================
echo.
pause

