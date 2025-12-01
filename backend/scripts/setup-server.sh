#!/bin/bash

# 서버 초기 설정 스크립트
# 새 서버에 처음 설치할 때 사용

set -e

echo "🖥️ 서버 초기 설정 시작..."

# 시스템 업데이트
echo "📦 시스템 업데이트 중..."
sudo apt-get update
sudo apt-get upgrade -y

# 필수 패키지 설치
echo "📦 필수 패키지 설치 중..."
sudo apt-get install -y \
    curl \
    wget \
    git \
    build-essential \
    ffmpeg \
    nginx \
    certbot \
    python3-certbot-nginx

# Node.js 설치
echo "📦 Node.js 설치 중..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

echo "✅ Node.js 버전: $(node --version)"
echo "✅ npm 버전: $(npm --version)"

# PM2 설치
echo "📦 PM2 설치 중..."
sudo npm install -g pm2

# 방화벽 설정
echo "🔥 방화벽 설정 중..."
sudo ufw --force enable
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 3001/tcp  # API

# 디렉토리 생성
echo "📁 디렉토리 생성 중..."
sudo mkdir -p /opt/all-in-one-content-ai
sudo chown -R $USER:$USER /opt/all-in-one-content-ai

echo ""
echo "✅ 서버 초기 설정 완료!"
echo ""
echo "다음 단계:"
echo "1. 프로젝트를 서버에 클론하거나 업로드"
echo "2. .env 파일 설정"
echo "3. npm install && npm run build"
echo "4. pm2 start dist/index.js --name all-in-one-content-ai"

