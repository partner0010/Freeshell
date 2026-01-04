# 실제 작동하는 무료 기능만 유지

## ✅ 실제 작동하는 기능

### 1. Google Gemini API (필수)
- AI 검색 엔진
- Spark 워크스페이스
- 번역
- 연구 (Research)

### 2. 웹 검색 (API 키 불필요, 완전 무료)
- DuckDuckGo
- Wikipedia

### 3. 이미지 검색 (API 키 필요, 무료)
- Pexels
- Unsplash
- Pixabay

## ❌ 제거할 것

1. `lib/openai.ts` - 더 이상 사용 안 함
2. `lib/ai-models.ts`의 callOpenAI, callAnthropic 함수
3. `app/api/status/route.ts` - OpenAI/Anthropic 참조 업데이트
4. `lib/security/api-test.ts` - Google Gemini 테스트로 변경
5. `app/api/test/route.ts` - 업데이트
6. 빈 디렉토리들

## 🔧 수정 필요

1. `/api/status` - Google Gemini만 참조하도록
2. `/api/test` - Google Gemini만 테스트
3. `lib/security/api-test.ts` - Google Gemini 테스트 함수
4. `lib/security/env-security.ts` - Google Gemini만 검증
5. `app/diagnostics/page.tsx` - Google Gemini만 표시

