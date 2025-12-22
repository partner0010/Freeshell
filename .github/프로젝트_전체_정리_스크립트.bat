@echo off
chcp 65001 >nul
echo ========================================
echo 프로젝트 전체 정리 스크립트
echo ========================================
echo.

set "PROJECT_ROOT=%~dp0.."
cd /d "%PROJECT_ROOT%"

echo 현재 디렉토리: %CD%
echo.

echo [1/10] 중복 파일 확인 및 정리...
echo.

echo [2/10] .github 폴더 정리...
REM .github 폴더에서 불필요한 파일 정리
if exist ".github\backup" (
    echo backup 폴더 발견 - 유지
)

REM 중복된 가이드 파일 통합
echo 중복 가이드 파일 확인 중...

echo.
echo [3/10] node_modules 확인...
if exist "node_modules" (
    echo node_modules 폴더 존재 - 유지
) else (
    echo node_modules 폴더 없음
)

echo.
echo [4/10] .next 빌드 폴더 확인...
if exist ".next" (
    echo .next 빌드 폴더 존재 - 유지
) else (
    echo .next 빌드 폴더 없음
)

echo.
echo [5/10] 중복 설정 파일 확인...
REM package.json 위치 확인
if exist "package.json" (
    echo ✓ package.json (프로젝트 루트)
) else (
    echo ✗ package.json 없음
)

if exist ".github\package.json" (
    echo ⚠ .github\package.json (중복 가능)
)

REM netlify.toml 위치 확인
if exist "netlify.toml" (
    echo ✓ netlify.toml (프로젝트 루트)
) else (
    echo ✗ netlify.toml 없음
)

if exist ".github\netlify.toml" (
    echo ⚠ .github\netlify.toml (중복 가능)
)

REM prisma/schema.prisma 위치 확인
if exist "prisma\schema.prisma" (
    echo ✓ prisma\schema.prisma (프로젝트 루트)
) else (
    echo ✗ prisma\schema.prisma 없음
)

if exist ".github\prisma\schema.prisma" (
    echo ⚠ .github\prisma\schema.prisma (중복 가능)
)

echo.
echo [6/10] 불필요한 임시 파일 삭제...
REM .DS_Store, Thumbs.db 등 삭제
for /r %%f in (.DS_Store Thumbs.db desktop.ini) do (
    if exist "%%f" (
        del /f /q "%%f" 2>nul
        echo 삭제: %%f
    )
)

echo.
echo [7/10] 빈 폴더 확인...
for /f "delims=" %%d in ('dir /s /b /ad ^| sort /r') do (
    rd "%%d" 2>nul
    if exist "%%d" (
        echo 빈 폴더 유지: %%d
    )
)

echo.
echo [8/10] Git 상태 확인...
git status --short 2>nul
if errorlevel 1 (
    echo Git 저장소가 아닙니다
) else (
    echo Git 저장소 확인됨
)

echo.
echo [9/10] 필수 파일 확인...
echo 필수 파일 목록:
if exist "package.json" echo   ✓ package.json
if exist "netlify.toml" echo   ✓ netlify.toml
if exist "prisma\schema.prisma" echo   ✓ prisma\schema.prisma
if exist "next.config.js" echo   ✓ next.config.js
if exist "tsconfig.json" echo   ✓ tsconfig.json
if exist "tailwind.config.js" echo   ✓ tailwind.config.js
if exist "postcss.config.js" echo   ✓ postcss.config.js

echo.
echo [10/10] 정리 완료!
echo.
echo 다음 단계:
echo 1. 중복 파일 확인 및 삭제
echo 2. 불필요한 가이드 파일 통합
echo 3. Git에 커밋
echo.
pause

