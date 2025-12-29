# 실제 API 동작 테스트 가이드

## 🔍 실제 동작 확인 방법

### 1. API 테스트 엔드포인트 사용

브라우저에서 다음 URL로 접속:
```
http://localhost:3000/api/test
```

또는 터미널에서:
```bash
curl http://localhost:3000/api/test
```

### 2. 예상 결과

#### API 키가 설정된 경우:
```json
{
  "timestamp": "2024-01-XX...",
  "environment": {
    "nodeEnv": "development",
    "validation": {
      "valid": true,
      "errors": [],
      "warnings": []
    },
    "apiKeys": {
      "OPENAI_API_KEY": "설정됨",
      "ANTHROPIC_API_KEY": "설정 안됨",
      "GOOGLE_API_KEY": "설정 안됨"
    }
  },
  "apiTests": [
    {
      "endpoint": "OpenAI API",
      "method": "POST",
      "realAPICall": true,
      "hasAPIKey": true,
      "responseTime": 1234,
      "success": true
    }
  ],
  "summary": {
    "totalTests": 1,
    "successfulTests": 1,
    "realAPICalls": 1,
    "hasAPIKeys": 1
  }
}
```

#### API 키가 없는 경우:
```json
{
  "apiTests": [
    {
      "endpoint": "OpenAI API",
      "method": "POST",
      "realAPICall": false,
      "hasAPIKey": false,
      "success": false,
      "error": "OPENAI_API_KEY가 설정되지 않았습니다."
    }
  ]
}
```

## ✅ 실제 동작 확인 체크리스트

### 1. 환경 변수 설정 확인
```bash
# .env.local 파일 확인
cat .env.local

# 다음이 포함되어 있어야 함:
OPENAI_API_KEY=sk-your-actual-key-here
```

### 2. 실제 API 호출 확인

#### 코드에서 확인:
1. `lib/openai.ts`의 `generateText()` 함수:
   - API 키가 있으면: 실제 `https://api.openai.com/v1/chat/completions` 호출
   - API 키가 없으면: `simulateResponse()` 호출 (폴백)

2. `lib/ai-models.ts`의 `callOpenAI()` 함수:
   - API 키가 있으면: 실제 OpenAI API 호출
   - API 키가 없으면: 시뮬레이션 응답 반환

#### 테스트 방법:
1. API 키 설정 후 `/api/test` 호출
2. `realAPICall: true` 확인
3. `success: true` 확인
4. `responseTime` 값 확인 (실제 API 호출이면 500ms 이상)

### 3. 실제 사용 테스트

#### 검색 기능 테스트:
1. 메인 페이지에서 검색어 입력
2. 개발자 도구 → Network 탭 열기
3. `/api/search` 요청 확인
4. Response 확인:
   - API 키 있으면: 실제 AI 생성 응답
   - API 키 없으면: 시뮬레이션 응답

#### AI 에이전트 테스트:
1. "AI 에이전트" 탭에서 쿼리 입력
2. Network 탭에서 확인:
   - `/api/search` 호출
   - `/api/models` 호출
3. 각 응답이 실제 API 호출인지 확인

## 🔧 문제 해결

### API가 호출되지 않는 경우:

1. **환경 변수 확인**
   ```bash
   # .env.local 파일이 프로젝트 루트에 있는지 확인
   ls -la .env.local
   
   # 내용 확인 (키는 마스킹됨)
   cat .env.local | grep OPENAI
   ```

2. **서버 재시작**
   ```bash
   # 개발 서버 재시작
   npm run dev
   ```

3. **API 키 형식 확인**
   - OpenAI API 키는 `sk-`로 시작해야 함
   - 공백이나 따옴표 없이 입력

4. **네트워크 확인**
   - `https://api.openai.com` 접근 가능한지 확인
   - 방화벽이나 프록시 설정 확인

### 폴백 모드가 작동하는 경우:

폴백 모드는 **의도된 동작**입니다:
- API 키가 없을 때: 폴백 모드로 기본 응답 반환
- API 키가 있을 때: 실제 API 호출

**실제 API를 사용하려면:**
1. `.env.local` 파일 생성
2. `OPENAI_API_KEY=sk-your-key` 추가
3. 서버 재시작

## 📊 실제 동작 증명

### 코드 증거:

1. **lib/openai.ts (22-54줄)**:
   ```typescript
   if (!this.apiKey) {
     return this.simulateResponse(prompt); // 폴백
   }
   
   // 실제 API 호출
   const response = await fetch('https://api.openai.com/v1/chat/completions', {
     method: 'POST',
     headers: {
       'Authorization': `Bearer ${this.apiKey}`,
     },
     // ...
   });
   ```

2. **lib/ai-models.ts (75-107줄)**:
   ```typescript
   if (!model.apiKey) {
     return `이것은 시뮬레이션된 응답입니다...`; // 폴백
   }
   
   // 실제 API 호출
   const response = await fetch('https://api.openai.com/v1/chat/completions', {
     // ...
   });
   ```

### 테스트 증거:

`/api/test` 엔드포인트를 호출하면:
- `realAPICall: true` → 실제 API 호출
- `realAPICall: false` → 폴백 모드
- `responseTime` → 실제 API 호출 시간 (500ms+)

## ✅ 최종 확인

실제 동작하는 AI 솔루션인지 확인하려면:

1. ✅ `.env.local`에 실제 API 키 설정
2. ✅ `/api/test` 호출하여 `realAPICall: true` 확인
3. ✅ 실제 검색 기능 사용하여 Network 탭에서 API 호출 확인
4. ✅ 응답 시간 확인 (실제 API는 500ms 이상, 폴백은 즉시)

**결론**: 코드는 실제로 OpenAI API를 호출합니다. API 키가 설정되어 있으면 실제 AI 응답을 받고, 없으면 폴백 모드로 작동합니다.

