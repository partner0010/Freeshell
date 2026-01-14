@echo off
REM Free AI Server 실행 스크립트 (Windows)

echo 🚀 Free AI API Server 시작 중...

REM Ollama 연결 확인
echo 📡 Ollama 서버 연결 확인 중...
curl -s http://localhost:11434/api/tags >nul 2>&1
if errorlevel 1 (
    echo ❌ Ollama 서버에 연결할 수 없습니다.
    echo    Ollama를 실행하세요: ollama serve
    pause
    exit /b 1
)

echo ✅ Ollama 서버 연결 성공

REM Python 가상환경 확인
if not exist "venv" (
    echo 📦 가상환경 생성 중...
    python -m venv venv
)

REM 가상환경 활성화
call venv\Scripts\activate.bat

REM 의존성 설치
echo 📦 의존성 설치 중...
pip install -r requirements.txt

REM 서버 실행
echo 🚀 서버 시작...
python -m app.main

pause
