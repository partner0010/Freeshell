# 문제 해결 가이드

## 일반적인 문제

### 1. 서버 시작 실패

**증상**: `ModuleNotFoundError` 또는 import 오류

**해결**:
```bash
cd backend/shortform
pip install -r requirements.txt
```

### 2. Ollama 연결 실패

**증상**: `Connection refused` 또는 타임아웃

**해결**:
```bash
# Ollama가 실행 중인지 확인
ollama serve

# 모델이 설치되어 있는지 확인
ollama list
```

### 3. FFmpeg 오류

**증상**: `FFmpeg error` 또는 파일 생성 실패

**해결**:
```bash
# FFmpeg 설치 확인
ffmpeg -version

# Windows: https://ffmpeg.org/download.html
# Linux: sudo apt install ffmpeg
# Mac: brew install ffmpeg
```

### 4. Edge TTS 오류

**증상**: 음성 생성 실패

**해결**:
```bash
# Edge TTS 재설치
pip install --upgrade edge-tts

# 인터넷 연결 확인 (Edge TTS는 인터넷 필요)
```

### 5. 작업 큐가 작동하지 않음

**증상**: 작업이 큐에 추가되지만 처리되지 않음

**해결**:
- 서버 로그 확인
- `MAX_CONCURRENT_JOBS` 설정 확인
- 이벤트 루프 문제일 수 있음 (서버 재시작)

### 6. 비디오 파일이 생성되지 않음

**증상**: 렌더링은 성공했지만 파일이 없음

**해결**:
- `VIDEO_STORAGE_PATH` 권한 확인
- 디스크 공간 확인
- FFmpeg 출력 확인

## 환경별 문제

### Windows

**문제**: 경로 구분자 (`/` vs `\`)

**해결**: `os.path.join` 사용 (이미 적용됨)

### Linux/Mac

**문제**: 권한 오류

**해결**:
```bash
chmod +x scripts/start_server.sh
```

## 디버깅 팁

### 1. 로그 확인

```bash
# 서버 로그에서 오류 확인
python api/server.py
```

### 2. 작업 상태 확인

```bash
# 작업 파일 확인
ls -la /tmp/shortform/jobs/
```

### 3. API 테스트

```bash
# Health check
curl http://localhost:8000/health

# 작업 생성
curl -X POST http://localhost:8000/api/v1/generate \
  -H "Content-Type: application/json" \
  -d '{"userPrompt":"test","style":"anime","duration":15,"userId":"test"}'
```

## 성능 최적화

### GPU 노트북

- `MAX_CONCURRENT_JOBS=1` 유지
- `OLLAMA_MODEL=llama3.1:8b-q4` 사용 (양자화)
- `STABLE_DIFFUSION_ENABLED=false` (기본 이미지 사용)

### GPU 서버

- `MAX_CONCURRENT_JOBS=2` 가능
- 전체 모델 사용 가능
- Stable Diffusion 활성화 가능
