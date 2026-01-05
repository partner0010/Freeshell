# Pexels API 키 빠른 설정 가이드

## 🔑 API 키 정보

**API 키**: `V2FLO9FxTgLACN1lzxpa9sXLDgoHu6bxWgAQZBayywMrb2lU9VRLKkqZ`

## ⚡ 빠른 설정 (3단계)

### 1단계: Netlify 환경 변수 추가

1. **Netlify 대시보드** 접속
2. **Site settings** → **Environment variables**
3. **Add a variable** 클릭
4. 다음 정보 입력:
   - **Key**: `PEXELS_API_KEY` (정확히 이 이름)
   - **Value**: `V2FLO9FxTgLACN1lzxpa9sXLDgoHu6bxWgAQZBayywMrb2lU9VRLKkqZ`
   - **Scopes**: All scopes
   - **Values**: Same value for all deploy contexts
5. **Create variable** 클릭

### 2단계: 재배포

1. **Deploys** 탭으로 이동
2. **Trigger deploy** 클릭
3. **Deploy branch** 선택
4. Branch: `new-master` 선택
5. **Deploy site** 클릭

### 3단계: 확인

1. 배포 완료 대기 (약 2-3분)
2. https://freeshell.co.kr/diagnostics 접속
3. **PEXELS_API_KEY**: ✅ 설정됨 확인

## ✅ 코드 확인

현재 코드는 이미 올바르게 구현되어 있습니다:

```typescript
// lib/free-apis.ts
headers: {
  'Authorization': apiKey,  // ✅ 올바른 방식
}
```

Pexels API는 Authorization 헤더에 API 키를 직접 넣어야 합니다 (Bearer 없음).

## 🐛 문제 해결

### "API 키가 설정되지 않았습니다" 오류

1. **환경 변수 이름 확인**
   - ✅ 올바른 이름: `PEXELS_API_KEY`
   - ❌ 잘못된 이름: `pexels_API_KEY`, `PEXELS-API-KEY`, `PEXELS_APIKEY`

2. **재배포 확인**
   - 환경 변수 추가 후 반드시 재배포 필요
   - 재배포 없이는 환경 변수가 적용되지 않음

3. **API 키 값 확인**
   - 전체 키가 정확히 복사되었는지 확인
   - 앞뒤 공백 없이 정확히 입력

### "401 Unauthorized" 오류

- API 키가 잘못되었거나 만료됨
- Pexels 계정에서 새 API 키 발급 필요

### "429 Too Many Requests" 오류

- Rate limit 초과 (시간당 200회)
- 잠시 후 다시 시도

## 📊 Rate Limit

- **무료 티어**: 시간당 200회 요청
- **응답 헤더**에서 남은 요청 수 확인 가능

## ✅ 완료 확인

배포 후 다음을 확인하세요:

1. `/diagnostics` 페이지에서 `PEXELS_API_KEY` 상태 확인
2. `/` 페이지에서 "이미지 검색" 탭 테스트
3. 검색어 입력 후 Pexels 이미지가 표시되는지 확인

## 💡 추가 정보

- Pexels API 문서: https://www.pexels.com/api/documentation/
- 이미지 검색 엔드포인트: `/api/image-search`
- 비디오 검색 엔드포인트: `/api/video-search`

