#!/bin/bash

echo "🚀 올인원 콘텐츠 AI 백엔드 초기 설정 시작..."

# Prisma 클라이언트 생성
echo "📦 Prisma 클라이언트 생성 중..."
npx prisma generate

# 데이터베이스 마이그레이션
echo "🗄️ 데이터베이스 마이그레이션 중..."
npx prisma migrate dev --name init || npx prisma db push

# 필요한 디렉토리 생성
echo "📁 디렉토리 생성 중..."
mkdir -p uploads/videos uploads/images uploads/thumbnails data logs temp

echo "✅ 초기 설정 완료!"

