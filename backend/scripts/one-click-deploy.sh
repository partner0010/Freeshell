#!/bin/bash

# 원클릭 배포 스크립트
# 서버 IP만 입력하면 모든 것을 자동으로 배포합니다

set -e

# 색상 정의
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warn() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

info() {
    echo "ℹ️ $1"
}

# 입력 확인
if [ -z "$1" ]; then
    error "사용법: ./one-click-deploy.sh [서버IP] [사용자명]"
    echo "예: ./one-click-deploy.sh 123.456.789.0 root"
    exit 1
fi

SERVER_HOST=$1
SERVER_USER=${2:-"root"}
APP_NAME="all-in-one-content-ai"
APP_DIR="/opt/$APP_NAME"

echo "🚀 원클릭 배포 시작..."
echo "서버: $SERVER_USER@$SERVER_HOST"
echo ""

# 1. 서버 초기 설정 확인 및 실행
info "1/6 서버 초기 설정 확인 중..."
ssh $SERVER_USER@$SERVER_HOST << 'INIT_EOF'
    if [ ! -f /opt/all-in-one-content-ai/.server-setup-complete ]; then
        echo "서버 초기 설정이 필요합니다..."
        if [ -f /opt/all-in-one-content-ai/backend/scripts/auto-setup-server.sh ]; then
            chmod +x /opt/all-in-one-content-ai/backend/scripts/auto-setup-server.sh
            /opt/all-in-one-content-ai/backend/scripts/auto-setup-server.sh
        else
            echo "서버 초기 설정 스크립트를 먼저 업로드해주세요."
            exit 1
        fi
        touch /opt/all-in-one-content-ai/.server-setup-complete
    else
        echo "서버 초기 설정 완료됨"
    fi
INIT_EOF
success "서버 초기 설정 완료"

# 2. 로컬 빌드
info "2/6 로컬 빌드 중..."
cd "$(dirname "$0")/.."
npm run build
success "로컬 빌드 완료"

# 3. 파일 업로드
info "3/6 파일 업로드 중..."
rsync -avz --delete \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude 'dist' \
    --exclude 'logs' \
    --exclude 'uploads' \
    --exclude 'data' \
    --exclude '.env' \
    ./ $SERVER_USER@$SERVER_HOST:$APP_DIR/backend/
success "파일 업로드 완료"

# 4. 서버에서 빌드 및 설정
info "4/6 서버에서 빌드 중..."
ssh $SERVER_USER@$SERVER_HOST << 'BUILD_EOF'
    cd /opt/all-in-one-content-ai/backend
    
    # 의존성 설치
    echo "의존성 설치 중..."
    npm install --production
    
    # Prisma 설정
    echo "Prisma 설정 중..."
    npx prisma generate || true
    npx prisma migrate deploy || npx prisma db push || true
    
    # 빌드
    echo "빌드 중..."
    npm run build
    
    # .env 파일 확인 및 생성
    if [ ! -f .env ]; then
        echo "⚠️ .env 파일이 없습니다!"
        echo "기본 .env 파일을 생성합니다..."
        cat > .env << 'ENV_EOF'
# 올인원 콘텐츠 AI 환경 변수

# 서버 설정
PORT=3001
NODE_ENV=production
FRONTEND_URL=http://localhost:3000

# 데이터베이스
DATABASE_URL="file:./data/database.db"

# Redis
REDIS_URL=redis://localhost:6379

# AI API Keys (필수 - 설정 필요)
OPENAI_API_KEY=your_openai_api_key_here
# 또는
CLAUDE_API_KEY=your_claude_api_key_here

# YouTube API (선택)
YOUTUBE_CLIENT_ID=your_youtube_client_id
YOUTUBE_CLIENT_SECRET=your_youtube_client_secret
YOUTUBE_REDIRECT_URI=http://localhost:3001/api/platform/youtube/callback

# 보안 키 (자동 생성 권장)
JWT_SECRET=change_this_in_production
API_KEY=change_this_in_production
ENCRYPTION_KEY=change_this_in_production

# 로깅
LOG_LEVEL=info
ENV_EOF
        echo "✅ 기본 .env 파일 생성 완료"
        echo "⚠️ .env 파일을 수정하여 API 키를 설정해주세요!"
    fi
BUILD_EOF
success "서버 빌드 완료"

# 5. 서버 시작
info "5/6 서버 시작 중..."
ssh $SERVER_USER@$SERVER_HOST << 'START_EOF'
    cd /opt/all-in-one-content-ai/backend
    
    # PM2로 서버 시작
    pm2 delete $APP_NAME 2>/dev/null || true
    pm2 start dist/index.js --name $APP_NAME
    pm2 save
    
    # 서버 상태 확인
    sleep 3
    if pm2 list | grep -q "$APP_NAME.*online"; then
        echo "✅ 서버 시작 완료"
    else
        echo "❌ 서버 시작 실패"
        pm2 logs $APP_NAME --lines 20
        exit 1
    fi
START_EOF
success "서버 시작 완료"

# 6. 헬스 체크
info "6/6 헬스 체크 중..."
sleep 5
if curl -f -s http://$SERVER_HOST:3001/api/health > /dev/null; then
    success "헬스 체크 통과"
    echo ""
    echo "================================================"
    success "배포 완료!"
    echo ""
    echo "서버 주소: http://$SERVER_HOST:3001"
    echo "API 엔드포인트: http://$SERVER_HOST:3001/api"
    echo "헬스 체크: http://$SERVER_HOST:3001/api/health"
    echo ""
    echo "다음 단계:"
    echo "1. .env 파일에 API 키 설정"
    echo "2. 서버 재시작: ssh $SERVER_USER@$SERVER_HOST 'cd $APP_DIR/backend && pm2 restart $APP_NAME'"
    echo ""
else
    warn "헬스 체크 실패 - 서버 로그 확인 필요"
    echo "로그 확인: ssh $SERVER_USER@$SERVER_HOST 'cd $APP_DIR/backend && pm2 logs $APP_NAME'"
fi

