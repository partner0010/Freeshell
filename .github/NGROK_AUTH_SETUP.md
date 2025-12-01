# 🔐 ngrok 인증 토큰 설정 가이드

## 📝 인증 토큰이 필요한 이유

ngrok 무료 계정을 사용하면:
- ✅ 더 많은 기능 사용 가능
- ✅ 세션 시간 제한 완화
- ✅ 더 안정적인 연결
- ✅ 대시보드에서 모니터링 가능

## 🔑 인증 토큰 받는 방법

### 1단계: ngrok 계정 생성
1. https://dashboard.ngrok.com/signup 접속
2. 이메일 또는 GitHub 계정으로 가입
3. 이메일 인증 완료

### 2단계: 인증 토큰 복사
1. https://dashboard.ngrok.com 접속
2. 로그인
3. 좌측 메뉴에서 "Your Authtoken" 클릭
4. 또는 "Getting Started" → "Your Authtoken" 섹션
5. 토큰 복사 (예: `2abc123def456ghi789jkl012mno345pq`)

## ⚙️ 인증 토큰 설정 방법

### 방법 1: 자동 설정 스크립트
```powershell
# 프로젝트 루트에서
powershell -ExecutionPolicy Bypass -File .\setup-ngrok.ps1
```

### 방법 2: 수동 설정
```powershell
ngrok config add-authtoken YOUR_TOKEN
```

### 방법 3: 직접 입력
프로젝트 루트에서 다음 명령어 실행:
```powershell
$token = Read-Host "인증 토큰을 입력하세요"
ngrok config add-authtoken $token
```

## ✅ 설정 확인

인증 토큰이 제대로 설정되었는지 확인:
```powershell
ngrok config check
```

또는:
```powershell
cat $env:USERPROFILE\.ngrok2\ngrok.yml
```

## 🚀 인증 후 사용

인증 토큰을 설정한 후:

1. **기존 ngrok 터널 종료**
   - ngrok 창 닫기

2. **터널 재시작**
   ```powershell
   ngrok http 3001  # 백엔드
   ngrok http 3000  # 프론트엔드
   ```

3. **대시보드 확인**
   - https://dashboard.ngrok.com 접속
   - 활성 터널 확인
   - 통계 및 모니터링 확인

## 💡 인증 토큰의 장점

### 무료 플랜 (인증 없음)
- ⚠️ 세션 시간 제한 (8시간)
- ⚠️ 제한된 기능
- ⚠️ 주소가 매번 변경

### 무료 플랜 (인증 있음)
- ✅ 더 긴 세션 시간
- ✅ 더 많은 기능
- ✅ 대시보드 모니터링
- ✅ 통계 확인

## 🔒 보안 주의사항

- ⚠️ 인증 토큰을 절대 공유하지 마세요
- ⚠️ GitHub에 커밋하지 마세요
- ⚠️ 환경 변수 파일에 저장하지 마세요 (로컬 설정 파일에만)

## 📚 참고

- [ngrok 공식 문서](https://ngrok.com/docs)
- [ngrok 대시보드](https://dashboard.ngrok.com)
- [EXTERNAL_ACCESS_GUIDE.md](EXTERNAL_ACCESS_GUIDE.md)

