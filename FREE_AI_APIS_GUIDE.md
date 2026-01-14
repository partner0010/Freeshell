# 완전 무료 AI API 가이드

이 문서는 Shell에서 사용 가능한 완전 무료 AI API 목록과 설정 방법을 안내합니다.

## 🆓 API 키 없이 사용 가능한 서비스

### 1. Hugging Face 공개 모델
- **API 키 필요**: ❌ 없음
- **무료 한도**: 제한적 (Rate limit 있음)
- **모델**: DialoGPT, GPT-2, DistilGPT-2 등
- **설정**: 환경 변수 불필요
- **장점**: 완전 무료, API 키 불필요
- **단점**: 응답 품질이 낮을 수 있음, Rate limit

## 🔑 API 키 필요하지만 완전 무료 티어 제공

### 2. Groq API ⚡ (추천)
- **API 키 필요**: ✅ 필요 (무료로 발급)
- **무료 한도**: 매우 넉넉함
- **모델**: Llama 3.1 70B, Mixtral 등
- **설정**: `GROQ_API_KEY` 환경 변수
- **장점**: 매우 빠름, 무료 한도 넉넉, 고품질
- **단점**: API 키 발급 필요
- **가입**: https://console.groq.com/

### 3. Together AI
- **API 키 필요**: ✅ 필요 (무료로 발급)
- **무료 한도**: 제한적
- **모델**: Llama 3, Mistral 등
- **설정**: `TOGETHER_API_KEY` 환경 변수
- **장점**: 다양한 오픈소스 모델
- **단점**: API 키 발급 필요
- **가입**: https://together.ai/

### 4. OpenRouter
- **API 키 필요**: ✅ 필요 (무료로 발급)
- **무료 한도**: 제한적
- **모델**: Google Gemini Flash 등
- **설정**: `OPENROUTER_API_KEY` 환경 변수
- **장점**: 여러 모델 통합 접근
- **단점**: API 키 발급 필요
- **가입**: https://openrouter.ai/

### 5. Cohere
- **API 키 필요**: ✅ 필요 (무료로 발급)
- **무료 한도**: 제한적
- **모델**: Command 모델
- **설정**: `COHERE_API_KEY` 환경 변수
- **장점**: 좋은 한국어 지원
- **단점**: API 키 발급 필요
- **가입**: https://cohere.com/

### 6. AI21 Labs
- **API 키 필요**: ✅ 필요 (무료로 발급)
- **무료 한도**: 제한적
- **모델**: J2 Mid 등
- **설정**: `AI21_API_KEY` 환경 변수
- **장점**: 고품질 텍스트 생성
- **단점**: API 키 발급 필요
- **가입**: https://www.ai21.com/

### 7. Perplexity
- **API 키 필요**: ✅ 필요 (무료로 발급)
- **무료 한도**: 제한적
- **모델**: Llama 3.1 Sonar (검색 기반)
- **설정**: `PERPLEXITY_API_KEY` 환경 변수
- **장점**: 실시간 웹 검색 통합
- **단점**: API 키 발급 필요
- **가입**: https://www.perplexity.ai/

## 📝 환경 변수 설정 방법

### 로컬 개발 환경
`.env.local` 파일에 추가:
```env
# Groq API (추천 - 매우 빠름)
GROQ_API_KEY=your_groq_api_key_here

# Together AI
TOGETHER_API_KEY=your_together_api_key_here

# OpenRouter
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Cohere
COHERE_API_KEY=your_cohere_api_key_here

# AI21 Labs
AI21_API_KEY=your_ai21_api_key_here

# Perplexity
PERPLEXITY_API_KEY=your_perplexity_api_key_here
```

### 배포 환경 (Vercel/Netlify)
1. Vercel: Settings > Environment Variables
2. Netlify: Site settings > Environment variables

## 🚀 사용 우선순위

Shell은 다음 순서로 무료 AI 서비스를 시도합니다:

1. **Hugging Face 공개 모델** (API 키 불필요)
2. **Together AI** (API 키 있으면)
3. **OpenRouter** (API 키 있으면)
4. **Groq API** (API 키 있으면) ⚡ 가장 빠름
5. **Cohere** (API 키 있으면)
6. **AI21 Labs** (API 키 있으면)
7. **Perplexity** (API 키 있으면)
8. **Replicate** (API 키 있으면)
9. **Fallback** (규칙 기반 응답)

## 💡 추천 설정

최고의 무료 AI 경험을 위해 다음을 설정하세요:

1. **Groq API** - 가장 빠르고 무료 한도가 넉넉함
2. **Together AI** - 백업용
3. **OpenRouter** - 다양한 모델 접근

## ⚠️ 주의사항

- 모든 무료 티어는 사용량 제한이 있습니다
- API 키는 각 서비스 웹사이트에서 무료로 발급받을 수 있습니다
- 프로덕션 환경에서는 Rate limiting을 고려하세요
- API 키는 절대 공개 저장소에 커밋하지 마세요

## 📚 추가 리소스

- [Groq API 문서](https://console.groq.com/docs)
- [Together AI 문서](https://docs.together.ai/)
- [OpenRouter 문서](https://openrouter.ai/docs)
- [Cohere 문서](https://docs.cohere.com/)
- [AI21 Labs 문서](https://docs.ai21.com/)
- [Perplexity 문서](https://docs.perplexity.ai/)
