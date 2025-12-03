@echo off
chcp 65001 > nul
cls

echo.
echo ========================================
echo    🎨 프론트엔드 서버 시작
echo ========================================
echo.

echo 📍 디렉토리: %cd%
echo 🌐 주소: http://localhost:5173
echo.
echo 👑 관리자 로그인:
echo    이메일: admin@freeshell.co.kr
echo    비밀번호: Admin123!@#
echo.
echo 🚀 새로운 기능:
echo    - 홈페이지 완전 재설계
echo    - AI 스튜디오 (14개 AI 모델)
echo    - 새로운 대시보드
echo.
echo ⚠️  서버를 중지하려면 Ctrl+C를 누르세요
echo.
echo ========================================
echo.

npm run dev

pause

