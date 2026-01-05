# Pexels API 키 설정 가이드

## 🔑 API 키 정보

**API 키**: `V2FLO9FxTgLACN1lzxpa9sXLDgoHu6bxWgAQZBayywMrb2lU9VRLKkqZ`

## ⚠️ 중요: Pexels API 사용 방법

Pexels API는 **Authorization 헤더**에 API 키를 넣어야 합니다.

### 올바른 사용법
```typescript
headers: {
  'Authorization': 'V2FLO9FxTgLACN1lzxpa9sXLDgoHu6bxWgAQZBayywMrb2lU9VRLKkqZ'
}
```

### 잘못된 사용법
```typescript
// ❌ URL 파라미터로 전달 (작동하지 않음)
`https://api.pexels.com/v1/search?key=${apiKey}&query=...`

// ❌ Bearer 토큰 형식 (작동하지 않음)
'Authorization': `Bearer ${apiKey}`
```

## 📝 Netlify 환경 변수 설정

1. **Netlify 대시보드** → Site settings → Environment variables
2. **Key**: `PEXELS_API_KEY` (정확히 이 이름)
3. **Value**: `V2FLO9FxTgLACN1lzxpa9sXLDgoHu6bxWgAQZBayywMrb2lU9VRLKkqZ`
4. **Scopes**: All scopes
5. **Create variable** 클릭
6. **재배포 필수**: Deploys 탭 → "Trigger deploy"

## ✅ 확인 방법

배포 후 `/diagnostics` 페이지에서 확인:
- `PEXELS_API_KEY`: ✅ 설정됨

## 🔧 문제 해결

### API 키가 작동하지 않는 경우

1. **환경 변수 이름 확인**
   - ✅ 올바른 이름: `PEXELS_API_KEY`
   - ❌ 잘못된 이름: `PEXELS_APIKEY`, `pexels_API_KEY`, `PEXELS-API-KEY`

2. **재배포 확인**
   - 환경 변수 추가/수정 후 반드시 재배포 필요
   - Deploys 탭 → "Trigger deploy"

3. **API 키 값 확인**
   - 공백이나 특수문자 포함 여부 확인
   - 전체 키가 정확히 복사되었는지 확인

4. **코드 확인**
   - `lib/free-apis.ts`의 `searchPexelsImages()` 함수 확인
   - Authorization 헤더에 올바르게 전달되는지 확인

## 📚 Pexels API 문서

- 공식 문서: https://www.pexels.com/api/documentation/
- Rate Limit: 시간당 200회 요청 (무료 티어)

