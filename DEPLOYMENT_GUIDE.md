# 숏폼 백엔드 배포 가이드

## 전체 구조

```
[사용자 브라우저]
      ↓
[Netlify (freeshell 프론트)]
      ↓
[API 서버 (도메인 연결)]
      ↓
[Job Queue]
      ↓
[GPU 처리 노드]
   ├─ 개발: GPU 노트북
   └─ 운영: GPU 서버
```

## 디렉토리 구조

```
backend/shortform/
├── api/
│   └── server.py              # FastAPI 서버
├── services/
│   ├── job_queue.py           # 작업 큐
│   ├── job_manager.py         # 작업 관리
│   ├── prompt_refiner.py      # 프롬프트 정제
│   ├── script_generator.py    # 스크립트 생성
│   ├── scene_generator.py     # Scene 생성
│   ├── character_generator.py # 캐릭터 생성
│   ├── tts_generator.py       # TTS 생성
│   ├── subtitle_generator.py  # 자막 생성
│   └── video_renderer.py      # FFmpeg 렌더링
├── config.py                  # 설정 관리
└── requirements.txt           # 의존성
```

## 환경 설정

### 개발 환경 (GPU 노트북)

```bash
# .env
ENVIRONMENT=development
GPU_TYPE=laptop
MAX_CONCURRENT_JOBS=1
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1:8b-q4
STABLE_DIFFUSION_URL=http://localhost:7860
STABLE_DIFFUSION_ENABLED=false
TTS_ENGINE=edge
STORAGE_PATH=/tmp/shortform
VIDEO_STORAGE_PATH=/tmp/shortform/videos
JOB_STORAGE_PATH=/tmp/shortform/jobs
API_BASE_URL=http://localhost:8000
ALLOWED_ORIGINS=http://localhost:3000
```

### 운영 환경 (GPU 서버)

```bash
# .env
ENVIRONMENT=production
GPU_TYPE=server
MAX_CONCURRENT_JOBS=2
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1:8b-q4
STABLE_DIFFUSION_URL=http://localhost:7860
STABLE_DIFFUSION_ENABLED=true
TTS_ENGINE=edge
STORAGE_PATH=/var/shortform
VIDEO_STORAGE_PATH=/var/shortform/videos
JOB_STORAGE_PATH=/var/shortform/jobs
API_BASE_URL=https://api.your-domain.com
ALLOWED_ORIGINS=https://your-domain.com,https://your-netlify-domain.netlify.app
```

## 실행 방법

### 1. 의존성 설치

```bash
cd backend/shortform
pip install -r requirements.txt
```

### 2. 서버 실행

```bash
python api/server.py
```

또는

```bash
uvicorn api.server:app --host 0.0.0.0 --port 8000
```

## Netlify 프론트엔드 연동

### 1. API 프록시 설정

`app/api/studio/shortform/generate/route.ts`에서 백엔드 API 호출:

```typescript
const BACKEND_URL = process.env.SHORTFORM_BACKEND_URL || 'http://localhost:8000';

const response = await fetch(`${BACKEND_URL}/api/v1/generate`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(body),
});
```

### 2. 환경 변수 설정 (Netlify)

Netlify 대시보드에서 환경 변수 추가:

```
SHORTFORM_BACKEND_URL=https://api.your-domain.com
```

## API 엔드포인트

### 1. 숏폼 생성 요청

```http
POST /api/v1/generate
Content-Type: application/json

{
  "userPrompt": "고양이가 요리를 하는 숏폼",
  "style": "anime",
  "duration": 30,
  "userId": "user123"
}
```

응답:
```json
{
  "success": true,
  "jobId": "user123-abc12345-1234567890",
  "message": "Shortform generation started",
  "statusUrl": "/api/v1/job/user123-abc12345-1234567890/status"
}
```

### 2. 작업 상태 조회

```http
GET /api/v1/job/{jobId}/status
```

응답:
```json
{
  "jobId": "user123-abc12345-1234567890",
  "status": "processing",
  "progress": 50,
  "currentStep": "generating-voices",
  "videoUrl": null,
  "error": null
}
```

### 3. 영상 다운로드

```http
GET /api/v1/job/{jobId}/download
```

## GPU 노드 설정

### 개발 환경 (GPU 노트북)

1. Ollama 설치 및 실행
```bash
ollama serve
ollama pull llama3.1:8b-q4
```

2. Stable Diffusion (선택사항)
```bash
# stable-diffusion-webui 실행
./webui.sh --api --lowvram
```

3. Edge TTS (Python 패키지)
```bash
pip install edge-tts
```

### 운영 환경 (GPU 서버)

동일한 설정이지만:
- 더 많은 VRAM 사용 가능
- 동시 작업 2개 처리 가능
- 안정적인 전원 공급
- 전문 냉각 시스템

## 향후 확장

### 1. GPU 노드 추가

환경 변수에 여러 GPU 노드 URL 추가:
```
GPU_NODE_URLS=http://gpu-node-1:8000,http://gpu-node-2:8000
```

### 2. Redis 큐 도입

분산 큐를 위해 Redis 사용:
```python
# requirements.txt에 추가
redis==5.0.1
```

### 3. 클라우드 스토리지

S3 또는 GCS 사용:
```python
# requirements.txt에 추가
boto3==1.34.0  # AWS S3
```

---

**배포 가이드가 완성되었습니다!** 🚀
