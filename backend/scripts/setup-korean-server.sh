#!/bin/bash

# 한국 서버 자동 설치 스크립트
# Cafe24, KT Cloud, NHN Cloud, AWS Lightsail 등 지원
# 모든 의존성 자동 설치 및 오류 방지

set -e  # 오류 발생 시 즉시 중단

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 로그 함수
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 오류 처리 함수
handle_error() {
    log_error "오류 발생: $1"
    log_info "복구를 시도합니다..."
    exit 1
}

trap 'handle_error "스크립트 실행 중 오류 발생"' ERR

# 서버 정보 확인
log_info "서버 환경 확인 중..."
OS_TYPE=$(uname -s)
ARCH_TYPE=$(uname -m)

log_success "OS: $OS_TYPE"
log_success "Architecture: $ARCH_TYPE"

# 1. 시스템 업데이트
log_info "시스템 패키지 업데이트 중..."
if command -v apt-get &> /dev/null; then
    sudo apt-get update -y || log_warning "apt-get update 실패 (계속 진행)"
    sudo apt-get upgrade -y || log_warning "apt-get upgrade 실패 (계속 진행)"
elif command -v yum &> /dev/null; then
    sudo yum update -y || log_warning "yum update 실패 (계속 진행)"
else
    log_warning "패키지 매니저를 찾을 수 없습니다"
fi

# 2. 필수 패키지 설치
log_info "필수 시스템 패키지 설치 중..."
REQUIRED_PACKAGES="curl wget git build-essential ffmpeg"

if command -v apt-get &> /dev/null; then
    sudo apt-get install -y $REQUIRED_PACKAGES nginx certbot python3-certbot-nginx || {
        log_warning "일부 패키지 설치 실패, 계속 진행..."
    }
elif command -v yum &> /dev/null; then
    sudo yum install -y curl wget git gcc gcc-c++ make ffmpeg nginx certbot python3-certbot-nginx || {
        log_warning "일부 패키지 설치 실패, 계속 진행..."
    }
fi

# FFmpeg 확인
if ! command -v ffmpeg &> /dev/null; then
    log_warning "FFmpeg가 설치되지 않았습니다. 수동 설치가 필요할 수 있습니다."
    log_info "FFmpeg 설치 방법: https://ffmpeg.org/download.html"
else
    log_success "FFmpeg 설치 확인: $(ffmpeg -version | head -n 1)"
fi

# 3. Node.js 설치 (버전 확인 및 필요시 설치)
log_info "Node.js 확인 중..."
if ! command -v node &> /dev/null; then
    log_info "Node.js 설치 중..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - || {
        log_error "Node.js 설치 스크립트 다운로드 실패"
        exit 1
    }
    
    if command -v apt-get &> /dev/null; then
        sudo apt-get install -y nodejs || {
            log_error "Node.js 설치 실패"
            exit 1
        }
    elif command -v yum &> /dev/null; then
        sudo yum install -y nodejs || {
            log_error "Node.js 설치 실패"
            exit 1
        }
    fi
else
    NODE_VERSION=$(node --version)
    log_success "Node.js 이미 설치됨: $NODE_VERSION"
    
    # Node.js 버전 확인 (v18 이상 필요)
    NODE_MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_MAJOR_VERSION" -lt 18 ]; then
        log_warning "Node.js 버전이 낮습니다 (현재: $NODE_VERSION, 권장: v18 이상)"
        log_info "Node.js 업그레이드를 권장합니다"
    fi
fi

log_success "Node.js 버전: $(node --version)"
log_success "npm 버전: $(npm --version)"

# 4. npm 글로벌 패키지 설치
log_info "글로벌 npm 패키지 설치 중..."
sudo npm install -g pm2 typescript tsx || {
    log_warning "일부 글로벌 패키지 설치 실패 (계속 진행)"
}

# PM2 확인
if command -v pm2 &> /dev/null; then
    log_success "PM2 설치 확인: $(pm2 --version)"
else
    log_warning "PM2 설치 실패, 수동 설치 필요"
fi

# 5. 프로젝트 디렉토리 설정
PROJECT_DIR="/opt/all-in-one-content-ai"
log_info "프로젝트 디렉토리 설정: $PROJECT_DIR"

