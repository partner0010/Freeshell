#!/bin/bash

# 로컬 테스트 환경 설정 스크립트

echo "🚀 로컬 테스트 환경 설정 시작..."

# 1. .env 파일 확인
if [ ! -f .env ]; then
    echo "📝 .env 파일 생성 중..."
    cp .env.example .env
    echo "⚠️  .env 파일을 열어서 API 키를 설정해주세요!"
else
    echo "✅ .env 파일이 이미 존재합니다"
fi

# 2. 필수 디렉토리 생성
echo "📁 필수 디렉토리 생성 중..."
mkdir -p data
mkdir -p uploads/images
mkdir -p uploads/videos
mkdir -p uploads/temp
mkdir -p logs

# 3. Prisma 클라이언트 생성
echo "🔧 Prisma 클라이언트 생성 중..."
npx prisma generate

# 4. 데이터베이스 마이그레이션
echo "🗄️  데이터베이스 마이그레이션 실행 중..."
npx prisma migrate dev --name init

echo "✅ 로컬 테스트 환경 설정 완료!"
echo ""
echo "다음 단계:"
echo "1. .env 파일을 열어서 API 키를 설정하세요"
echo "2. npm.cmd run dev 로 서버를 시작하세요"

