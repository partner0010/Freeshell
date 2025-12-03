# ❌ 왜 안되는 걸까?

## 🔍 문제 분석

### 발견된 문제
**PowerShell 자동 시작 스크립트가 제대로 작동하지 않음**

### 원인
1. **경로 문제**: 스크립트가 잘못된 경로(`src` 폴더)에서 실행됨
2. **프로세스 분리**: 백그라운드로 시작된 PowerShell 창의 상태를 추적할 수 없음
3. **초기화 시간**: 백엔드가 시작되는데 예상보다 오래 걸림

---

## ✅ 해결 방법

### 가장 확실한 방법: 수동 시작

**1. 백엔드 시작**

새 PowerShell 창을 열고:
```powershell
cd "C:\Users\partn\OneDrive\바탕 화면\Cursor\Freeshell\backend"
npm run dev
```

**반드시 다음 메시지가 보여야 합니다:**
```
✓ Server started on port 3001
✓ Database connected
```

이 메시지가 안 보이면:
- 오류 메시지를 확인하세요
- `npm install` 실행 후 다시 시도
- 포트가 사용 중인지 확인: `netstat -ano | findstr :3001`

---

**2. 프론트엔드 시작** (백엔드가 정상 시작된 후)

또 다른 PowerShell 창:
```powershell
cd "C:\Users\partn\OneDrive\바탕 화면\Cursor\Freeshell"
serve -s dist -l 3000 --cors
```

---

**3. Cloudflare Tunnel 시작**

또 다른 PowerShell 창:
```powershell
cloudflared tunnel run freeshell
```

---

## 🔐 로그인 정보

```
이메일:    master@freeshell.co.kr
비밀번호:  Master2024!@#
```

---

## 📊 확인 방법

### 백엔드가 실행 중인지 확인
```powershell
Invoke-RestMethod -Uri "http://localhost:3001/api/health"
```

성공하면 응답이 옵니다.

### 로그인 테스트
```powershell
$body = @{
    email = "master@freeshell.co.kr"
    password = "Master2024!@#"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" -Method POST -Body $body -ContentType "application/json"
```

성공하면 사용자 정보와 토큰이 반환됩니다.

---

## 🎯 체크리스트

백엔드 PowerShell 창에서 확인:

- [ ] `npm run dev` 명령어 실행됨
- [ ] `Server started on port 3001` 메시지 보임
- [ ] `Database connected` 메시지 보임
- [ ] 오류 메시지가 없음

모두 체크되면 → https://freeshell.co.kr 접속 가능!

---

## 💡 자주 발생하는 오류

### "EADDRINUSE: port 3001 already in use"
**해결:**
```powershell
netstat -ano | findstr :3001
taskkill /PID <PID번호> /F
```

### "Cannot find module"
**해결:**
```powershell
cd backend
npm install
```

### "Prisma Client not generated"
**해결:**
```powershell
cd backend
npx prisma generate
```

---

## 📖 추가 문서

- `.github/MANUAL_START.md` - 수동 시작 상세 가이드
- `.github/FINAL_INSTRUCTIONS.md` - 최종 지침
- `.github/TROUBLESHOOTING.md` - 문제 해결 가이드

---

## 🆘 그래도 안 되면

**백엔드 PowerShell 창의 전체 내용(오류 포함)을 복사해서 알려주세요!**

초록색 제목의 PowerShell 창이 없다면 수동으로 시작해야 합니다.

