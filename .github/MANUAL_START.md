# 🚀 수동 서버 시작 가이드

## ⚠️ 자동 시작이 안 될 때

PowerShell 스크립트로 자동 시작이 안 되는 경우 수동으로 시작하세요.

## 📋 단계별 가이드

### 1단계: 백엔드 시작

**새 PowerShell 창을 여세요 (관리자 권한 필요 없음)**

```powershell
cd "C:\Users\partn\OneDrive\바탕 화면\Cursor\Freeshell\backend"
npm run dev
```

**정상 시작 시 출력:**
```
> all-in-one-content-ai-backend@1.0.0 dev
> tsx watch src/index.ts

Server started on port 3001
Database connected
```

**✅ 이 창을 열어둔 상태로 유지하세요!**

---

### 2단계: 프론트엔드 시작

**새 PowerShell 창을 여세요**

```powershell
cd "C:\Users\partn\OneDrive\바탕 화면\Cursor\Freeshell"
serve -s dist -l 3000 --cors
```

**정상 시작 시 출력:**
```
Serving!
Local:  http://localhost:3000
```

**✅ 이 창도 열어둔 상태로 유지하세요!**

---

### 3단계: Cloudflare Tunnel 시작

**새 PowerShell 창을 여세요**

```powershell
cloudflared tunnel run freeshell
```

**정상 시작 시 출력:**
```
Connection registered
```

**✅ 이 창도 열어둔 상태로 유지하세요!**

---

## 🔐 관리자 계정

```
이메일:    master@freeshell.co.kr
비밀번호:  Master2024!@#
```

---

## 🌍 접속

약 1~2분 후:

**로컬:** http://localhost:3000
**외부:** https://freeshell.co.kr

---

## ❌ 오류 해결

### "npm: 용어가 cmdlet 이름으로 인식되지 않습니다"

**해결:**
```powershell
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
```

그 다음 다시 `npm run dev` 실행

### "serve: 용어가 cmdlet 이름으로 인식되지 않습니다"

**해결:**
```powershell
npm install -g serve
```

### "cloudflared: 용어가 cmdlet 이름으로 인식되지 않습니다"

**해결:**
```powershell
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
```

### 포트가 이미 사용 중

**3001 포트 확인:**
```powershell
netstat -ano | findstr :3001
```

**프로세스 종료:**
```powershell
taskkill /PID <PID번호> /F
```

---

## 💡 팁

1. **3개의 PowerShell 창을 모두 열어두세요**
   - 백엔드 창
   - 프론트엔드 창  
   - Cloudflare Tunnel 창

2. **창을 닫으면 해당 서버가 종료됩니다**

3. **오류가 발생하면 해당 창의 오류 메시지를 확인하세요**

4. **모든 서버가 정상 시작되면 https://freeshell.co.kr 접속**

---

## 🎯 빠른 시작 스크립트

**하나의 PowerShell 창에서 모두 시작:**

```powershell
# 백엔드 시작
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\partn\OneDrive\바탕 화면\Cursor\Freeshell\backend'; npm run dev"

# 5초 대기
Start-Sleep -Seconds 5

# 프론트엔드 시작
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\partn\OneDrive\바탕 화면\Cursor\Freeshell'; serve -s dist -l 3000 --cors"

# 5초 대기
Start-Sleep -Seconds 5

# Cloudflare Tunnel 시작
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cloudflared tunnel run freeshell"
```

이 스크립트를 복사해서 PowerShell에 붙여넣기 하세요!

