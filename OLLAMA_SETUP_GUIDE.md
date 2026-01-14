# 🏠 Ollama 설치 및 설정 가이드

Ollama를 다운로드하셨다면, 이제 설치하고 모델을 다운로드하면 됩니다!

## 📥 Ollama 설치

### Windows
1. 다운로드한 설치 파일 실행
2. 설치 마법사 따라하기
3. 설치 완료 후 자동으로 Ollama 서비스 시작

### Mac
1. 다운로드한 `.dmg` 파일 실행
2. Ollama를 Applications 폴더로 드래그
3. Applications에서 Ollama 실행

### Linux
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

## 🚀 첫 실행

### 1. Ollama 서비스 시작
설치 후 Ollama가 자동으로 실행됩니다. 터미널에서 확인:

```bash
# Windows (PowerShell)
ollama --version

# Mac/Linux
ollama --version
```

### 2. 모델 다운로드
Shell에서 사용할 모델을 다운로드하세요:

```bash
# 추천 모델 (가장 빠르고 좋음)
ollama pull llama3.1

# 또는 더 작은 모델 (빠른 응답)
ollama pull llama3.1:8b

# Mistral (경량, 고품질)
ollama pull mistral

# Google Gemma (경량)
ollama pull gemma

# Phi-3 (매우 경량)
ollama pull phi3
```

### 3. 모델 확인
다운로드한 모델 확인:

```bash
ollama list
```

## ✅ Shell 연동 확인

### 1. Ollama 서비스 확인
브라우저에서 접속:
```
http://localhost:11434
```

응답이 오면 정상 작동 중입니다!

### 2. Shell에서 테스트
1. `/editor` 페이지 접속
2. "AI 튜터" 버튼 클릭
3. 질문 입력
4. 콘솔(F12)에서 "Ollama 로컬 LLM 성공" 메시지 확인

## 🎯 추천 모델 조합

### 최고 품질 (권장)
```bash
ollama pull llama3.1        # 70B (최고 품질, 느림)
ollama pull llama3.1:8b     # 8B (빠르고 좋음) ⭐ 추천
```

### 균형잡힌 조합
```bash
ollama pull llama3.1:8b     # 빠르고 좋음
ollama pull mistral          # 백업용
```

### 경량 조합 (저사양 PC)
```bash
ollama pull phi3            # 매우 빠름
ollama pull gemma:2b        # 초경량
```

## 🔧 문제 해결

### Ollama가 실행되지 않을 때
```bash
# Windows
# 작업 관리자에서 "Ollama" 프로세스 확인
# 없으면 Ollama 앱을 다시 실행

# Mac/Linux
ollama serve
```

### 포트 충돌
기본 포트(11434)가 사용 중이면:
```bash
# 환경 변수 설정
export OLLAMA_URL=http://localhost:11435
```

Shell의 `.env.local`에 추가:
```env
OLLAMA_URL=http://localhost:11435
```

### 모델이 너무 느릴 때
더 작은 모델 사용:
```bash
ollama pull llama3.1:8b    # 8B 모델 (빠름)
ollama pull phi3           # Phi-3 (매우 빠름)
```

## 💡 사용 팁

### 1. 여러 모델 설치
Shell은 자동으로 사용 가능한 모델을 찾아 사용합니다:
- `llama3.1` → `llama3` → `mistral` → `gemma` → `phi3` → `llama2`

### 2. 모델 우선순위
Shell은 다음 순서로 모델을 시도합니다:
1. `llama3.1` (최신)
2. `llama3`
3. `mistral`
4. `gemma`
5. `phi3`
6. `llama2`

### 3. GPU 가속
Ollama는 자동으로 GPU를 사용합니다 (있는 경우).
GPU가 없어도 CPU로 작동하지만 느릴 수 있습니다.

## 🎉 완료!

이제 Shell에서 완전 무료로 GPT 수준의 AI를 사용할 수 있습니다!

### 테스트 방법
1. Ollama 실행 확인
2. 모델 다운로드
3. Shell 에디터에서 "AI 튜터" 사용
4. 콘솔에서 "Ollama 로컬 LLM 성공" 확인

---

**참고**: Ollama가 설치되지 않아도 Shell은 자동으로 다른 무료 AI(Groq, Together, OpenRouter 등)를 사용합니다!
