# 한국 서버 배포 완전 가이드

## 🇰🇷 한국 서버 제공업체 선택

### 추천 서버 제공업체

1. **Cafe24** (가장 추천 ⭐)
   - 한국 기업, 한국어 지원
   - 가격: 월 10,000원 ~
   - 장점: 한국어 지원, 간단한 설정, 안정적
   - 단점: 성능 제한적

2. **KT Cloud**
   - 한국 통신사, 안정적
   - 가격: 월 20,000원 ~
   - 장점: 빠른 속도, 안정적
   - 단점: 가격이 다소 높음

3. **NHN Cloud**
   - 네이버 계열, 한국어 지원
   - 가격: 월 15,000원 ~
   - 장점: 한국어 지원, 다양한 서비스
   - 단점: 초기 설정 복잡

4. **AWS Lightsail** (한국 리전)
   - 글로벌 서비스, 한국 리전 사용
   - 가격: 월 $5 ~
   - 장점: 성능 우수, 확장성
   - 단점: 영어 문서, 초기 설정 복잡

## 🚀 자동 배포 스크립트 사용법

### 1단계: 서버 초기 설정

서버에 SSH로 접속한 후:

```bash
# 스크립트 다운로드
wget https://raw.githubusercontent.com/your-repo/backend/scripts/setup-korean-server.sh
# 또는 프로젝트 파일을 서버에 업로드

# 실행 권한 부여
chmod +x setup-korean-server.sh

# 실행
./setup-korean-server.sh
```

이 스크립트는 다음을 자동으로 수행합니다:
- ✅ 시스템 업데이트
- ✅ 필수 패키지 설치 (Node.js, FFmpeg, Nginx 등)
- ✅ PM2 설치
- ✅ 방화벽 설정
- ✅ 필요한 디렉토리 생성

### 2단계: 프로젝트 배포

프로젝트 파일을 서버에 업로드한 후:

```bash
cd /opt/all-in-one-content-ai/backend

# 자동 배포 스크립트 실행
chmod +x scripts/auto-deploy-korean.sh
./scripts/auto-deploy-korean.sh
```

이 스크립트는 다음을 자동으로 수행합니다:
- ✅ 의존성 설치 (npm install)
- ✅ 환경 변수 확인 및 설정
- ✅ Prisma 클라이언트 생성
- ✅ 데이터베이스 마이그레이션
- ✅ TypeScript 빌드
- ✅ PM2로 서버 시작
- ✅ 헬스 체크

## 📋 수동 배포 방법

자동 스크립트가 작동하지 않는 경우:

### 1. 서버 접속
```bash
ssh your-username@your-server-ip
```

### 2. 프로젝트 디렉토리로 이동
```bash
cd /opt/all-in-one-content-ai/backend
```

### 3. 의존성 설치
```bash
npm install
```

### 4. 환경 변수 설정
```bash
# .env 파일 생성
nano .env
```

`.env` 파일 내용:
```env
PORT=3001
NODE_ENV=production
FRONTEND_URL=http://your-domain.com

DATABASE_URL="file:./data/database.db"

OPENAI_API_KEY=your_key_here
CLAUDE_API_KEY=your_key_here

YOUTUBE_CLIENT_ID=your_id
YOUTUBE_CLIENT_SECRET=your_secret
YOUTUBE_REDIRECT_URI=http://your-domain.com/api/platform/youtube/callback

JWT_SECRET=your_very_secure_secret_key

LOG_LEVEL=info
```

### 5. 데이터베이스 설정
```bash
# Prisma 클라이언트 생성
npx prisma generate

# 마이그레이션 실행
npx prisma migrate deploy
```

### 6. 빌드
```bash
npm run build
```

### 7. 서버 시작
```bash
# PM2로 시작
pm2 start dist/index.js --name all-in-one-content-ai
pm2 save
pm2 startup  # 시스템 재시작 시 자동 시작
```

## 🔧 Nginx 리버스 프록시 설정

### Nginx 설정 파일 생성
```bash
sudo nano /etc/nginx/sites-available/all-in-one-content-ai
```

설정 내용:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Nginx 활성화
```bash
sudo ln -s /etc/nginx/sites-available/all-in-one-content-ai /etc/nginx/sites-enabled/
sudo nginx -t  # 설정 테스트
sudo systemctl reload nginx
```

## 🔒 SSL 인증서 설치 (Let's Encrypt)

```bash
sudo certbot --nginx -d your-domain.com
```

자동으로 HTTPS 설정이 완료됩니다.

## ✅ 배포 확인

### 서버 상태 확인
```bash
pm2 status
pm2 logs all-in-one-content-ai
```

### 헬스 체크
```bash
curl http://localhost:3001/api/health
```

또는 브라우저에서:
```
http://your-domain.com/api/health
```

## 🛠️ 문제 해결

### 문제 1: 포트가 이미 사용 중
```bash
# 포트 사용 확인
sudo lsof -i :3001

# 프로세스 종료
pm2 delete all-in-one-content-ai
```

### 문제 2: 데이터베이스 오류
```bash
# 데이터베이스 파일 확인
ls -la data/

# 마이그레이션 재실행
npx prisma migrate reset  # 개발 환경만
npx prisma migrate deploy   # 프로덕션
```

### 문제 3: 의존성 설치 실패
```bash
# npm 캐시 클리어
npm cache clean --force

# node_modules 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install
```

### 문제 4: FFmpeg 오류
```bash
# FFmpeg 재설치
sudo apt-get remove ffmpeg
sudo apt-get update
sudo apt-get install ffmpeg
```

## 📊 모니터링

### PM2 모니터링
```bash
pm2 monit
```

### 로그 확인
```bash
# 실시간 로그
pm2 logs all-in-one-content-ai

# 로그 파일 위치
tail -f logs/app.log
```

### 서버 리소스 확인
```bash
htop
df -h  # 디스크 사용량
free -h  # 메모리 사용량
```

## 🔄 업데이트 방법

### 코드 업데이트
```bash
cd /opt/all-in-one-content-ai/backend
git pull  # 또는 파일 업로드
npm install
npm run build
pm2 restart all-in-one-content-ai
```

### 데이터베이스 마이그레이션 업데이트
```bash
npx prisma migrate deploy
npx prisma generate
pm2 restart all-in-one-content-ai
```

## 📞 지원

문제가 발생하면:
1. 로그 확인: `pm2 logs all-in-one-content-ai`
2. 헬스 체크: `curl http://localhost:3001/api/health`
3. 서버 상태: `pm2 status`

## 🎉 완료!

배포가 완료되면:
- ✅ API 서버: `http://your-domain.com/api`
- ✅ 헬스 체크: `http://your-domain.com/api/health`
- ✅ 프론트엔드 연결 설정 필요

