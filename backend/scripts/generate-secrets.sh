#!/bin/bash

# 보안 키 생성 스크립트

echo "🔐 보안 키 생성 중..."

# JWT Secret 생성
JWT_SECRET=$(openssl rand -hex 32)
echo "JWT_SECRET=$JWT_SECRET"

# API Key 생성
API_KEY=$(openssl rand -hex 32)
echo "API_KEY=$API_KEY"

# 암호화 키 생성
ENCRYPTION_KEY=$(openssl rand -hex 32)
echo "ENCRYPTION_KEY=$ENCRYPTION_KEY"

echo ""
echo "✅ 보안 키 생성 완료!"
echo "위 키들을 .env 파일에 복사하세요."

