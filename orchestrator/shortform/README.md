# 숏폼 생성 MVP

## 개요

AI Orchestrator 위에서 동작하는 숏폼 자동 생성 백엔드

## 구조

```
orchestrator/shortform/
├── api.py                 # FastAPI 엔드포인트
├── job_manager.py        # Job 관리
├── shortform_generator.py # 숏폼 생성기
├── script_generator.py    # 스크립트 생성
├── scene_generator.py    # Scene JSON 생성
├── voice_generator.py    # 음성 생성 (TTS)
└── subtitle_generator.py # 자막 생성
```

## 실행 흐름

1. API 요청 수신 (`/api/shortform/generate`)
2. Job 생성
3. Script 생성 (AI or Rule)
4. Scene JSON 생성
5. 음성 생성 (edge-tts)
6. 자막 생성
7. FFmpeg 렌더링
8. 결과 저장 및 반환

## 사용 방법

### 1. 서버 실행

```bash
cd orchestrator/shortform
python api.py
```

또는

```bash
uvicorn orchestrator.shortform.api:app --host 0.0.0.0 --port 8000
```

### 2. API 호출

```bash
curl -X POST "http://localhost:8000/api/shortform/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "행복한 일상 영상을 만들어주세요",
    "duration": 30,
    "style": "animation"
  }'
```

### 3. 작업 상태 조회

```bash
curl "http://localhost:8000/api/shortform/status/{job_id}"
```

### 4. 영상 다운로드

```bash
curl "http://localhost:8000/api/shortform/download/{job_id}" -o video.mp4
```

## 필수 의존성

```bash
pip install fastapi uvicorn edge-tts ffmpeg-python
```

## 파일 저장 구조

```
storage/
├── jobs/              # Job 정보 (JSON)
│   └── {job_id}.json
├── voices/            # 생성된 음성 파일
│   └── voice_*.mp3
└── videos/            # 최종 영상 파일
    └── {job_id}.mp4
```

## Fallback 처리

- Script 생성 실패 → 규칙 기반 템플릿
- Scene 생성 실패 → 기본 Scene 구조
- 음성 생성 실패 → 기본 음성 파일 또는 무음
- 렌더링 실패 → 에러 반환

## GPU/CPU 분기

`RendererFactory`가 자동으로 GPU/CPU 선택:
- GPU 사용 가능: `h264_nvenc` (NVIDIA) 또는 `h264_amf` (AMD)
- GPU 없음: `libx264` (CPU)
