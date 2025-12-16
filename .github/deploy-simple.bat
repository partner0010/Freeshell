@echo off
chcp 65001 >nul
cd /d "%~dp0"
git add .
git commit -m "fix: Button 컴포넌트 motion.button 타입 충돌 해결"
git push origin main
pause
