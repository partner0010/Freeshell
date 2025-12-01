# ✅ ngrok 외부 접속 설정 완료

## 완료된 작업

1. ✅ ngrok 다운로드 및 설치
2. ✅ PATH 환경 변수 추가
3. ✅ ngrok 터널 시작

## 📱 외부 접속 주소 확인

### 방법 1: ngrok 창에서 확인
ngrok이 실행된 창에서 다음과 같은 주소를 확인할 수 있습니다:
```
Forwarding  https://xxxx-xx-xx-xx-xx.ngrok-free.app -> http://localhost:3001
```

### 방법 2: ngrok 대시보드
브라우저에서 다음 주소를 열어주세요:
```
http://localhost:4040
```

## 🔐 인증 토큰 설정 (선택, 권장)

무료 플랜에서도 더 많은 기능을 사용하려면 인증 토큰이 필요합니다:

1. https://dashboard.ngrok.com/signup 접속
2. 무료 계정 생성
3. 인증 토큰 복사
4. 다음 명령어 실행:
```powershell
ngrok config add-authtoken YOUR_TOKEN
```

## 🚀 사용 방법

### 백엔드 터널
- 외부 주소: `https://xxxx.ngrok-free.app`
- 로컬 주소: `http://localhost:3001`

### 프론트엔드 터널
- 외부 주소: `https://yyyy.ngrok-free.app`
- 로컬 주소: `http://localhost:3000`

## ⚠️ 주의사항

1. **주소 변경**: 무료 플랜은 ngrok을 재시작할 때마다 주소가 변경됩니다.
2. **세션 제한**: 무료 플랜은 8시간 후 자동 종료됩니다.
3. **인증 필요**: 일부 기능은 인증 토큰이 필요할 수 있습니다.

## 🔄 터널 재시작

터널을 재시작하려면:
1. ngrok 창을 닫습니다
2. 다시 실행:
```powershell
ngrok http 3001  # 백엔드
ngrok http 3000  # 프론트엔드
```

## 📚 참고

- [ngrok 공식 문서](https://ngrok.com/docs)
- [EXTERNAL_ACCESS_GUIDE.md](EXTERNAL_ACCESS_GUIDE.md) - 상세 가이드

