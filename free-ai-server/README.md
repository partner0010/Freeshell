# 완전 무료 AI API 서버

Ollama 기반 완전 무료 오픈소스 AI API 서버

## 🚀 빠른 시작

### 1. 필수 요구사항

- Python 3.9+
- Ollama 설치 및 실행 중
- 필요한 모델 다운로드

### 2. Ollama 설정

```bash
# Ollama 설치 (이미 설치되어 있으면 생략)
# https://ollama.ai/download

# 필요한 모델 다운로드
ollama pull llama3.1:8b
ollama pull deepseek-coder:6.7b
ollama pull qwen2.5:7b

# Ollama 서버 실행 확인
curl http://localhost:11434/api/tags
```

### 3. 서버 설치 및 실행

```bash
# 의존성 설치
pip install -r requirements.txt

# 환경 변수 설정 (선택사항)
cp .env.example .env

# 서버 실행
python -m app.main

# 또는 uvicorn 직접 실행
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 4. API 테스트

```bash
# 헬스체크
curl http://localhost:8000/health

# 텍스트 생성
curl -X POST http://localhost:8000/generate/text \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "인공지능의 미래에 대해 설명해주세요.",
    "max_tokens": 500
  }'

# 코드 생성
curl -X POST http://localhost:8000/generate/code \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "사용자 인증을 위한 JWT 토큰 생성 함수",
    "language": "python",
    "include_comments": true
  }'

# 프롬프트 최적화
curl -X POST http://localhost:8000/generate/prompt \
  -H "Content-Type: application/json" \
  -d '{
    "original_prompt": "코드 만들어줘",
    "purpose": "code",
    "style": "professional"
  }'
```

## 📚 API 문서

서버 실행 후 다음 URL에서 API 문서 확인:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 🔧 설정

`.env` 파일에서 설정 변경:

```env
# Ollama URL
OLLAMA_BASE_URL=http://localhost:11434

# 기본 모델
DEFAULT_TEXT_MODEL=llama3.1:8b
DEFAULT_CODE_MODEL=deepseek-coder:6.7b
DEFAULT_PROMPT_MODEL=qwen2.5:7b

# 서버 포트
API_PORT=8000
```

## 📊 성능 최적화

### 1. 모델 선택
- **텍스트 생성**: `llama3.1:8b` (빠르고 좋음)
- **코드 생성**: `deepseek-coder:6.7b` (코드 특화)
- **다목적**: `qwen2.5:7b` (균형잡힌 성능)

### 2. GPU 가속
Ollama는 자동으로 GPU를 사용합니다 (있는 경우).

### 3. 확장성
- 여러 Ollama 인스턴스 실행 가능
- 로드 밸런서로 분산 가능
- 캐시 레이어 추가 가능

## 🐛 문제 해결

### Ollama 연결 실패
```bash
# Ollama 서버 실행 확인
ollama serve

# 포트 확인
curl http://localhost:11434/api/tags
```

### 모델이 없음
```bash
# 모델 다운로드
ollama pull llama3.1:8b
```

### 메모리 부족
더 작은 모델 사용:
```bash
ollama pull phi3  # 매우 경량
```

## 📝 라이센스

MIT License
