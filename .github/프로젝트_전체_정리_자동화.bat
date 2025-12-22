@echo off
chcp 65001 >nul
echo ========================================
echo 프로젝트 전체 정리 자동화 스크립트
echo ========================================
echo.

set "PROJECT_ROOT=%~dp0.."
cd /d "%PROJECT_ROOT%"

echo 현재 디렉토리: %CD%
echo.

echo [1/8] 중복 설정 파일 확인...
echo.

REM 프로젝트 루트에 필수 파일 확인
if exist "package.json" (
    echo ✓ package.json (프로젝트 루트)
) else (
    echo ✗ package.json 없음 - .github에서 복사 필요
    if exist ".github\package.json" (
        copy ".github\package.json" "package.json" >nul
        echo   → .github에서 복사 완료
    )
)

if exist "netlify.toml" (
    echo ✓ netlify.toml (프로젝트 루트)
) else (
    echo ✗ netlify.toml 없음 - .github에서 복사 필요
    if exist ".github\netlify.toml" (
        copy ".github\netlify.toml" "netlify.toml" >nul
        echo   → .github에서 복사 완료
    )
)

if exist "prisma\schema.prisma" (
    echo ✓ prisma\schema.prisma (프로젝트 루트)
) else (
    echo ✗ prisma\schema.prisma 없음 - .github에서 복사 필요
    if not exist "prisma" mkdir prisma
    if exist ".github\prisma\schema.prisma" (
        copy ".github\prisma\schema.prisma" "prisma\schema.prisma" >nul
        echo   → .github에서 복사 완료
    )
)

echo.
echo [2/8] 중복 가이드 파일 통합...
echo.

REM 중복된 Netlify 가이드 파일 통합
echo Netlify 관련 가이드 파일이 많습니다. backup 폴더로 이동 권장.

echo.
echo [3/8] 불필요한 임시 파일 삭제...
echo.

REM .DS_Store, Thumbs.db 등 삭제
for /r %%f in (.DS_Store Thumbs.db desktop.ini ~$*) do (
    if exist "%%f" (
        del /f /q "%%f" 2>nul
        if exist "%%f" (
            echo 삭제 실패: %%f
        ) else (
            echo 삭제: %%f
        )
    )
)

echo.
echo [4/8] 빈 폴더 확인...
echo.

REM 빈 폴더는 유지 (Git이 필요할 수 있음)

echo.
echo [5/8] Git 상태 확인...
echo.

git status --short 2>nul
if errorlevel 1 (
    echo Git 저장소가 아닙니다
) else (
    echo Git 저장소 확인됨
)

echo.
echo [6/8] 필수 파일 확인...
echo.

echo 필수 파일 목록:
if exist "package.json" echo   ✓ package.json
if exist "netlify.toml" echo   ✓ netlify.toml
if exist "prisma\schema.prisma" echo   ✓ prisma\schema.prisma
if exist "next.config.js" echo   ✓ next.config.js
if exist "tsconfig.json" echo   ✓ tsconfig.json
if exist "tailwind.config.js" echo   ✓ tailwind.config.js
if exist "postcss.config.js" echo   ✓ postcss.config.js
if exist ".gitignore" echo   ✓ .gitignore

echo.
echo [7/8] .github 폴더 정리...
echo.

REM .github 폴더의 중복 파일은 backup 폴더에 있으므로 유지
echo .github\backup 폴더: 백업 파일 보관 (유지)
echo .github 폴더의 가이드 파일: 필요시 통합 가능

echo.
echo [8/8] 정리 완료!
echo.
echo 다음 단계:
echo 1. Git에 변경사항 커밋
echo 2. Netlify 재배포 확인
echo.
echo 정리 요약:
echo - 중복 설정 파일 확인 완료
echo - 임시 파일 삭제 완료
echo - 필수 파일 확인 완료
echo.
pause

