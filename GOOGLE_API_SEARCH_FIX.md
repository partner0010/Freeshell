# Google Gemini API 검색 문제 해결 가이드

## 🔍 문제 진단

검색이 안 되는 경우 다음을 확인하세요:

### 1. API 키 확인

**API 키**: `AIzaSyBwagcHisy2dkVBW6jOqLSJtP5PEH4XXGo`

#### Netlify 환경 변수 확인
1. Netlify 대시보드 → **Site settings** → **Environment variables**
2. **Key**: `GOOGLE_API_KEY` 확인
3. **Value**: `AIzaSyBwagcHisy2dkVBW6jOqLSJtP5PEH4XXGo` 확인

### 2. 재배포 확인

환경 변수를 추가/수정한 후 **반드시 재배포**해야 합니다:

1. **Deploys** 탭 → **Trigger deploy**
2. Branch: `new-master` 선택
3. **Deploy site** 클릭

### 3. 브라우저 콘솔 확인

검색 시 브라우저 개발자 도구(F12) → Console 탭에서 다음 로그 확인:

```
Google Gemini API 호출: {
  model: "gemini-1.5-flash",
  hasApiKey: true,
  apiKeyPrefix: "AIzaSyBwag..."
}
```

## ✅ 개선 사항

### 1. 최신 모델 사용
- 기존: `gemini-pro` (구버전)
- 변경: `gemini-1.5-flash` (최신, 빠름)

### 2. 최신 API 버전
- 기존: `v1beta`
- 변경: `v1` (안정 버전)

### 3. 향상된 에러 처리
- 인증 오류 (401/403): 구체적인 메시지 표시
- Rate limit (429): 요청 한도 초과 안내
- 상세한 로그 출력

### 4. 응답 검증
- 빈 응답 감지
- 응답 구조 검증
- 상세한 에러 메시지

## 🐛 문제 해결 단계

### 단계 1: 환경 변수 확인

Netlify에서 다음을 확인:
- ✅ Key 이름: `GOOGLE_API_KEY` (정확히)
- ✅ Value: `AIzaSyBwagcHisy2dkVBW6jOqLSJtP5PEH4XXGo`
- ✅ Scopes: All scopes
- ✅ Values: Same value for all deploy contexts

### 단계 2: 재배포

환경 변수가 올바르게 설정되어 있어도 **재배포가 필요**합니다:

1. Deploys 탭
2. Trigger deploy 클릭
3. Deploy branch 선택
4. Branch: `new-master`
5. Deploy site 클릭

### 단계 3: 진단 페이지 확인

배포 완료 후:
1. https://freeshell.co.kr/diagnostics 접속
2. **GOOGLE_API_KEY**: ✅ 설정됨 확인
3. 상태가 "❌ API 키가 설정되지 않았습니다"면 재배포 필요

### 단계 4: 검색 테스트

1. 메인 페이지에서 검색어 입력
2. 브라우저 콘솔(F12) 확인
3. 다음 로그가 보이면 정상:
   ```
   Google Gemini API 호출: { model: "gemini-1.5-flash", hasApiKey: true, ... }
   Google Gemini API 성공: { model: "gemini-1.5-flash", responseLength: 1234 }
   ```

## 🔧 일반적인 오류

### "API 키 인증 실패" (401/403)

**원인**: API 키가 잘못되었거나 만료됨

**해결**:
1. Google AI Studio에서 새 API 키 발급
2. Netlify 환경 변수 업데이트
3. 재배포

### "요청 한도 초과" (429)

**원인**: Rate limit 초과

**해결**:
- 잠시 후 다시 시도
- 무료 티어: 분당 15회 요청 제한

### "시뮬레이션된 응답" 표시

**원인**: API 키가 설정되지 않음

**해결**:
1. Netlify 환경 변수 확인
2. 재배포
3. 진단 페이지에서 상태 확인

## 📊 API 상태 확인

### 진단 페이지
- URL: `/diagnostics`
- API 키 설정 상태 확인
- 각 서비스 상태 확인

### 브라우저 콘솔
- F12 → Console 탭
- API 호출 로그 확인
- 에러 메시지 확인

## ✅ 성공 확인

검색이 정상 작동하면:
1. ✅ 실제 AI 응답이 표시됨
2. ✅ "시뮬레이션된 응답" 메시지가 없음
3. ✅ 콘솔에 "Google Gemini API 성공" 로그 표시
4. ✅ 응답 내용이 검색어와 관련됨

## 💡 추가 팁

### API 키 보안
- API 키는 절대 공개하지 마세요
- GitHub에 커밋하지 마세요
- Netlify 환경 변수에만 저장

### 성능 최적화
- `gemini-1.5-flash`: 빠른 응답 (권장)
- `gemini-1.5-pro`: 고품질 응답 (느림)

### Rate Limit 관리
- 무료 티어: 분당 15회
- 요청 간격 조정 권장
- 캐싱 활용

