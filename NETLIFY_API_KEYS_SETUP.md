# Netlify API 키 설정 가이드

## ⚠️ 중요: 환경 변수 이름 확인

Netlify에서 설정한 환경 변수 이름이 코드에서 사용하는 이름과 **정확히 일치**해야 합니다.

## ✅ 올바른 환경 변수 이름

다음 이름을 **정확히** 사용하세요 (대소문자 구분):

1. **GOOGLE_API_KEY** (Google Gemini API)
   - 값: `AIzaSyBwagcHisy2dkVBW6jOqLSJtP5PEH4XXGo`

2. **PEXELS_API_KEY** (Pexels 이미지 검색)
   - 값: `V2FLO9FxTgLACN1lzxpa9sXLDgoHu6bxWgAQZBayywMrb2lU9VRLKkqZ`
   - ⚠️ 중요: Authorization 헤더에 직접 사용 (Bearer 없음)

3. **UNSPLASH_ACCESS_KEY** (Unsplash 이미지 검색)
   - ⚠️ 주의: `UNSPLASH_API_KEY`가 아닌 `UNSPLASH_ACCESS_KEY`

4. **PIXABAY_API_KEY** (Pixabay 이미지 검색)
   - 값: `54061391-2926562974110f7fde2b392a0`

## ❌ 잘못된 예시

다음과 같은 이름은 **작동하지 않습니다**:
- `pexels_API_KEY` (소문자로 시작)
- `Pixabay_API_KEY` (대소문자 혼합)
- `UNSPLASH_API_KEY` (잘못된 이름)
- `pexels-api-key` (하이픈 사용)

## 📝 Netlify에서 설정 방법

1. Netlify 대시보드 → **Site settings** → **Environment variables**
2. **Add a variable** 클릭
3. **Key** 필드에 위의 이름을 **정확히** 입력
4. **Value** 필드에 API 키 값 입력
5. **Scopes**: All scopes 선택
6. **Values**: Same value for all deploy contexts 선택
7. **Create variable** 클릭

## 🔄 재배포 필요

환경 변수를 추가/수정한 후:
1. **Deploys** 탭으로 이동
2. **Trigger deploy** 클릭
3. **Deploy branch** 선택
4. Branch: `new-master` 선택
5. **Deploy site** 클릭

## ✅ 확인 방법

배포 완료 후:
1. https://freeshell.co.kr/diagnostics 접속
2. "API 키 설정" 섹션에서 확인
3. 모든 키가 "✅ 설정됨"으로 표시되어야 합니다

## 🐛 문제 해결

### API 키가 설정되지 않았다고 나오는 경우

1. **환경 변수 이름 확인**
   - Netlify에서 설정한 이름이 코드와 일치하는지 확인
   - 대소문자 정확히 일치해야 함

2. **재배포 확인**
   - 환경 변수 추가 후 반드시 재배포 필요
   - 재배포 없이는 환경 변수가 적용되지 않음

3. **캐시 삭제**
   - 브라우저 캐시 삭제
   - 하드 리프레시 (Ctrl+Shift+R)

4. **환경 변수 값 확인**
   - API 키 값이 올바른지 확인
   - 공백이나 특수문자 포함 여부 확인

## 📞 추가 도움

문제가 계속되면:
1. Netlify 대시보드에서 환경 변수 목록 스크린샷
2. 진단 페이지 스크린샷
3. 함께 공유해주시면 정확히 확인 가능합니다

