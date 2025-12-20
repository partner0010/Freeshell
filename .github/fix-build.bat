@echo off
chcp 65001 >nul
echo ========================================
echo 빌드 오류 통합 수정
echo ========================================
echo.

cd /d "%~dp0"
cd ..

echo [1/5] package.json 확인...
if not exist "package.json" (
    echo ❌ package.json 파일을 찾을 수 없습니다.
    pause
    exit /b 1
)
echo ✅ package.json 확인됨
echo.

echo [2/5] 필수 의존성 확인...
set MISSING=0

findstr /C:"bcryptjs" "package.json" >nul
if errorlevel 1 (
    echo ❌ bcryptjs가 없습니다. 설치 중...
    call npm install bcryptjs @types/bcryptjs
    set MISSING=1
) else (
    echo ✅ bcryptjs 확인됨
)

findstr /C:"next-auth" "package.json" >nul
if errorlevel 1 (
    echo ❌ next-auth가 없습니다. 설치 중...
    call npm install next-auth@4
    set MISSING=1
) else (
    echo ✅ next-auth 확인됨
)

if %MISSING%==1 (
    echo.
    echo ⚠️  package.json을 커밋해야 합니다:
    echo    git add package.json package-lock.json
    echo    git commit -m "fix: add missing dependencies"
    echo    git push origin main
    echo.
)
echo.

echo [3/5] next.config.js 확인...
if exist "next.config.js" (
    findstr /C:"ignoreDuringBuilds" "next.config.js" >nul
    if errorlevel 1 (
        echo ⚠️  ignoreDuringBuilds가 없습니다.
        echo    next.config.js를 수정해야 합니다.
    ) else (
        echo ✅ ignoreDuringBuilds 설정 확인됨
    )
) else (
    echo ❌ next.config.js를 찾을 수 없습니다.
)
echo.

echo [4/5] 의존성 재설치...
call npm install
if errorlevel 1 (
    echo ❌ 의존성 설치 실패
    pause
    exit /b 1
)
echo ✅ 의존성 설치 완료
echo.

echo [5/5] 빌드 테스트...
call npm run build
if errorlevel 1 (
    echo.
    echo ❌ 빌드 실패!
    echo.
    echo BUILD_ERRORS.md 파일을 참고하세요.
    echo.
    pause
    exit /b 1
) else (
    echo.
    echo ✅ 빌드 성공!
    echo.
    echo 이제 배포할 수 있습니다.
    echo.
)
echo.

echo ========================================
echo 완료!
echo ========================================
echo.
pause

