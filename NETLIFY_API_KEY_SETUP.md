# Netlify 환경 변수 설정 가이드

## OpenAI API 키 설정 방법

실제 AI 응답을 받으려면 Netlify 환경 변수에 OpenAI API 키를 설정해야 합니다.

### 1. OpenAI API 키 발급

1. [OpenAI Platform](https://platform.openai.com/)에 접속
2. 계정 생성 또는 로그인
3. API Keys 메뉴에서 새 키 생성
4. 생성된 키를 복사 (예: `sk-...`)

### 2. Netlify 환경 변수 설정

1. [Netlify 대시보드](https://app.netlify.com) 접속
2. 사이트 선택 (freeshell.co.kr)
3. **Site settings** 클릭
4. 왼쪽 메뉴에서 **Environment variables** 클릭
5. **Add a variable** 버튼 클릭
6. 다음 정보 입력:
   - **Key**: `OPENAI_API_KEY`
   - **Value**: `sk-your-openai-api-key-here` (발급받은 키 입력)
   - **Scopes**: **All scopes** 선택 (또는 Production 선택)
7. **Save** 버튼 클릭

### 3. 배포 재실행

환경 변수를 추가한 후 배포를 재실행해야 합니다:

1. Netlify 대시보드에서 **Deploys** 탭으로 이동
2. **Trigger deploy** → **Deploy site** 클릭
3. 배포 완료 대기 (1-2분)

### 4. 확인 방법

배포 완료 후:
1. 사이트에서 검색을 실행
2. 실제 AI 응답이 나오는지 확인
3. 시뮬레이션 메시지가 없어야 함

## 추가 API 키 (선택사항)

다른 AI 모델을 사용하려면 다음 키도 설정할 수 있습니다:

- `ANTHROPIC_API_KEY`: Claude 모델 사용 시
- `GOOGLE_API_KEY`: Gemini 모델 사용 시

## 중요 사항

- API 키는 절대 공개 저장소에 커밋하지 마세요
- 환경 변수는 Netlify 대시보드에서만 관리하세요
- API 사용량에 따라 비용이 발생할 수 있습니다
- 무료 티어 제한이 있을 수 있으니 확인하세요

## 문제 해결

### API 키가 작동하지 않는 경우

1. 환경 변수가 올바르게 설정되었는지 확인
2. 배포를 재실행했는지 확인
3. API 키 앞뒤에 공백이 없는지 확인
4. Netlify 로그에서 오류 메시지 확인:
   - Site settings → Build & deploy → Deploy log

### API 오류가 발생하는 경우

1. OpenAI 계정에 충분한 크레딧이 있는지 확인
2. API 키가 만료되지 않았는지 확인
3. OpenAI Platform에서 API 사용량 확인
4. Netlify 함수 로그 확인:
   - Site settings → Functions → View logs

