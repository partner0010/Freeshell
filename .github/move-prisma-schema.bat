@echo off
chcp 65001 >nul
echo ========================================
echo Prisma Schema 표준 위치로 이동
echo ========================================
echo.

cd /d "%~dp0"
cd ..

echo [1/3] 프로젝트 루트 확인...
if not exist "package.json" (
    echo ❌ package.json을 찾을 수 없습니다!
    echo    프로젝트 루트에서 실행하세요.
    pause
    exit /b 1
)
echo ✅ 프로젝트 루트 확인됨
echo.

echo [2/3] prisma 폴더 생성...
if not exist "prisma" (
    mkdir prisma
    echo ✅ prisma 폴더 생성됨
) else (
    echo ℹ️  prisma 폴더가 이미 존재합니다
)
echo.

echo [3/3] schema.prisma 복사...
if exist ".github\prisma\schema.prisma" (
    copy ".github\prisma\schema.prisma" "prisma\schema.prisma" /Y
    echo ✅ schema.prisma 복사 완료
) else (
    echo ⚠️  .github\prisma\schema.prisma 파일을 찾을 수 없습니다
    echo    수동으로 복사하세요
)
echo.

echo ========================================
echo ✅ 완료!
echo ========================================
echo.
echo 다음 단계:
echo   1. git add prisma/schema.prisma
echo   2. git commit -m "fix: move Prisma schema to standard location"
echo   3. git push origin main
echo.
pause

