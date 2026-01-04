# API 테스트 가이드

## ✅ API 키 설정 완료

`.env.local` 파일에 다음 API 키가 설정되었습니다:

```env
GOOGLE_API_KEY=AIzaSyBwagcHisy2dkVBW6jOqLSJtP5PEH4XXGo
```

## 🚀 테스트 실행 방법

### 1단계: 개발 서버 실행

터미널에서 다음 명령 실행:

```bash
npm run dev
```

서버가 시작되면 다음과 같은 메시지가 표시됩니다:
```
  ▲ Next.js 14.2.35
  - Local:        http://localhost:3000
```

### 2단계: 브라우저에서 테스트

#### 방법 1: 진단 페이지 (추천)

브라우저에서 다음 URL 접속:
```
http://localhost:3000/diagnostics
```

**확인할 내용**:
- ✅ GOOGLE_API_KEY: ✅ 설정됨
- ✅ AI 검색 엔진: ✅ 사용 가능
- ✅ Spark 워크스페이스: ✅ 사용 가능
- ✅ 번역: ✅ 사용 가능

#### 방법 2: API 상태 엔드포인트

브라우저에서 다음 URL 접속:
```
http://localhost:3000/api/status
```

JSON 형식으로 API 키 상태를 확인할 수 있습니다.

#### 방법 3: 실제 기능 테스트

1. **검색 엔진 테스트**
   - URL: `http://localhost:3000`
   - "AI 검색 엔진" 탭 선택
   - 검색어 입력 (예: "파리 여행 계획")
   - 실제 Gemini 응답 확인

2. **Spark 워크스페이스 테스트**
   - "Spark 워크스페이스" 탭 선택
   - 작업 생성 (예: "파리 여행 계획 문서 작성")
   - 실제 AI 작업 결과 확인

3. **번역 테스트**
   - "번역" 탭 선택
   - 원문 입력 (예: "Hello, how are you?")
   - 실제 번역 결과 확인

4. **웹 검색 테스트** (API 키 불필요)
   - "웹 검색" 탭 선택
   - 검색어 입력
   - DuckDuckGo/Wikipedia 결과 확인

5. **이미지 검색 테스트** (API 키 선택)
   - "이미지 검색" 탭 선택
   - 검색어 입력
   - 이미지 결과 확인

## 📊 예상 결과

### API 키가 올바르게 설정된 경우

**진단 페이지 (`/diagnostics`)**:
```json
{
  "apiKeys": {
    "google": {
      "configured": true,
      "hasValue": true,
      "valid": true,
      "message": "✅ API 키가 올바르게 설정되었습니다."
    }
  },
  "services": {
    "search": {
      "status": "✅ 사용 가능"
    },
    "spark": {
      "status": "✅ 사용 가능"
    },
    "translate": {
      "status": "✅ 사용 가능"
    }
  }
}
```

**실제 기능 테스트**:
- 검색 엔진에서 실제 Gemini 응답 받기 (시뮬레이션 메시지 없음)
- Spark 워크스페이스에서 작업 생성 성공
- 번역기에서 실제 번역 결과 받기

### API 키가 설정되지 않은 경우

**진단 페이지 (`/diagnostics`)**:
- ❌ GOOGLE_API_KEY: ❌ 설정되지 않음
- ⚠️ 검색 엔진: 시뮬레이션된 응답 제공
- ⚠️ Spark 워크스페이스: 시뮬레이션된 응답 제공

## 🔍 문제 해결

### API 키가 인식되지 않는 경우

1. **서버 재시작 확인**
   - `.env.local` 파일 수정 후 개발 서버를 재시작해야 합니다
   - 서버가 이미 실행 중이면 `Ctrl+C`로 중지 후 다시 시작

2. **파일 위치 확인**
   - `.env.local` 파일이 프로젝트 루트 디렉토리에 있어야 합니다
   - 파일 이름이 정확히 `.env.local`인지 확인

3. **파일 형식 확인**
   ```
   GOOGLE_API_KEY=AIzaSyBwagcHisy2dkVBW6jOqLSJtP5PEH4XXGo
   ```
   - 등호(`=`) 앞뒤에 공백이 없어야 합니다
   - 따옴표(`"`)를 사용하지 않습니다

4. **환경 변수 확인**
   ```bash
   # Windows PowerShell
   Get-Content .env.local
   
   # 또는
   type .env.local
   ```

### API 오류가 발생하는 경우

1. **API 키 형식 확인**
   - `AIza...`로 시작해야 합니다
   - 키가 완전한지 확인 (39자)

2. **Google AI Studio에서 키 확인**
   - [Google AI Studio](https://aistudio.google.com/app/api-keys) 접속
   - 키가 활성화되어 있는지 확인

3. **네트워크 연결 확인**
   - 인터넷 연결 상태 확인
   - 방화벽 설정 확인

4. **서버 로그 확인**
   - 터미널에서 에러 메시지 확인
   - 브라우저 개발자 도구(F12) → Console 탭에서 에러 확인

## ✅ 테스트 체크리스트

- [ ] `.env.local` 파일에 API 키 설정
- [ ] 개발 서버 실행 (`npm run dev`)
- [ ] `/diagnostics` 페이지에서 API 키 상태 확인
- [ ] `/api/status` 엔드포인트에서 JSON 확인
- [ ] 검색 엔진에서 실제 검색 테스트
- [ ] Spark 워크스페이스에서 작업 생성 테스트
- [ ] 번역기에서 번역 테스트
- [ ] 웹 검색 테스트 (API 키 불필요)
- [ ] 이미지 검색 테스트 (API 키 선택)

## 📝 다음 단계

API 테스트가 성공하면:
1. Netlify 환경 변수에도 동일한 키 설정
2. Netlify에서 재배포
3. 배포된 사이트에서도 테스트

