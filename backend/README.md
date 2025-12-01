# 올인원 콘텐츠 AI - 백엔드 서버

올인원 콘텐츠 AI의 백엔드 API 서버입니다.

## 🚀 빠른 시작

### 자동 설치 (권장)

```bash
chmod +x install.sh
./install.sh
```

### 수동 설치

```bash
# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env
# .env 파일을 열어서 API 키 설정

# 빌드
npm run build

# 개발 서버 실행
npm run dev

# 프로덕션 서버 실행
npm start
```

## 🐳 Docker 사용

### Docker Compose (가장 간단)

```bash
docker-compose up -d
```

### Docker 직접 사용

```bash
docker build -t all-in-one-content-ai .
docker run -p 3001:3001 --env-file .env all-in-one-content-ai
```

## 🔧 자동 환경 설정

서버가 시작될 때 자동으로:
- ✅ 서버 환경 감지 (OS, Node.js 버전 등)
- ✅ 필요한 도구 확인 (Docker, FFmpeg 등)
- ✅ .env 파일 자동 생성
- ✅ 필요한 디렉토리 자동 생성

## 📋 필수 요구사항

- Node.js 18 이상
- FFmpeg (비디오 처리용, 선택)
- Docker (선택, 자동 배포용)

## 🔑 환경 변수 설정

`.env` 파일을 생성하고 다음 값들을 설정하세요:

```env
# AI API Keys (최소 하나는 필요)
OPENAI_API_KEY=your_key_here
# 또는
CLAUDE_API_KEY=your_key_here

# YouTube API (업로드 기능 사용 시)
YOUTUBE_CLIENT_ID=your_client_id
YOUTUBE_CLIENT_SECRET=your_client_secret
```

## 📡 API 엔드포인트

### Health Check
```
GET /api/health
```

### 콘텐츠 생성
```
POST /api/content/generate
Content-Type: multipart/form-data

{
  topic: string
  contentType: string
  contentTime: number
  contentFormat: string[]
  text: string
  images?: File[]
  videos?: File[]
}
```

### 콘텐츠 조회
```
GET /api/content/:id
```

### 플랫폼 인증 확인
```
GET /api/platform/:platform/verify
```

### 콘텐츠 업로드
```
POST /api/upload
{
  contentId: string
  platforms: PlatformConfig[]
}
```

## 🛠️ 기술 스택

- **Runtime**: Node.js + TypeScript
- **Framework**: Express
- **AI**: OpenAI API / Claude API
- **비디오 처리**: FFmpeg
- **플랫폼 연동**: Google APIs (YouTube)

## 📝 개발

```bash
# 개발 모드 (핫 리로드)
npm run dev

# 빌드
npm run build

# 프로덕션 실행
npm start
```

## 🔍 문제 해결

### FFmpeg 오류
FFmpeg가 설치되어 있지 않으면 비디오 처리 기능이 작동하지 않습니다.
- macOS: `brew install ffmpeg`
- Ubuntu: `sudo apt-get install ffmpeg`
- Windows: https://ffmpeg.org/download.html

### 포트 충돌
다른 포트를 사용하려면 `.env` 파일에서 `PORT` 값을 변경하세요.

### API 키 오류
`.env` 파일에 올바른 API 키가 설정되어 있는지 확인하세요.
