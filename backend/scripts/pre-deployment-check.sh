#!/bin/bash

# 서버 배포 전 체크리스트 스크립트
# 모든 필수 사항이 준비되었는지 확인

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

ERRORS=0
WARNINGS=0

echo ""
log_info "=========================================="
log_info "서버 배포 전 체크리스트"
log_info "=========================================="
echo ""

# 1. 필수 파일 확인
log_info "1. 필수 파일 확인 중..."
REQUIRED_FILES=(
    "package.json"
    "prisma/schema.prisma"
    "src/index.ts"
    "tsconfig.json"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        log_success "  $file"
    else
        log_error "  $file (없음)"
        ERRORS=$((ERRORS + 1))
    fi
done

# 2. Node.js 버전 확인
log_info "2. Node.js 환경 확인 중..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_MAJOR" -ge 18 ]; then
        log_success "  Node.js: $NODE_VERSION"
    else
        log_error "  Node.js 버전이 낮습니다: $NODE_VERSION (v18 이상 필요)"
        ERRORS=$((ERRORS + 1))
    fi
else
    log_error "  Node.js가 설치되지 않았습니다"
    ERRORS=$((ERRORS + 1))
fi

# 3. npm 확인
log_info "3. npm 확인 중..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    log_success "  npm: $NPM_VERSION"
else
    log_error "  npm이 설치되지 않았습니다"
    ERRORS=$((ERRORS + 1))
fi

# 4. 필수 시스템 도구 확인
log_info "4. 필수 시스템 도구 확인 중..."
TOOLS=("git" "curl" "wget")

for tool in "${TOOLS[@]}"; do
    if command -v $tool &> /dev/null; then
        log_success "  $tool"
    else
        log_warning "  $tool (없음, 선택사항)"
        WARNINGS=$((WARNINGS + 1))
    fi
done

# 5. FFmpeg 확인
log_info "5. FFmpeg 확인 중..."
if command -v ffmpeg &> /dev/null; then
    FFMPEG_VERSION=$(ffmpeg -version | head -n 1)
    log_success "  FFmpeg 설치됨"
else
    log_warning "  FFmpeg가 없습니다 (비디오 생성에 필요)"
    WARNINGS=$((WARNINGS + 1))
fi

# 6. 환경 변수 파일 확인
log_info "6. 환경 변수 파일 확인 중..."
if [ -f ".env" ]; then
    log_success "  .env 파일 존재"
    
    # 필수 환경 변수 확인
    REQUIRED_ENV_VARS=(
        "DATABASE_URL"
        "PORT"
        "NODE_ENV"
    )
    
    MISSING_ENV=0
    for var in "${REQUIRED_ENV_VARS[@]}"; do
        if grep -q "^${var}=" .env 2>/dev/null; then
            log_success "    $var 설정됨"
        else
            log_warning "    $var 없음"
            MISSING_ENV=$((MISSING_ENV + 1))
        fi
    done
    
    # 선택적 환경 변수 확인
    OPTIONAL_ENV_VARS=(
        "OPENAI_API_KEY"
        "CLAUDE_API_KEY"
        "JWT_SECRET"
    )
    
    for var in "${OPTIONAL_ENV_VARS[@]}"; do
        if grep -q "^${var}=" .env 2>/dev/null; then
            VALUE=$(grep "^${var}=" .env | cut -d'=' -f2)
            if [[ "$VALUE" == *"your_"* ]] || [[ "$VALUE" == *"here"* ]] || [ -z "$VALUE" ]; then
                log_warning "    $var 기본값 사용 중 (실제 값으로 변경 필요)"
                WARNINGS=$((WARNINGS + 1))
            else
                log_success "    $var 설정됨"
            fi
        else
            log_warning "    $var 없음 (선택사항)"
            WARNINGS=$((WARNINGS + 1))
        fi
    done
else
    log_error "  .env 파일이 없습니다"
    ERRORS=$((ERRORS + 1))
fi

# 7. 의존성 확인
log_info "7. 의존성 확인 중..."
if [ -d "node_modules" ]; then
    log_success "  node_modules 존재"
    
    # 필수 패키지 확인
    REQUIRED_PACKAGES=(
        "express"
        "prisma"
        "@prisma/client"
        "dotenv"
    )
    
    for package in "${REQUIRED_PACKAGES[@]}"; do
        if [ -d "node_modules/$package" ]; then
            log_success "    $package"
        else
            log_error "    $package 없음"
            ERRORS=$((ERRORS + 1))
        fi
    done
else
    log_warning "  node_modules 없음 (npm install 필요)"
    WARNINGS=$((WARNINGS + 1))
fi

# 8. Prisma 스키마 확인
log_info "8. Prisma 스키마 확인 중..."
if [ -f "prisma/schema.prisma" ]; then
    if grep -q "model User" prisma/schema.prisma; then
        log_success "  Prisma 스키마 유효"
    else
        log_error "  Prisma 스키마가 유효하지 않습니다"
        ERRORS=$((ERRORS + 1))
    fi
else
    log_error "  prisma/schema.prisma 없음"
    ERRORS=$((ERRORS + 1))
fi

# 9. 데이터 디렉토리 확인
log_info "9. 데이터 디렉토리 확인 중..."
REQUIRED_DIRS=("data" "uploads" "logs")

for dir in "${REQUIRED_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        log_success "  $dir/"
    else
        log_warning "  $dir/ 없음 (자동 생성됨)"
        WARNINGS=$((WARNINGS + 1))
    fi
done

# 10. 빌드 확인
log_info "10. 빌드 확인 중..."
if [ -d "dist" ] && [ -f "dist/index.js" ]; then
    log_success "  빌드 완료 (dist/index.js 존재)"
else
    log_warning "  빌드되지 않음 (npm run build 필요)"
    WARNINGS=$((WARNINGS + 1))
fi

# 11. 포트 사용 확인
log_info "11. 포트 사용 확인 중..."
PORT=${PORT:-3001}
if command -v lsof &> /dev/null; then
    if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
        log_warning "  포트 $PORT 이미 사용 중"
        WARNINGS=$((WARNINGS + 1))
    else
        log_success "  포트 $PORT 사용 가능"
    fi
else
    log_warning "  lsof 없음, 포트 확인 건너뜀"
fi

# 12. PM2 확인
log_info "12. PM2 확인 중..."
if command -v pm2 &> /dev/null; then
    log_success "  PM2 설치됨"
else
    log_warning "  PM2 없음 (sudo npm install -g pm2)"
    WARNINGS=$((WARNINGS + 1))
fi

# 결과 요약
echo ""
log_info "=========================================="
log_info "체크리스트 결과"
log_info "=========================================="

if [ $ERRORS -eq 0 ]; then
    log_success "치명적 오류: 없음"
else
    log_error "치명적 오류: $ERRORS 개"
fi

if [ $WARNINGS -eq 0 ]; then
    log_success "경고: 없음"
else
    log_warning "경고: $WARNINGS 개"
fi

echo ""

if [ $ERRORS -eq 0 ]; then
    log_success "✅ 배포 준비 완료!"
    exit 0
else
    log_error "❌ 배포 전에 오류를 수정해주세요"
    exit 1
fi

