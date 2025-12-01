# 🚀 프로덕션 배포 가이드

## 📋 배포 전 체크리스트

### 필수 작업
- [x] 코드 오류 수정 완료
- [x] 보안 테스트 완료
- [x] 데이터베이스 마이그레이션 완료
- [ ] 환경 변수 설정 (프로덕션)
- [ ] HTTPS 인증서 설정
- [ ] 도메인 설정
- [ ] 모니터링 설정

## 🌐 배포 플랫폼 옵션

### 1. Railway (권장 - 간단함)
**장점:**
- GitHub 연동 자동 배포
- 무료 티어 제공
- 환경 변수 관리 쉬움

**배포 방법:**
1. Railway.app 가입
2. GitHub 저장소 연결
3. 환경 변수 설정
4. 자동 배포 완료

### 2. AWS Lightsail
**장점:**
- 저렴한 가격 ($5/월)
- 완전한 서버 제어
- 확장 가능

**배포 방법:**
- `AWS_LIGHTSAIL_SETUP.md` 참고

### 3. Vercel (프론트엔드) + Railway (백엔드)
**장점:**
- 프론트엔드 최적화
- CDN 자동 제공
- 빠른 배포

### 4. Docker + 자체 서버
**장점:**
- 완전한 제어
- 커스터마이징 가능

**배포 방법:**
```bash
# Docker Compose 사용
cd backend
docker-compose up -d
```

## 🔧 프로덕션 환경 변수 설정

### 백엔드 (.env)

```env
# 서버 설정
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com

# 데이터베이스
DATABASE_URL="file:./data/database.db"
# 또는 PostgreSQL (프로덕션 권장)
# DATABASE_URL="postgresql://user:password@host:5432/dbname"

# AI API Keys (필수)
OPENAI_API_KEY=your_actual_openai_key
# 또는
CLAUDE_API_KEY=your_actual_claude_key

# JWT Secret (반드시 변경!)
JWT_SECRET=<강력한_랜덤_키_64자_이상>

# YouTube API (선택)
YOUTUBE_CLIENT_ID=your_youtube_client_id
YOUTUBE_CLIENT_SECRET=your_youtube_client_secret
YOUTUBE_REDIRECT_URI=https://yourdomain.com/api/platform/youtube/callback

# Redis (선택, 캐싱용)
REDIS_URL=redis://localhost:6379

# 로깅
LOG_LEVEL=info
```

### 프론트엔드 (.env)

```env
VITE_API_BASE_URL=https://api.yourdomain.com/api
VITE_API_KEY=
```

## 🔐 보안 강화 (프로덕션)

### 1. JWT Secret 생성
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 2. HTTPS 설정
- Let's Encrypt 무료 인증서 사용
- 또는 클라우드 플랫폼의 자동 HTTPS 사용

### 3. 환경 변수 보안
- 절대 GitHub에 커밋하지 않기
- 환경 변수 관리 서비스 사용 (AWS Secrets Manager, Azure Key Vault 등)

### 4. 데이터베이스 백업
```bash
# SQLite 백업
cp backend/data/database.db backend/data/database.db.backup

# 또는 PostgreSQL 백업
pg_dump database_name > backup.sql
```

## 📦 배포 단계

### Railway 배포 (권장)

1. **Railway 가입 및 프로젝트 생성**
   - https://railway.app 접속
   - GitHub 계정으로 로그인
   - "New Project" → "Deploy from GitHub repo"

2. **환경 변수 설정**
   - Settings → Variables
   - 모든 환경 변수 추가

3. **데이터베이스 설정**
   - "New" → "Database" → "PostgreSQL" (권장)
   - 또는 SQLite 사용 (간단하지만 확장성 낮음)

4. **자동 배포**
   - GitHub에 푸시하면 자동 배포

### 수동 배포 (VPS/서버)

1. **서버 준비**
   ```bash
   # Node.js 설치
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # PM2 설치
   npm install -g pm2
   ```

2. **코드 배포**
   ```bash
   git clone https://github.com/partner0010/Freeshell.git
   cd Freeshell/backend
   npm install --production
   ```

3. **환경 변수 설정**
   ```bash
   cp .env.example .env
   nano .env  # 환경 변수 편집
   ```

4. **데이터베이스 마이그레이션**
   ```bash
   npx prisma generate
   npx prisma migrate deploy
   ```

5. **서버 실행**
   ```bash
   npm run build
   pm2 start dist/index.js --name freeshell
   pm2 save
   pm2 startup  # 자동 시작 설정
   ```

## 🔄 CI/CD 파이프라인

GitHub Actions가 자동으로:
1. 코드 푸시 시 테스트 실행
2. 빌드 수행
3. main 브랜치에 푸시 시 자동 배포

### GitHub Secrets 설정 필요

Repository → Settings → Secrets and variables → Actions

필요한 Secrets:
- `SERVER_HOST`: 서버 IP 주소
- `SERVER_USER`: SSH 사용자명
- `SERVER_SSH_KEY`: SSH 개인 키

## 📊 모니터링

### 1. 로그 모니터링
```bash
# PM2 로그 확인
pm2 logs freeshell

# 실시간 모니터링
pm2 monit
```

### 2. 헬스 체크
```bash
curl https://api.yourdomain.com/api/health
```

### 3. 성능 모니터링
- PM2 모니터링
- 또는 외부 서비스 (Datadog, New Relic 등)

## 🐛 문제 해결

### 서버가 시작되지 않음
1. 로그 확인: `pm2 logs`
2. 환경 변수 확인
3. 포트 충돌 확인: `netstat -tulpn | grep 3001`

### 데이터베이스 오류
1. 마이그레이션 재실행: `npx prisma migrate deploy`
2. Prisma 클라이언트 재생성: `npx prisma generate`

### 메모리 부족
1. PM2 메모리 제한 설정
2. Node.js 옵션 조정

## 📚 참고 문서

- `SECURITY_CHECKLIST.md` - 보안 체크리스트
- `PENETRATION_TEST_REPORT.md` - 보안 테스트 리포트
- `FINAL_STATUS.md` - 프로젝트 상태

## 🎯 배포 완료 후

1. ✅ HTTPS 확인
2. ✅ Health Check 확인
3. ✅ 기능 테스트
4. ✅ 모니터링 설정
5. ✅ 백업 설정

