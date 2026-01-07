# Netlify API 키 설정 문제 해결 가이드

## 🔍 문제 진단

Netlify에서 API 키를 설정했는데도 실행이 안 되는 경우, 다음을 확인하세요:

### 1. 환경 변수 이름 확인
Netlify에서 설정한 환경 변수 이름이 정확한지 확인:
- ✅ `GOOGLE_API_KEY` (대소문자 구분)
- ❌ `GOOGLE_API_KEY_` (뒤에 언더스코어 없어야 함)
- ❌ `google_api_key` (소문자 아님)

### 2. API 모델 및 버전 수정
코드에서 Google Gemini API 모델을 수정했습니다:
- **이전**: `gemini-1.5-flash` (v1beta) - 오류 발생
- **현재**: `gemini-pro` (v1) - 안정적

### 3. Netlify 환경 변수 설정 방법

1. **Netlify 대시보드 접속**
   - 사이트 선택 → **Site settings** → **Build & deploy** → **Environment**

2. **환경 변수 추가**
   ```
   Key: GOOGLE_API_KEY
   Value: AIza... (Google AI Studio에서 발급받은 키)
   ```

3. **재배포 필요**
   - 환경 변수 변경 후 **"Trigger deploy"** → **"Clear cache and deploy site"** 클릭

### 4. API 키 확인 방법

브라우저에서 다음 URL로 접속하여 API 키 상태 확인:
```
https://your-site.netlify.app/api/status
```

또는:
```
https://your-site.netlify.app/api/test
```

### 5. 로그 확인

Netlify 대시보드에서:
- **Deploys** → 최신 배포 → **Functions** 탭
- API 호출 로그 확인

### 6. 일반적인 문제

#### 문제 1: 환경 변수가 빌드 시점에만 로드됨
**해결**: 환경 변수 변경 후 **반드시 재배포** 필요

#### 문제 2: API 키 형식 오류
**확인**: Google AI Studio에서 발급받은 키가 올바른지 확인
- 형식: `AIza...` (39자)
- 공백이나 줄바꿈 없어야 함

#### 문제 3: API 모델 이름 오류
**해결**: 코드에서 `gemini-pro` (v1) 사용하도록 수정 완료

### 7. 테스트 방법

1. **로컬 테스트** (환경 변수 확인):
   ```bash
   # .env.local 파일 생성
   GOOGLE_API_KEY=your-key-here
   
   # 개발 서버 실행
   npm run dev
   ```

2. **프로덕션 테스트**:
   - Netlify에서 환경 변수 설정
   - 재배포
   - `/api/status` 엔드포인트 확인

### 8. 수정된 파일

- ✅ `lib/gemini.ts`: `gemini-pro` (v1) 사용
- ✅ `lib/ai-models.ts`: `gemini-pro` (v1) 사용

### 9. 추가 확인 사항

- [ ] Netlify 환경 변수에 `GOOGLE_API_KEY` 설정됨
- [ ] 환경 변수 값에 공백이나 특수문자 없음
- [ ] 재배포 완료
- [ ] `/api/status`에서 API 키 상태 확인
- [ ] 브라우저 콘솔에서 API 호출 로그 확인

### 10. 여전히 작동하지 않는 경우

1. **Netlify Functions 로그 확인**
   - Netlify 대시보드 → Functions → Logs

2. **API 키 유효성 확인**
   - Google AI Studio에서 API 키가 활성화되어 있는지 확인
   - 할당량이 남아있는지 확인

3. **코드 확인**
   - `lib/gemini.ts`에서 `process.env.GOOGLE_API_KEY` 로드 확인
   - `lib/ai-models.ts`에서 모델 이름 확인

## ✅ 최종 확인

모든 수정이 완료되었습니다. 다음 단계를 진행하세요:

1. Netlify에서 환경 변수 확인
2. 재배포 실행
3. `/api/status` 엔드포인트로 확인
4. 검색 기능 테스트

