#!/bin/bash

# 완전 자동화된 서버 설정 스크립트
# 서버에 처음 설치할 때 모든 것을 자동으로 설정합니다

set -e

echo "🚀 올인원 콘텐츠 AI - 완전 자동 서버 설정 시작..."
echo "================================================"
echo ""

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 함수: 성공 메시지
success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# 함수: 경고 메시지
warn() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

# 함수: 에러 메시지
error() {
    echo -e "${RED}❌ $1${NC}"
}

# 함수: 정보 메시지
info() {
    echo -e "ℹ️ $1"
}

# 1. 시스템 업데이트
echo "📦 1/10 시스템 업데이트 중..."
sudo apt-get update -qq
sudo apt-get upgrade -y -qq
success "시스템 업데이트 완료"

# 2. 필수 패키지 설치
echo "📦 2/10 필수 패키지 설치 중..."
sudo apt-get install -y -qq \
    curl \
    wget \
    git \
    build-essential \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release \
    ufw \
    nginx \
    certbot \
    python3-certbot-nginx \
    redis-server \
    supervisor
success "필수 패키지 설치 완료"

# 3. Node.js 설치
echo "📦 3/10 Node.js 설치 중..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y -qq nodejs
    success "Node.js 설치 완료: $(node --version)"
else
    success "Node.js 이미 설치됨: $(node --version)"
fi

# 4. FFmpeg 설치
echo "📦 4/10 FFmpeg 설치 중..."
if ! command -v ffmpeg &> /dev/null; then
    sudo apt-get install -y -qq ffmpeg
    success "FFmpeg 설치 완료: $(ffmpeg -version | head -n 1)"
else
    success "FFmpeg 이미 설치됨"
fi

# 5. PM2 설치
echo "📦 5/10 PM2 설치 중..."
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
    success "PM2 설치 완료"
else
    success "PM2 이미 설치됨"
fi

# 6. Redis 설정
echo "📦 6/10 Redis 설정 중..."
if systemctl is-active --quiet redis-server; then
    success "Redis 이미 실행 중"
else
    sudo systemctl enable redis-server
    sudo systemctl start redis-server
    success "Redis 시작 완료"
fi

# Redis 설정 최적화
sudo sed -i 's/# maxmemory <bytes>/maxmemory 256mb/' /etc/redis/redis.conf
sudo sed -i 's/# maxmemory-policy noeviction/maxmemory-policy allkeys-lru/' /etc/redis/redis.conf
sudo systemctl restart redis-server
success "Redis 설정 최적화 완료"

# 7. 방화벽 설정
echo "📦 7/10 방화벽 설정 중..."
sudo ufw --force enable
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 3001/tcp  # API
sudo ufw allow 6379/tcp  # Redis (로컬만)
success "방화벽 설정 완료"

# 8. 디렉토리 생성
echo "📦 8/10 디렉토리 생성 중..."
APP_DIR="/opt/all-in-one-content-ai"
sudo mkdir -p $APP_DIR/backend
sudo mkdir -p $APP_DIR/backend/data
sudo mkdir -p $APP_DIR/backend/uploads
sudo mkdir -p $APP_DIR/backend/uploads/videos
sudo mkdir -p $APP_DIR/backend/uploads/images
sudo mkdir -p $APP_DIR/backend/uploads/thumbnails
sudo mkdir -p $APP_DIR/backend/uploads/audio
sudo mkdir -p $APP_DIR/backend/logs
sudo chown -R $USER:$USER $APP_DIR
success "디렉토리 생성 완료"

# 9. Nginx 기본 설정 (선택적)
echo "📦 9/10 Nginx 설정 중..."
if [ ! -f /etc/nginx/sites-available/all-in-one-content-ai ]; then
    sudo tee /etc/nginx/sites-available/all-in-one-content-ai > /dev/null <<EOF
server {
    listen 80;
    server_name _;

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_cache_bypass \$http_upgrade;
    }

    location / {
        root /opt/all-in-one-content-ai/frontend/dist;
        try_files \$uri \$uri/ /index.html;
    }
}
EOF
    sudo ln -sf /etc/nginx/sites-available/all-in-one-content-ai /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
    sudo nginx -t && sudo systemctl reload nginx
    success "Nginx 설정 완료"
else
    success "Nginx 설정 이미 존재"
fi

# 10. PM2 자동 시작 설정
echo "📦 10/10 PM2 자동 시작 설정 중..."
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp /home/$USER
success "PM2 자동 시작 설정 완료"

echo ""
echo "================================================"
success "서버 초기 설정 완료!"
echo ""
echo "다음 단계:"
echo "1. 프로젝트를 서버에 업로드하거나 클론"
echo "2. cd $APP_DIR/backend"
echo "3. npm install"
echo "4. .env 파일 설정"
echo "5. npm run build"
echo "6. pm2 start dist/index.js --name all-in-one-content-ai"
echo "7. pm2 save"
echo ""
info "또는 자동 배포 스크립트를 사용하세요:"
info "./scripts/one-click-deploy.sh [서버IP] [사용자명]"

