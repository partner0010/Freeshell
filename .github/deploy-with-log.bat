@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

REM ========================================
REM 배치 파일 실행 + 로그 기록
REM ========================================

set "BATCH_DIR=%~dp0"
set "PROJECT_ROOT=%BATCH_DIR%.."
set "LOG_FILE=%PROJECT_ROOT%\deploy.log"

cd /d "!PROJECT_ROOT!"

echo ========================================
echo 배치 파일 실행 (로그 기록)
echo ========================================
echo.
echo 로그 파일: !LOG_FILE!
echo.
echo 실행 중 새 창에서 다음을 실행하여 로그를 확인할 수 있습니다:
echo   PowerShell: Get-Content deploy.log -Wait -Tail 30
echo   또는: .github\view-log.bat
echo.
echo 계속하려면 아무 키나 누르세요...
pause >nul

REM 배치 파일 실행 (모든 출력을 로그 파일과 화면에 동시에 기록)
call "%BATCH_DIR%deploy.bat" 2>&1 | powershell -Command "$input | Tee-Object -FilePath '!LOG_FILE!' -Append"

echo.
echo ========================================
echo 배치 파일 실행 완료
echo ========================================
echo.
pause

