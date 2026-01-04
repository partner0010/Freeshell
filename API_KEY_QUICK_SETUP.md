# API 키 빠른 설정 가이드

## ✅ Google Gemini API 키 설정 완료

제공하신 API 키: `AIzaSyBwagcHisy2dkVBW6jOqLSJtP5PEH4XXGo`

이 키는 올바른 형식입니다! 이제 환경 변수에 설정하면 됩니다.

## 🚀 빠른 시작 (3단계)

### 1단계: 로컬 개발 환경 설정

프로젝트 루트에 `.env.local` 파일을 만들고 다음을 추가:

```env
GOOGLE_API_KEY=AIzaSyBwagcHisy2dkVBW6jOqLSJtP5PEH4XXGo
```

### 2단계: 개발 서버 재시작

```bash
# 개발 서버 중지 (Ctrl+C)
# 다시 시작
npm run dev
```

### 3단계: 테스트

브라우저에서 `http://localhost:3000/diagnostics` 접속하여 API 키 상태 확인

## 🌐 Netlify 배포 환경 설정

1. [Netlify 대시보드](https://app.netlify.com) 접속
2. 사이트 선택
3. **Site settings** → **Environment variables**
4. **Add a variable**:
   - Key: `GOOGLE_API_KEY`
   - Value: `AIzaSyBwagcHisy2dkVBW6jOqLSJtP5PEH4XXGo`
5. **Save** → **Deploys** → **Trigger deploy**

## ✅ 설정 확인

- 로컬: `http://localhost:3000/diagnostics`
- 배포: `https://your-site.netlify.app/diagnostics`

"✅ API 키가 올바르게 설정되었습니다" 메시지가 보이면 성공!

