#!/bin/bash

# 빠른 배포 스크립트
# 사용법: ./quick-deploy.sh [서버IP] [사용자명]

set -e

SERVER_HOST=${1}
SERVER_USER=${2:-"root"}

if [ -z "$SERVER_HOST" ]; then
    echo "❌ 사용법: ./quick-deploy.sh [서버IP] [사용자명]"
    echo "예: ./quick-deploy.sh 123.456.789.0 root"
    exit 1
fi

echo "🚀 빠른 배포 시작..."
echo "서버: $SERVER_USER@$SERVER_HOST"
echo ""

# 1. 로컬 빌드
echo "📦 1/5 로컬 빌드 중..."
npm run build

# 2. 서버 초기 설정 (처음 한 번만)
echo "📦 2/5 서버 초기 설정 중..."
ssh $SERVER_USER@$SERVER_HOST << 'INIT_EOF'
    if ! command -v node &> /dev/null; then
        echo "Node.js 설치 중..."
        curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
        sudo apt-get install -y nodejs ffmpeg
        sudo npm install -g pm2
    fi
    
    sudo mkdir -p /opt/all-in-one-content-ai/backend
    sudo chown -R $USER:$USER /opt/all-in-one-content-ai
INIT_EOF

# 3. 파일 업로드
echo "📤 3/5 파일 업로드 중..."
rsync -avz --delete \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude 'dist' \
    --exclude 'logs' \
    --exclude 'uploads' \
    --exclude 'data' \
    ./ $SERVER_USER@$SERVER_HOST:/opt/all-in-one-content-ai/backend/

# 4. 서버에서 빌드 및 시작
echo "🔧 4/5 서버에서 빌드 중..."
ssh $SERVER_USER@$SERVER_HOST << 'BUILD_EOF'
    cd /opt/all-in-one-content-ai/backend
    
    # 의존성 설치
    npm install --production
    
    # Prisma 설정
    npx prisma generate || true
    npx prisma migrate deploy || npx prisma db push || true
    
    # 빌드
    npm run build
    
    # .env 파일 확인
    if [ ! -f .env ]; then
        echo "⚠️ .env 파일이 없습니다!"
        echo "서버에 .env 파일을 생성해주세요."
        echo "cp .env.example .env"
        echo "nano .env"
    fi
BUILD_EOF

# 5. 서버 시작
echo "🚀 5/5 서버 시작 중..."
ssh $SERVER_USER@$SERVER_HOST << 'START_EOF'
    cd /opt/all-in-one-content-ai/backend
    
    # PM2로 시작
    pm2 delete all-in-one-content-ai 2>/dev/null || true
    pm2 start dist/index.js --name all-in-one-content-ai
    pm2 save
    
    # 방화벽 설정
    sudo ufw allow 3001/tcp 2>/dev/null || true
    
    echo ""
    echo "✅ 배포 완료!"
    echo "서버 주소: http://$(hostname -I | awk '{print $1}'):3001"
START_EOF

echo ""
echo "✅ 배포 완료!"
echo ""
echo "다음 단계:"
echo "1. 서버에 접속: ssh $SERVER_USER@$SERVER_HOST"
echo "2. .env 파일 설정: cd /opt/all-in-one-content-ai/backend && nano .env"
echo "3. 서버 재시작: pm2 restart all-in-one-content-ai"
echo "4. 상태 확인: curl http://$SERVER_HOST:3001/api/health"

