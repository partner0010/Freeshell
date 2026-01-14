# 숏폼 자동 생성 백엔드

AI 기반 숏폼 영상 자동 생성 백엔드 서버

## 기능

- 프롬프트 기반 스크립트 생성 (Ollama LLM)
- Scene JSON 자동 생성
- 캐릭터 이미지 생성 (Stable Diffusion 또는 기본 이미지)
- TTS 음성 생성 (Edge TTS)
- 자막 자동 생성
- FFmpeg 기반 영상 렌더링

## 설치

### 1. 의존성 설치

```bash
pip install -r requirements.txt
```

### 2. 환경 변수 설정

`env.example.txt`를 `.env`로 복사하고 설정:

```bash
cp env.example.txt .env
# .env 파일 편집
```

### 3. 기본 에셋 생성 (선택사항)

```bash
python scripts/setup_assets.py
```

### 4. 서버 실행

```bash
# Linux/Mac
bash scripts/start_server.sh

# Windows
scripts\start_server.bat

# 또는 직접 실행
python api/server.py
```

## API 엔드포인트

### 1. 숏폼 생성

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

### 2. 작업 상태 조회

```http
GET /api/v1/job/{jobId}/status
```

### 3. 영상 다운로드

```http
GET /api/v1/job/{jobId}/download
```

## 필수 요구사항

- Python 3.8+
- FFmpeg (영상 렌더링용)
- Ollama (LLM용, 선택사항)
- Stable Diffusion (이미지 생성용, 선택사항)

## 환경 변수

- `ENVIRONMENT`: development | production
- `GPU_TYPE`: laptop | server
- `MAX_CONCURRENT_JOBS`: 동시 작업 수 (기본: 1)
- `OLLAMA_URL`: Ollama 서버 URL
- `OLLAMA_MODEL`: 사용할 모델 (예: llama3.1:8b-q4)
- `STABLE_DIFFUSION_URL`: Stable Diffusion 서버 URL
- `TTS_ENGINE`: edge | coqui
- `STORAGE_PATH`: 파일 저장 경로

## 문제 해결

### FFmpeg 오류
FFmpeg가 설치되어 있는지 확인:
```bash
ffmpeg -version
```

### Ollama 연결 오류
Ollama가 실행 중인지 확인:
```bash
ollama serve
```

### 포트 충돌
`.env` 파일에서 `PORT` 변경
