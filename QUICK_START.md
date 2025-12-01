# 빠른 시작 가이드

## 🎯 5분 안에 시작하기

### 1단계: 백엔드 서버 시작

```bash
cd backend

# 자동 설치 및 실행
chmod +x install.sh
./install.sh
npm start
```

또는 Docker 사용:
```bash
cd backend
docker-compose up -d
```

### 2단계: API 키 설정

`.env` 파일을 열어서 최소 하나의 AI API 키를 설정:

```env
OPENAI_API_KEY=sk-your-key-here
# 또는
CLAUDE_API_KEY=sk-ant-your-key-here
```

### 3단계: 프론트엔드 시작

새 터미널에서:

```bash
npm.cmd install
npm.cmd run dev
```

### 4단계: 브라우저에서 확인

http://localhost:3000 접속

## ✅ 확인 사항

1. 백엔드 서버가 실행 중인가?
   ```bash
   curl http://localhost:3001/api/health
   ```

2. 프론트엔드가 실행 중인가?
   - 브라우저에서 http://localhost:3000 접속

3. API 연결이 되는가?
   - 브라우저 개발자 도구 → Network 탭 확인

## 🎉 완료!

이제 콘텐츠를 생성할 수 있습니다!

