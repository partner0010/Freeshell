#!/bin/bash

# 한국 서버 완전 자동 배포 스크립트
# 모든 단계를 자동으로 수행하고 오류를 방지합니다

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }

# 오류 처리
trap 'log_error "배포 중 오류 발생. 로그를 확인하세요."; exit 1' ERR

# 현재 디렉토리 확인
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKEND_DIR="$PROJECT_ROOT"

log_info "프로젝트 루트: $PROJECT_ROOT"
log_info "백엔드 디렉토리: $BACKEND_DIR"

# 1. 필수 파일 확인
log_info "필수 파일 확인 중..."
REQUIRED_FILES=(
    "$BACKEND_DIR/package.json"
    "$BACKEND_DIR/prisma/schema.prisma"
    "$BACKEND_DIR/src/index.ts"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        log_error "필수 파일이 없습니다: $file"
        exit 1
    fi
done
log_success "필수 파일 확인 완료"

# 2. Node.js 및 npm 확인
log_info "Node.js 환경 확인 중..."
if ! command -v node &> /dev/null; then
    log_error "Node.js가 설치되지 않았습니다"
    log_info "먼저 setup-korean-server.sh를 실행하세요"
    exit 1
fi

NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)
log_success "Node.js: $NODE_VERSION"
log_success "npm: $NPM_VERSION"

# 3. 의존성 설치
log_info "의존성 설치 중..."
cd "$BACKEND_DIR"

# package-lock.json이 있으면 삭제 (깨끗한 설치)
if [ -f "package-lock.json" ]; then
    rm -f package-lock.json
fi

# npm install (오류 발생 시 재시도)
MAX_RETRIES=3
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if npm install --production=false; then
        log_success "의존성 설치 완료"
        break
    else
        RETRY_COUNT=$((RETRY_COUNT + 1))
        if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
            log_warning "의존성 설치 실패, 재시도 중... ($RETRY_COUNT/$MAX_RETRIES)"
            sleep 5
        else
            log_error "의존성 설치 실패 (최대 재시도 횟수 초과)"
            exit 1
        fi
    fi
done

# 4. 환경 변수 확인
log_info "환경 변수 확인 중..."
if [ ! -f ".env" ]; then
    log_warning ".env 파일이 없습니다"
    if [ -f ".env.example" ]; then
        log_info ".env.example을 복사합니다..."
        cp .env.example .env
        log_warning ".env 파일을 편집하여 API 키를 설정해주세요"
    else
        log_error ".env 파일이 없고 .env.example도 없습니다"
        exit 1
    fi
else
    log_success ".env 파일 확인"
fi

# DATABASE_URL 확인
if ! grep -q "DATABASE_URL" .env 2>/dev/null; then
    log_warning "DATABASE_URL이 .env에 없습니다. 추가합니다..."
    echo 'DATABASE_URL="file:./data/database.db"' >> .env
fi

# 5. 데이터 디렉토리 생성
log_info "데이터 디렉토리 생성 중..."
mkdir -p data
mkdir -p uploads/images
mkdir -p uploads/videos
mkdir -p uploads/ebooks
mkdir -p logs
log_success "디렉토리 생성 완료"

# 6. Prisma 클라이언트 생성
log_info "Prisma 클라이언트 생성 중..."
if npx prisma generate; then
    log_success "Prisma 클라이언트 생성 완료"
else
    log_error "Prisma 클라이언트 생성 실패"
    exit 1
fi

# 7. 데이터베이스 마이그레이션
log_info "데이터베이스 마이그레이션 실행 중..."
if npx prisma migrate deploy; then
    log_success "데이터베이스 마이그레이션 완료"
else
    log_warning "마이그레이션 실패 (개발 환경에서는 migrate dev 사용)"
    if [ "$NODE_ENV" != "production" ]; then
        log_info "개발 환경에서 migrate dev 실행..."
        npx prisma migrate dev --name initial || log_warning "마이그레이션 실패 (계속 진행)"
    fi
fi

# 8. TypeScript 빌드
log_info "TypeScript 빌드 중..."
if npm run build; then
    log_success "빌드 완료"
else
    log_error "빌드 실패"
    exit 1
fi

# 9. 빌드 결과 확인
log_info "빌드 결과 확인 중..."
if [ ! -f "dist/index.js" ]; then
    log_error "빌드 결과 파일이 없습니다: dist/index.js"
    exit 1
fi
log_success "빌드 결과 확인 완료"

# 10. PM2로 서버 시작
log_info "PM2로 서버 시작 중..."
if command -v pm2 &> /dev/null; then
    # 기존 프로세스가 있으면 중지
    pm2 delete all-in-one-content-ai 2>/dev/null || true
    
    # 새로 시작
    pm2 start dist/index.js --name all-in-one-content-ai --instances 1 || {
        log_error "PM2 시작 실패"
        exit 1
    }
    
    # PM2 저장
    pm2 save || log_warning "PM2 save 실패"
    
    log_success "서버가 PM2로 시작되었습니다"
    log_info "서버 상태 확인: pm2 status"
    log_info "로그 확인: pm2 logs all-in-one-content-ai"
else
    log_warning "PM2가 설치되지 않았습니다"
    log_info "서버를 수동으로 시작하세요: node dist/index.js"
fi

# 11. 헬스 체크
log_info "서버 헬스 체크 중..."
sleep 3

if command -v curl &> /dev/null; then
    if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
        log_success "서버가 정상적으로 실행 중입니다"
    else
        log_warning "헬스 체크 실패 (서버가 아직 시작 중일 수 있습니다)"
    fi
else
    log_warning "curl이 없어 헬스 체크를 건너뜁니다"
fi

# 완료 메시지
echo ""
log_success "=========================================="
log_success "배포가 완료되었습니다!"
log_success "=========================================="
echo ""
log_info "다음 명령어로 서버를 관리할 수 있습니다:"
echo "  pm2 status              # 서버 상태 확인"
echo "  pm2 logs all-in-one-content-ai  # 로그 확인"
echo "  pm2 restart all-in-one-content-ai  # 재시작"
echo "  pm2 stop all-in-one-content-ai    # 중지"
echo ""
log_info "Nginx 리버스 프록시 설정이 필요합니다"
log_info "SSL 인증서 설치: sudo certbot --nginx -d your-domain.com"
echo ""

