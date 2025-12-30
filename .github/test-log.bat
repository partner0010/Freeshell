@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

REM 간단한 로그 테스트 스크립트

set "LOG_FILE=test.log"

echo 테스트 시작 > "!LOG_FILE!"
echo 시간: %DATE% %TIME% >> "!LOG_FILE!"
echo. >> "!LOG_FILE!"

echo [1/4] 테스트 1
echo [1/4] 테스트 1 >> "!LOG_FILE!"

echo [2/4] 테스트 2
echo [2/4] 테스트 2 >> "!LOG_FILE!"

echo [3/4] 테스트 3
echo [3/4] 테스트 3 >> "!LOG_FILE!"

echo [4/4] 테스트 4
echo [4/4] 테스트 4 >> "!LOG_FILE!"

echo.
echo 로그 파일 생성 완료: !LOG_FILE!
echo.
pause

