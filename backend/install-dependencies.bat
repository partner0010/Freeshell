@echo off
chcp 65001 > nul
echo.
echo ========================================
echo    📦 추가 의존성 설치
echo ========================================
echo.

echo 🔍 Sharp (이미지 처리) 설치 중...
call npm install sharp --save

echo 🔍 Form-data 설치 중...
call npm install form-data --save

echo.
echo ========================================
echo    ✅ 설치 완료!
echo ========================================
echo.
pause

