@echo off
REM 숏폼 생성 서버 시작 스크립트 (Windows)

echo Starting Shortform Generation Server...

REM 환경 변수 확인
if not exist .env (
    echo Warning: .env file not found. Creating from env.example.txt...
    copy env.example.txt .env
    echo Please edit .env file with your settings
)

REM Python 가상 환경 확인
if not exist venv (
    echo Creating Python virtual environment...
    python -m venv venv
)

REM 가상 환경 활성화
call venv\Scripts\activate.bat

REM 의존성 설치
echo Installing dependencies...
pip install -r requirements.txt

REM 에셋 설정 (선택사항)
echo Setting up default assets...
python scripts\setup_assets.py

REM 서버 시작
echo Starting server...
python api\server.py
