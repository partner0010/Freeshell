# 작동하지 않는 기능 제거 계획

## 🔍 확인해야 할 사항

1. lib/openai.ts가 여전히 사용되는가?
2. 빈 API 디렉토리 (audio/generate, video/animate, video/compose)
3. OPENAI_API_KEY 참조가 남아있는가?
4. 작동하지 않는 API 테스트 코드

## ❌ 제거 대상

1. lib/openai.ts - Google Gemini로 전환했으므로 불필요
2. 빈 API 디렉토리들
3. OpenAI/Anthropic 관련 테스트 코드
4. 사용하지 않는 참조

## ✅ 유지할 것

1. Google Gemini API만 사용
2. 실제 작동하는 무료 API만
3. DuckDuckGo, Wikipedia (API 키 불필요)
4. Pexels, Unsplash, Pixabay (API 키 필요하지만 작동)

