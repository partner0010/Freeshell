# 서버 배포 전 체크리스트

## ✅ 배포 전 필수 확인 사항

### 1. 코드 준비
- [ ] 모든 코드가 최신 상태인지 확인
- [ ] 빌드 오류가 없는지 확인 (`npm run build`)
- [ ] 린터 오류가 없는지 확인 (`npm run lint`)
- [ ] TODO 주석이 적절히 처리되었는지 확인

### 2. 환경 변수 설정
- [ ] `.env` 파일 생성 및 설정
- [ ] `DATABASE_URL` 설정 확인
- [ ] `PORT` 설정 확인 (기본: 3001)
- [ ] `NODE_ENV=production` 설정
- [ ] `JWT_SECRET` 강력한 비밀키로 변경
- [ ] `OPENAI_API_KEY` 또는 `CLAUDE_API_KEY` 설정
- [ ] `YOUTUBE_CLIENT_ID`, `YOUTUBE_CLIENT_SECRET` 설정 (YouTube 사용 시)
- [ ] `FRONTEND_URL` 실제 도메인으로 설정

### 3. 데이터베이스
- [ ] Prisma 스키마 최신 상태 확인
- [ ] Prisma 클라이언트 생성 (`npx prisma generate`)
- [ ] 데이터베이스 마이그레이션 실행 (`npx prisma migrate deploy`)
- [ ] 데이터 디렉토리 생성 (`mkdir -p data`)

### 4. 시스템 요구사항
- [ ] Node.js v18 이상 설치 확인
- [ ] npm 설치 확인
- [ ] FFmpeg 설치 확인 (비디오 생성 사용 시)
- [ ] PM2 설치 확인 (`sudo npm install -g pm2`)
- [ ] 필요한 디렉토리 생성 (`uploads`, `logs` 등)

### 5. 보안 설정
- [ ] 방화벽 설정 (포트 22, 80, 443, 3001)
- [ ] SSL 인증서 준비 (Let's Encrypt)
- [ ] Nginx 리버스 프록시 설정
- [ ] API 키 보안 확인
- [ ] JWT Secret 강력한 값으로 변경

### 6. 서버 설정
- [ ] 서버 초기 설정 스크립트 실행 (`setup-korean-server.sh`)
- [ ] 배포 전 체크리스트 실행 (`pre-deployment-check.sh`)
- [ ] 자동 배포 스크립트 실행 (`auto-deploy-korean.sh`)

## 🔍 배포 전 체크리스트 실행

```bash
cd backend
chmod +x scripts/pre-deployment-check.sh
./scripts/pre-deployment-check.sh
```

이 스크립트는 다음을 자동으로 확인합니다:
- ✅ 필수 파일 존재 여부
- ✅ Node.js 버전
- ✅ 환경 변수 설정
- ✅ 의존성 설치
- ✅ Prisma 스키마
- ✅ 포트 사용 가능 여부
- ✅ PM2 설치

## 🚀 배포 단계

### 1단계: 서버 초기 설정
```bash
./scripts/setup-korean-server.sh
```

### 2단계: 배포 전 체크
```bash
./scripts/pre-deployment-check.sh
```

### 3단계: 자동 배포
```bash
./scripts/auto-deploy-korean.sh
```

## ⚠️ 배포 후 확인 사항

### 서버 상태 확인
```bash
pm2 status
pm2 logs all-in-one-content-ai
```

### 헬스 체크
```bash
curl http://localhost:3001/api/health
```

### API 테스트
```bash
# 콘텐츠 생성 테스트
curl -X POST http://localhost:3001/api/content/generate \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{"topic":"테스트","contentType":"daily","text":"테스트 콘텐츠"}'
```

## 🐛 문제 해결

### 문제 1: 포트가 이미 사용 중
```bash
# 포트 사용 확인
sudo lsof -i :3001

# 프로세스 종료
pm2 delete all-in-one-content-ai
```

### 문제 2: 데이터베이스 오류
```bash
# 마이그레이션 재실행
npx prisma migrate deploy
npx prisma generate
```

### 문제 3: 의존성 오류
```bash
# node_modules 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install
```

### 문제 4: 빌드 오류
```bash
# TypeScript 컴파일 확인
npx tsc --noEmit

# 빌드 재시도
npm run build
```

## 📊 모니터링 설정

### PM2 모니터링
```bash
pm2 monit
```

### 로그 확인
```bash
# 실시간 로그
pm2 logs all-in-one-content-ai --lines 100

# 로그 파일
tail -f logs/app.log
```

### 시스템 리소스
```bash
htop
df -h
free -h
```

## 🔄 업데이트 절차

1. 코드 업데이트
2. 의존성 업데이트 (`npm install`)
3. 빌드 (`npm run build`)
4. 데이터베이스 마이그레이션 (`npx prisma migrate deploy`)
5. 서버 재시작 (`pm2 restart all-in-one-content-ai`)

## ✅ 완료 확인

배포가 성공적으로 완료되면:
- ✅ 서버가 정상 실행 중 (`pm2 status`)
- ✅ 헬스 체크 통과 (`/api/health`)
- ✅ API 요청 정상 응답
- ✅ 로그에 오류 없음