if [ ! -d "$PROJECT_DIR" ]; then
    sudo mkdir -p "$PROJECT_DIR"
    sudo chown -R $USER:$USER "$PROJECT_DIR"
    log_success "프로젝트 디렉토리 생성 완료"
else
    log_success "프로젝트 디렉토리 이미 존재"
fi

# 6. 방화벽 설정
log_info "방화벽 설정 중..."
if command -v ufw &> /dev/null; then
    sudo ufw --force enable || log_warning "UFW 활성화 실패"
    sudo ufw allow 22/tcp    # SSH
    sudo ufw allow 80/tcp     # HTTP
    sudo ufw allow 443/tcp    # HTTPS
    sudo ufw allow 3001/tcp   # API
    log_success "방화벽 규칙 설정 완료"
elif command -v firewall-cmd &> /dev/null; then
    sudo firewall-cmd --permanent --add-port=22/tcp
    sudo firewall-cmd --permanent --add-port=80/tcp
    sudo firewall-cmd --permanent --add-port=443/tcp
    sudo firewall-cmd --permanent --add-port=3001/tcp
    sudo firewall-cmd --reload
    log_success "방화벽 규칙 설정 완료 (firewalld)"
else
    log_warning "방화벽을 찾을 수 없습니다. 수동 설정이 필요할 수 있습니다"
fi

# 7. 필요한 디렉토리 생성
log_info "필요한 디렉토리 생성 중..."
mkdir -p "$PROJECT_DIR/data"
mkdir -p "$PROJECT_DIR/uploads/images"
mkdir -p "$PROJECT_DIR/uploads/videos"
mkdir -p "$PROJECT_DIR/uploads/ebooks"
mkdir -p "$PROJECT_DIR/logs"
log_success "디렉토리 생성 완료"

# 8. 환경 변수 파일 체크
log_info "환경 변수 파일 확인 중..."
if [ ! -f "$PROJECT_DIR/.env" ]; then
    log_warning ".env 파일이 없습니다"
    log_info ".env 파일을 생성해야 합니다"
    cat > "$PROJECT_DIR/.env.example" << 'EOF'
# 올인원 콘텐츠 AI 환경 변수

# 서버 설정
PORT=3001
NODE_ENV=production
FRONTEND_URL=http://localhost:3000

# 데이터베이스 (SQLite)
DATABASE_URL="file:./data/database.db"

# AI API Keys
OPENAI_API_KEY=your_openai_api_key_here
CLAUDE_API_KEY=your_claude_api_key_here

# YouTube API
YOUTUBE_CLIENT_ID=your_youtube_client_id
YOUTUBE_CLIENT_SECRET=your_youtube_client_secret
YOUTUBE_REDIRECT_URI=http://your-domain.com/api/platform/youtube/callback

# JWT Secret (프로덕션에서는 반드시 변경!)
JWT_SECRET=your_jwt_secret_key_change_in_production

# 로깅
LOG_LEVEL=info
EOF
    log_success ".env.example 파일 생성 완료"
    log_warning ".env 파일을 생성하고 API 키를 설정해주세요"
else
    log_success ".env 파일 존재 확인"
fi

# 9. 설치 완료 메시지
echo ""
log_success "=========================================="
log_success "서버 초기 설정이 완료되었습니다!"
log_success "=========================================="
echo ""
log_info "다음 단계:"
echo "  1. 프로젝트 파일을 $PROJECT_DIR 에 업로드"
echo "  2. cd $PROJECT_DIR/backend"
echo "  3. npm install"
echo "  4. .env 파일 설정 (API 키 등)"
echo "  5. npm run build"
echo "  6. npx prisma generate"
echo "  7. npx prisma migrate deploy"
echo "  8. pm2 start dist/index.js --name all-in-one-content-ai"
echo "  9. pm2 save"
echo "  10. pm2 startup (시스템 재시작 시 자동 시작)"
echo ""
log_info "Nginx 설정은 별도로 필요합니다"
log_info "SSL 인증서는 certbot으로 설치할 수 있습니다:"
echo "  sudo certbot --nginx -d your-domain.com"
echo ""

