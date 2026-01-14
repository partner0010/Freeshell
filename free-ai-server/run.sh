#!/bin/bash

# Free AI Server 실행 스크립트

echo "🚀 Free AI API Server 시작 중..."

# Ollama 연결 확인
echo "📡 Ollama 서버 연결 확인 중..."
if ! curl -s http://localhost:11434/api/tags > /dev/null; then
    echo "❌ Ollama 서버에 연결할 수 없습니다."
    echo "   Ollama를 실행하세요: ollama serve"
    exit 1
fi

echo "✅ Ollama 서버 연결 성공"

# Python 가상환경 확인
if [ ! -d "venv" ]; then
    echo "📦 가상환경 생성 중..."
    python3 -m venv venv
fi

# 가상환경 활성화
source venv/bin/activate

# 의존성 설치
echo "📦 의존성 설치 중..."
pip install -r requirements.txt

# 서버 실행
echo "🚀 서버 시작..."
python -m app.main
