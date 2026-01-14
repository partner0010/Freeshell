#!/bin/bash

# 숏폼 생성 서버 시작 스크립트

echo "Starting Shortform Generation Server..."

# 환경 변수 확인
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from env.example.txt..."
    cp env.example.txt .env
    echo "✅ Please edit .env file with your settings"
fi

# Python 가상 환경 확인
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# 가상 환경 활성화
source venv/bin/activate

# 의존성 설치
echo "Installing dependencies..."
pip install -r requirements.txt

# 에셋 설정 (선택사항)
echo "Setting up default assets..."
python scripts/setup_assets.py

# 서버 시작
echo "Starting server..."
python api/server.py
