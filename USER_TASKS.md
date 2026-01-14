# 📋 사용자가 할 수 있는 업무

## ✅ Ollama 설치 및 설정 (즉시)

### 1. Ollama 설치
- [x] Ollama 다운로드 완료
- [ ] Ollama 설치 실행
- [ ] 설치 완료 확인

### 2. 모델 다운로드 (5-10분)
터미널에서 실행:

```bash
# 추천: 가장 빠르고 좋은 모델
ollama pull llama3.1:8b

# 백업용 (선택)
ollama pull mistral
```

### 3. Ollama 작동 확인
```bash
# 버전 확인
ollama --version

# 모델 목록 확인
ollama list

# 브라우저에서 확인
# http://localhost:11434 접속
```

### 4. Shell에서 테스트
- [ ] `/editor` 페이지 접속
- [ ] "AI 튜터" 버튼 클릭
- [ ] 질문 입력
- [ ] 콘솔(F12)에서 "Ollama 로컬 LLM 성공" 확인

---

## 🧪 기능 테스트 (10-15분)

### 1. Monaco Editor 테스트
- [ ] `/editor` 페이지 접속
- [ ] "Monaco 에디터 ⭐" 버튼 클릭
- [ ] VS Code 수준의 편집 경험 확인
- [ ] 코드 하이라이팅 확인
- [ ] 자동완성 확인
- [ ] 다크 모드 전환 확인

### 2. AI 코드 제안 테스트
- [ ] Monaco 에디터에서 코드 작성
- [ ] "AI 분석" 버튼 클릭
- [ ] Diff 형식 제안 확인
- [ ] 제안 적용 테스트
- [ ] 코드가 덮어쓰지 않고 수정되는지 확인

### 3. AI 튜터 패널 테스트
- [ ] "AI 튜터" 버튼 클릭
- [ ] 오른쪽 패널 표시 확인
- [ ] 빠른 프롬프트 버튼 테스트
- [ ] 코드 설명 요청
- [ ] 대화가 기억되는지 확인

### 4. 무료 AI 작동 확인
- [ ] 브라우저 콘솔 열기 (F12)
- [ ] AI 요청 시 로그 확인
- [ ] "Groq API 성공" 또는 "Ollama 성공" 메시지 확인
- [ ] 응답 속도 확인

---

## 📝 피드백 수집 (10-15분)

### UI/UX 피드백
- [ ] Monaco Editor가 편리한가?
- [ ] AI 튜터 패널 위치가 적절한가?
- [ ] 버튼 배치가 직관적인가?
- [ ] 응답 속도가 만족스러운가?
- [ ] 개선이 필요한 부분 메모

### 기능 피드백
- [ ] Diff 제안이 명확한가?
- [ ] AI 설명이 도움이 되는가?
- [ ] 빠른 프롬프트가 유용한가?
- [ ] 대화 메모리가 잘 작동하는가?
- [ ] 추가로 필요한 기능 메모

### 버그 리포트
- [ ] 오류 발생 시 스크린샷
- [ ] 콘솔 에러 메시지 복사
- [ ] 재현 방법 기록

---

## 🎯 추가로 할 수 있는 것

### 1. 환경 변수 설정 (선택)
`.env.local` 파일에 추가:

```env
# Groq API (환경 변수에 설정 필요)
GROQ_API_KEY=your_groq_api_key_here

# Ollama URL (기본값 사용 시 불필요)
OLLAMA_URL=http://localhost:11434

# Together AI (선택)
TOGETHER_API_KEY=your_together_api_key

# OpenRouter (선택)
OPENROUTER_API_KEY=your_openrouter_api_key
```

### 2. 모델 추가 다운로드 (선택)
더 많은 모델을 다운로드하면 Shell이 자동으로 사용:

```bash
# 다양한 모델 시도
ollama pull llama3.1:70b    # 최고 품질 (느림)
ollama pull llama3.1:8b      # 빠르고 좋음 ⭐
ollama pull mistral          # 경량, 고품질
ollama pull gemma            # Google 모델
ollama pull phi3             # 매우 경량
```

### 3. 테스트 프로젝트 생성
- [ ] 간단한 HTML/CSS/JS 프로젝트 생성
- [ ] AI 코드 제안 테스트
- [ ] AI 튜터로 코드 설명 요청
- [ ] Diff 제안 적용 테스트

### 4. 성능 테스트
- [ ] Groq API 응답 속도 측정
- [ ] Ollama 응답 속도 측정
- [ ] 여러 모델 비교
- [ ] 최적 모델 선택

---

## 🚀 다음 단계 결정

테스트 후 알려주세요:
1. **Monaco Editor**: 만족스러운가? 개선이 필요한가?
2. **AI 튜터**: 유용한가? 추가 기능이 필요한가?
3. **Diff 제안**: 명확한가? 더 개선할 부분이 있는가?
4. **대화 메모리**: 잘 작동하는가? 개선이 필요한가?

피드백을 주시면 그에 맞춰 다음 단계를 진행하겠습니다!

---

## 💡 팁

### Ollama 최적화
- **GPU가 있으면**: 자동으로 GPU 사용 (빠름)
- **GPU가 없으면**: CPU 사용 (느릴 수 있음)
- **메모리 부족 시**: 작은 모델 사용 (`llama3.1:8b`, `phi3`)

### Shell 최적화
- **가장 빠른 조합**: Groq API + Ollama (로컬)
- **완전 무료 조합**: Ollama만 사용
- **백업 조합**: Groq + Together + OpenRouter

---

**지금 바로 Ollama 모델을 다운로드하고 테스트해보세요!** 🚀
