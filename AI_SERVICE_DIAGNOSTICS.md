# AI 서비스 진단 및 설정 가이드

## 🔍 현재 상태 확인

### 진단 페이지 사용
1. 사이트에서 **"진단"** 메뉴 클릭
2. 또는 직접 접속: `/diagnostics`
3. 현재 API 키 설정 상태와 서비스 연결 상태를 확인

### API 상태 확인
- 엔드포인트: `/api/status`
- 현재 환경 변수 설정 상태 확인
- 각 서비스별 작동 가능 여부 확인

## ❌ AI 서비스가 작동하지 않는 이유

### 1. API 키가 설정되지 않음 (가장 흔한 원인)

**증상:**
- 검색 시 "시뮬레이션된 응답" 메시지 표시
- 실제 AI 응답 대신 템플릿 응답 반환
- 이미지 생성 시 플레이스홀더 이미지만 표시

**원인:**
- Netlify 환경 변수에 `OPENAI_API_KEY`가 설정되지 않음
- 또는 로컬 개발 환경에 `.env.local` 파일이 없음

**해결 방법:**
- 아래 "API 키 설정 방법" 참고

### 2. API 키 형식이 잘못됨

**증상:**
- API 키가 설정되어 있지만 여전히 작동하지 않음
- 에러 메시지: "Invalid API key"

**원인:**
- OpenAI API 키는 `sk-`로 시작해야 함
- 키 앞뒤에 공백이 포함됨
- 잘못된 키 사용

**해결 방법:**
- OpenAI Platform에서 새 키 발급
- 키 앞뒤 공백 제거 확인
- 올바른 형식: `sk-proj-...` 또는 `sk-...`

### 3. 환경 변수가 배포에 반영되지 않음

**증상:**
- Netlify에 API 키를 설정했지만 여전히 작동하지 않음

**원인:**
- 환경 변수 설정 후 재배포를 하지 않음
- 잘못된 스코프 설정 (Production/Deploy preview/Branch deploy)

**해결 방법:**
1. Netlify 대시보드 → Deploys 탭
2. **Trigger deploy** → **Deploy site** 클릭
3. 배포 완료 대기 (1-2분)

### 4. API 키가 만료되었거나 제한됨

**증상:**
- API 호출 시 401 또는 403 에러
- "Insufficient quota" 메시지

**원인:**
- API 키가 만료됨
- 사용량 한도 초과
- 계정에 충분한 크레딧이 없음

**해결 방법:**
- OpenAI Platform에서 새 키 발급
- 사용량 및 크레딧 확인
- 결제 정보 확인

### 5. 네트워크 또는 CORS 문제

**증상:**
- API 호출 실패
- 브라우저 콘솔에 CORS 에러

**원인:**
- Netlify Functions의 타임아웃
- CORS 설정 문제

**해결 방법:**
- Netlify Functions 로그 확인
- `netlify.toml` 설정 확인

## ✅ 해결 방법

### 필수: OpenAI API 키 설정

#### 1. OpenAI API 키 발급
1. [OpenAI Platform](https://platform.openai.com/) 접속
2. 로그인 또는 계정 생성
3. **API Keys** 메뉴 클릭
4. **Create new secret key** 클릭
5. 키 이름 입력 (예: "Shell Production")
6. 생성된 키 복사 (⚠️ 한 번만 표시됨!)

#### 2. Netlify 환경 변수 설정
1. [Netlify 대시보드](https://app.netlify.com) 접속
2. 사이트 선택 (freeshell.co.kr)
3. **Site settings** 클릭
4. 왼쪽 메뉴에서 **Environment variables** 클릭
5. **Add a variable** 버튼 클릭
6. 다음 정보 입력:
   - **Key**: `OPENAI_API_KEY`
   - **Value**: `sk-your-openai-api-key-here` (발급받은 키)
   - **Scopes**: **All scopes** 선택 (또는 Production만 선택)
7. **Save** 클릭

#### 3. 배포 재실행
1. **Deploys** 탭으로 이동
2. **Trigger deploy** → **Deploy site** 클릭
3. 배포 완료 대기 (1-2분)

#### 4. 확인
1. `/diagnostics` 페이지 접속
2. API 키 상태가 "✅ 유효한 형식"으로 표시되는지 확인
3. 검색을 실행하여 실제 AI 응답이 나오는지 확인

### 선택사항: 다른 AI 모델 API 키

#### Anthropic Claude (선택사항)
- **Key**: `ANTHROPIC_API_KEY`
- **발급**: [Anthropic Console](https://console.anthropic.com/)
- **용도**: Claude 모델 사용 시

#### Google Gemini (선택사항)
- **Key**: `GOOGLE_API_KEY`
- **발급**: [Google AI Studio](https://makersuite.google.com/app/apikey)
- **용도**: Gemini 모델 사용 시

## 📊 서비스별 필수 API 키

| 서비스 | 필수 API 키 | 폴백 동작 |
|--------|------------|----------|
| AI 검색 엔진 | OPENAI_API_KEY | 시뮬레이션 응답 |
| Spark 워크스페이스 | OPENAI_API_KEY | 시뮬레이션 응답 |
| AI 번역 | OPENAI_API_KEY | 원문 반환 |
| 이미지 생성 | OPENAI_API_KEY | 플레이스홀더 이미지 |
| 심층 연구 | OPENAI_API_KEY | 시뮬레이션 결과 |
| AI 모델 관리 | OPENAI_API_KEY (최소 1개) | 시뮬레이션 응답 |

## 🔧 문제 해결 체크리스트

- [ ] `/diagnostics` 페이지에서 상태 확인
- [ ] Netlify 환경 변수에 `OPENAI_API_KEY` 설정 확인
- [ ] API 키가 `sk-`로 시작하는지 확인
- [ ] 환경 변수 설정 후 재배포 실행
- [ ] OpenAI Platform에서 API 키 유효성 확인
- [ ] OpenAI 계정에 충분한 크레딧 확인
- [ ] Netlify Functions 로그 확인 (오류 메시지 확인)

## 📝 로그 확인 방법

### Netlify Functions 로그
1. Netlify 대시보드 → Site settings
2. Functions → View logs
3. 최근 배포의 로그 확인

### 브라우저 콘솔
1. F12로 개발자 도구 열기
2. Console 탭에서 에러 메시지 확인
3. Network 탭에서 API 요청 상태 확인

## 💡 추가 정보

- API 키는 절대 공개 저장소에 커밋하지 마세요
- 환경 변수는 Netlify 대시보드에서만 관리하세요
- API 사용량에 따라 비용이 발생할 수 있습니다
- OpenAI 무료 티어 제한을 확인하세요

