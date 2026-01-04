# 무료 AI 서비스 옵션 가이드

## ⚠️ 현재 상황

현재 시스템은 **OpenAI API**를 기본으로 사용하며, 이것은 **유료 서비스**입니다. 하지만 **완전히 무료**로 사용할 수 있는 대안들이 있습니다!

## ❓ 질문: 돈을 내야 하나요?

**답변: 아니요! 무료 옵션이 있습니다.**

OpenAI API는 유료이지만, 아래 무료 대안을 사용하면 비용 없이 AI 기능을 사용할 수 있습니다.

## 🆓 완전 무료 옵션 (추천!)

### 옵션 1: Google Gemini API (무료 티어) ⭐ 추천

**장점:**
- ✅ **완전히 무료** (일일 요청 제한 있지만 개인 사용에는 충분)
- ✅ 가입만 하면 즉시 사용 가능
- ✅ Google의 강력한 AI 모델 사용
- ✅ 이미 코드베이스에 통합 가능 (GOOGLE_API_KEY 지원)

**설정 방법:**
1. [Google AI Studio](https://makersuite.google.com/app/apikey) 접속
2. Google 계정으로 로그인
3. "Create API Key" 클릭
4. Netlify 환경 변수에 추가: `GOOGLE_API_KEY=your-key-here`

**단점:**
- ⚠️ 일일 요청 제한 (하지만 개인 사용에는 충분)
- ⚠️ 상업적 사용 시 제한 있을 수 있음

### 옵션 2: Hugging Face Inference API (무료)

**장점:**
- ✅ 완전히 무료
- ✅ 가입만 하면 즉시 사용 가능
- ✅ 다양한 오픈소스 AI 모델 사용 가능
- ✅ API 키 발급 간단

**단점:**
- ⚠️ 일일 요청 제한 (하지만 개인 사용에는 충분)
- ⚠️ 응답 속도가 OpenAI보다 느릴 수 있음

**설정 방법:**
1. [Hugging Face](https://huggingface.co/) 가입 (무료)
2. Settings → Access Tokens → New token 생성
3. Netlify 환경 변수에 추가: `HUGGINGFACE_API_KEY=your-token-here`

### 옵션 3: Groq API (무료 티어)

**장점:**
- ✅ 매우 빠른 응답 속도
- ✅ 무료 티어 제공 (일일 요청 제한)
- ✅ OpenAI와 유사한 API 형식

**단점:**
- ⚠️ 사용량 제한 (하지만 개인 사용에는 충분)

**설정 방법:**
1. [Groq](https://console.groq.com/) 가입 (무료)
2. API Keys → Create API Key
3. Netlify 환경 변수에 추가: `GROQ_API_KEY=your-key-here`

### 옵션 4: Ollama (로컬 실행)

**장점:**
- ✅ 완전히 무료
- ✅ 인터넷 연결 불필요
- ✅ 데이터 프라이버시 보장

**단점:**
- ⚠️ 로컬 컴퓨터에 설치 필요
- ⚠️ Netlify 등 클라우드 호스팅에서는 사용 불가 (로컬 개발만 가능)
- ⚠️ 하드웨어 사양에 따라 성능 제한

**설정 방법:**
1. [Ollama](https://ollama.ai/) 다운로드 및 설치
2. 로컬에서 모델 다운로드: `ollama pull llama2`
3. 로컬 개발 환경에서만 사용 가능

## 💰 유료 옵션 (비교)

### OpenAI API
- 가격: 사용량 기반 (약 $0.01-0.06 per 1K tokens)
- 장점: 최고 품질, 빠른 응답
- 단점: 유료

### Anthropic Claude API
- 가격: 사용량 기반
- 장점: 긴 컨텍스트, 우수한 품질
- 단점: 유료

## 🎯 권장 사항

### 완전 무료로 시작하기 (가장 추천!)
1. **Google Gemini API** 사용
   - 가장 간단하고 빠르게 시작 가능
   - 코드베이스에 이미 지원됨
   - 무료 티어 제공

2. 필요시 **Groq API** 추가
   - 더 빠른 응답 속도
   - 무료 티어 제공

### 개발/테스트용
- **Google Gemini API** 또는 **Groq API** 추천
- 무료이고 설정이 간단함
- 실제 AI 응답 제공

### 프로덕션 (소규모/개인)
- **Google Gemini API** (무료 티어)
- **Groq API** (무료 티어)
- 무료로 충분히 사용 가능

### 프로덕션 (대규모/상업용)
- **OpenAI API** 또는 **Anthropic Claude API**
- 최고 품질과 안정성
- 비용 발생하지만 비즈니스 가치가 있음

## 🔧 코드에 무료 옵션 추가하기

현재 코드베이스에 Hugging Face 또는 Groq API 지원을 추가할 수 있습니다. 원하시면 구현해드리겠습니다!

**추가할 수 있는 기능:**
1. Hugging Face Inference API 통합
2. Groq API 통합
3. 환경 변수에 따라 자동으로 무료/유료 API 선택
4. API 키가 없을 때 무료 API로 자동 전환

## 📝 요약

**질문: 자체적으로 동작하는 AI 환경을 만들어 줘도 돈내고 가입해서 사용해야 하는거야?**

**답변:**
- ❌ **아니요!** 완전히 무료 옵션이 있습니다
- ✅ **Google Gemini API** - 무료 티어, 가입만 하면 사용 가능 (⭐ 가장 추천!)
- ✅ **Groq API** - 무료 티어 제공
- ✅ **Hugging Face** - 무료, 가입만 하면 사용 가능
- ✅ **Ollama** - 로컬에서 완전 무료 (클라우드 호스팅 불가)

**중요:**
- OpenAI API는 **유료**입니다 (사용량에 따라 비용 발생)
- 하지만 **무료 대안**으로 완전히 대체 가능합니다!
- 현재 코드베이스는 이미 Google Gemini API를 지원합니다 (`GOOGLE_API_KEY`)
- Netlify 환경 변수에 `GOOGLE_API_KEY`만 설정하면 무료로 사용 가능합니다!

## 🚀 즉시 시작하기 (무료)

1. [Google AI Studio](https://makersuite.google.com/app/apikey) 접속
2. Google 계정으로 로그인 (무료)
3. "Create API Key" 클릭
4. Netlify 환경 변수에 추가:
   - Key: `GOOGLE_API_KEY`
   - Value: 생성된 API 키
5. 재배포
6. 완료! 무료로 AI 기능 사용 가능 🎉

