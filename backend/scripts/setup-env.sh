#!/bin/bash

# 환경 변수 대화형 설정 스크립트
# 사용자에게 질문하여 .env 파일을 자동으로 생성합니다

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warn() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

echo "🔧 환경 변수 설정 시작..."
echo ""

# .env 파일 경로
ENV_FILE=".env"

# .env 파일이 이미 있으면 백업
if [ -f "$ENV_FILE" ]; then
    warn ".env 파일이 이미 존재합니다. 백업을 생성합니다..."
    cp "$ENV_FILE" "${ENV_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
fi

# 기본값 설정
PORT=${PORT:-3001}
NODE_ENV=${NODE_ENV:-production}
FRONTEND_URL=${FRONTEND_URL:-http://localhost:3000}
DATABASE_URL=${DATABASE_URL:-"file:./data/database.db"}
REDIS_URL=${REDIS_URL:-redis://localhost:6379}

# 서버 설정
echo "📝 서버 설정"
read -p "포트 번호 [$PORT]: " input_port
PORT=${input_port:-$PORT}

read -p "프론트엔드 URL [$FRONTEND_URL]: " input_frontend
FRONTEND_URL=${input_frontend:-$FRONTEND_URL}

# AI API 키
echo ""
echo "🤖 AI API 키 설정"
echo "OpenAI 또는 Claude API 키 중 하나는 필수입니다."
read -p "OpenAI API 키 (선택): " OPENAI_API_KEY
read -p "Claude API 키 (선택): " CLAUDE_API_KEY

if [ -z "$OPENAI_API_KEY" ] && [ -z "$CLAUDE_API_KEY" ]; then
    warn "AI API 키가 없습니다. 나중에 .env 파일에서 설정해주세요."
fi

# YouTube API (선택)
echo ""
echo "📺 YouTube API 설정 (선택)"
read -p "YouTube Client ID (선택): " YOUTUBE_CLIENT_ID
read -p "YouTube Client Secret (선택): " YOUTUBE_CLIENT_SECRET

# 보안 키 자동 생성
echo ""
echo "🔒 보안 키 자동 생성 중..."
JWT_SECRET=$(openssl rand -hex 32)
API_KEY=$(openssl rand -hex 32)
ENCRYPTION_KEY=$(openssl rand -hex 32)
success "보안 키 생성 완료"

# .env 파일 생성
cat > "$ENV_FILE" << EOF
# 올인원 콘텐츠 AI 환경 변수
# 자동 생성: $(date)

# 서버 설정
PORT=$PORT
NODE_ENV=$NODE_ENV
FRONTEND_URL=$FRONTEND_URL

# 데이터베이스
DATABASE_URL=$DATABASE_URL

# Redis
REDIS_URL=$REDIS_URL

# AI API Keys
$(if [ -n "$OPENAI_API_KEY" ]; then echo "OPENAI_API_KEY=$OPENAI_API_KEY"; fi)
$(if [ -n "$CLAUDE_API_KEY" ]; then echo "CLAUDE_API_KEY=$CLAUDE_API_KEY"; fi)

# YouTube API
$(if [ -n "$YOUTUBE_CLIENT_ID" ]; then echo "YOUTUBE_CLIENT_ID=$YOUTUBE_CLIENT_ID"; fi)
$(if [ -n "$YOUTUBE_CLIENT_SECRET" ]; then echo "YOUTUBE_CLIENT_SECRET=$YOUTUBE_CLIENT_SECRET"; fi)
YOUTUBE_REDIRECT_URI=http://localhost:$PORT/api/platform/youtube/callback

# 보안 키 (자동 생성)
JWT_SECRET=$JWT_SECRET
API_KEY=$API_KEY
ENCRYPTION_KEY=$ENCRYPTION_KEY

# 로깅
LOG_LEVEL=info
EOF

success ".env 파일 생성 완료: $ENV_FILE"
echo ""
echo "다음 단계:"
echo "1. .env 파일을 확인하고 필요한 API 키를 추가하세요"
echo "2. npm run build"
echo "3. npm start 또는 pm2 start dist/index.js --name all-in-one-content-ai"

