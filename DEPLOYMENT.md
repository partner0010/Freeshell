# 배포 가이드 - 올인원 콘텐츠 AI

## 🚀 자동 배포 (가장 간단)

### 방법 1: Docker Compose (권장)

```bash
cd backend
docker-compose up -d
```

끝! 서버가 자동으로 시작됩니다.

### 방법 2: 자동 설치 스크립트

```bash
cd backend
chmod +x install.sh
./install.sh
npm start
```

## 📦 수동 배포

### 1. 서버 준비

어떤 서버든 상관없습니다:
- AWS EC2
- Google Cloud
- Azure
- DigitalOcean
- 로컬 서버
- 집에 있는 컴퓨터

### 2. 필수 요구사항 설치

#### Node.js 설치
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# macOS
brew install node

# Windows
# https://nodejs.org 에서 다운로드
```

#### FFmpeg 설치 (비디오 처리용)
```bash
# Ubuntu/Debian
sudo apt-get install ffmpeg

# macOS
brew install ffmpeg

# Windows
# https://ffmpeg.org/download.html
```

### 3. 프로젝트 배포

```bash
# 프로젝트 클론 또는 업로드
git clone <your-repo>
cd TinTop/backend

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env
nano .env  # API 키 설정

# 빌드
npm run build

# 서버 시작
npm start
```

### 4. PM2로 백그라운드 실행 (선택)

```bash
# PM2 설치
npm install -g pm2

# 서버 시작
pm2 start dist/index.js --name "content-ai"

# 자동 재시작 설정
pm2 startup
pm2 save
```

## 🔧 환경 변수 설정

`.env` 파일에 다음 값들을 설정하세요:

```env
# 필수
OPENAI_API_KEY=sk-... 또는 CLAUDE_API_KEY=sk-ant-...

# 선택 (YouTube 업로드 사용 시)
YOUTUBE_CLIENT_ID=...
YOUTUBE_CLIENT_SECRET=...
```

## 🌐 프론트엔드 연결

프론트엔드의 `.env` 파일에 백엔드 URL 설정:

```env
VITE_API_BASE_URL=http://your-server-ip:3001/api
```

## 🔒 보안 설정

### 방화벽 설정
```bash
# 포트 3001 열기
sudo ufw allow 3001
```

### Nginx 리버스 프록시 (선택)

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 📊 모니터링

### 로그 확인
```bash
# Docker 사용 시
docker-compose logs -f

# 직접 실행 시
tail -f logs/combined.log
```

### Health Check
```bash
curl http://localhost:3001/api/health
```

## 🐛 문제 해결

### 포트가 이미 사용 중
`.env` 파일에서 `PORT` 값을 변경하세요.

### FFmpeg 오류
FFmpeg가 설치되어 있는지 확인:
```bash
ffmpeg -version
```

### 데이터베이스 오류
SQLite는 자동으로 생성됩니다. 권한 문제가 있으면:
```bash
chmod 755 data/
```

## ✅ 배포 확인

1. 백엔드 서버 실행 확인
   ```bash
   curl http://localhost:3001/api/health
   ```

2. 프론트엔드에서 API 연결 확인
   - 브라우저 개발자 도구 → Network 탭
   - API 요청이 성공하는지 확인

3. 콘텐츠 생성 테스트
   - 프론트엔드에서 콘텐츠 생성 시도
   - 백엔드 로그 확인

## 🎉 완료!

이제 어디서든 프로그램을 실행할 수 있습니다!

