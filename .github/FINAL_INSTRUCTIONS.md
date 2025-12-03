# 🚀 최종 서버 시작 가이드

## ⚠️ 중요

자동 스크립트가 제대로 작동하지 않습니다.
**PowerShell 창을 직접 확인하고 수동으로 시작해주세요.**

---

## 📋 확인사항

### 1. PowerShell 창 확인
화면에 다음과 같은 PowerShell 창들이 열렸나요?
- 🟢 **초록색 헤더**: "🚀 백엔드 서버"
- 🔵 **파란색 헤더**: "🌐 프론트엔드 서버"  
- 🟣 **보라색 헤더**: "🌍 Cloudflare Tunnel"

### 2. 백엔드 창 확인 (가장 중요!)
🟢 초록색 창을 찾아서 확인하세요:

**정상인 경우:**
```
Server started on port 3001
Database connected
```

**오류가 있는 경우:**
- 오류 메시지를 확인하고 알려주세요
- 또는 그 창을 닫고 수동으로 다시 시작하세요

---

## 🔧 수동 시작 방법

### 백엔드만 수동 시작

**새 PowerShell 창을 여세요:**
```powershell
cd "C:\Users\partn\OneDrive\바탕 화면\Cursor\Freeshell\backend"
npm run dev
```

**이 메시지가 보이면 성공:**
```
✓ Server started on port 3001
✓ Database connected
```

---

## 🔐 관리자 계정

```
이메일:    master@freeshell.co.kr
비밀번호:  Master2024!@#
```

---

## 🌍 접속

백엔드가 정상 시작되면:

**https://freeshell.co.kr**

---

## ✅ 완료된 수정사항

1. ✅ 비밀번호 아이콘 중복 제거 (이제 1개만 표시)
2. ✅ Lock 아이콘 제거
3. ✅ 관리자 계정 생성 완료
4. ✅ 프론트엔드 빌드 완료

---

## 💡 빠른 체크리스트

### 백엔드 확인
```powershell
# 이 명령어로 백엔드가 실행 중인지 확인
netstat -ano | findstr :3001
```

결과가 나오면 백엔드가 실행 중입니다.

### 수동 로그인 테스트
백엔드가 실행 중이라면:
```powershell
$body = @{
    email = "master@freeshell.co.kr"
    password = "Master2024!@#"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" -Method POST -Body $body -ContentType "application/json"
```

성공하면 사용자 정보가 표시됩니다.

---

## 🆘 도움이 필요하면

1. 🟢 초록색 백엔드 창의 오류 메시지 확인
2. 오류 메시지를 알려주세요
3. 또는 수동 시작 방법대로 다시 시작하세요

**백엔드만 정상 실행되면 로그인 가능합니다!**

