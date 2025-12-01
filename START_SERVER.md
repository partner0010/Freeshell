# 🚀 서버 실행 방법

## ✅ 설정 완료!
모든 설정이 완료되었습니다:
- ✅ 데이터베이스 생성 완료
- ✅ Prisma 클라이언트 생성 완료
- ✅ 의존성 설치 완료

## 🎯 서버 실행하기

### 방법 1: 개발 모드 (자동 재시작)
```cmd
cd backend
npm run dev
```

### 방법 2: CMD 사용
```cmd
cd "C:\Users\partn\OneDrive\바탕 화면\Cursor\Freeshell\backend"
npm.cmd run dev
```

서버가 실행되면:
- 백엔드 서버: http://localhost:3001
- Health Check: http://localhost:3001/api/health

## 📝 참고사항

### API 키 설정 (선택)
`backend/.env` 파일을 열어서 다음 항목을 설정할 수 있습니다:
- `OPENAI_API_KEY` - OpenAI API 키 (AI 기능 사용 시)
- `CLAUDE_API_KEY` - Claude API 키 (AI 기능 사용 시)

API 키 없이도 서버는 실행되지만, AI 기능은 사용할 수 없습니다.

### 서버 중지
서버를 중지하려면 `Ctrl + C`를 누르세요.

## 🎉 준비 완료!
이제 서버를 실행할 수 있습니다!

