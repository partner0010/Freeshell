# 🔧 로그인 문제 해결 가이드

## ⚠️ 현재 상황
로그인이 안 되는 문제가 발생했습니다.

## 📝 새 관리자 계정

```
이메일:    master@freeshell.co.kr
사용자명:  master
비밀번호:  Master2024!@#
```

## 🔍 문제 진단

### 1단계: 백엔드 서버 실행 확인

**터미널 창을 확인하세요:**
- PowerShell 창 중 "=== 백엔드 ===" 라고 표시된 창 찾기
- 오류 메시지가 있는지 확인

**예상되는 정상 출력:**
```
Server started on port 3001
Database connected
```

**만약 오류가 있다면:**
```bash
cd backend
npm install
npm run dev
```

### 2단계: 데이터베이스 확인

```bash
cd backend
npx prisma studio
```

→ 브라우저에서 http://localhost:5555 열림
→ User 테이블에서 `master@freeshell.co.kr` 계정 확인

### 3단계: 수동으로 백엔드 시작

**새 PowerShell 창에서:**
```bash
cd C:\Users\partn\OneDrive\바탕 화면\Cursor\Freeshell\backend
npm run dev
```

**정상 시작되면:**
```
✓ Server started on port 3001
✓ Database connected
```

### 4단계: 로그인 테스트

**새 PowerShell 창에서:**
```powershell
$body = @{
    email = "master@freeshell.co.kr"
    password = "Master2024!@#"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" -Method POST -Body $body -ContentType "application/json"
```

**성공하면:**
```json
{
  "success": true,
  "user": {
    "email": "master@freeshell.co.kr",
    "username": "master",
    "role": "admin"
  },
  "token": "..."
}
```

## 🚀 완전 재시작 방법

### 방법 1: 스크립트 사용

**PowerShell에서:**
```bash
cd C:\Users\partn\OneDrive\바탕 화면\Cursor\Freeshell

# 백엔드 시작
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev"

# 5초 대기
Start-Sleep -Seconds 5

# 프론트엔드 시작
Start-Process powershell -ArgumentList "-NoExit", "-Command", "serve -s dist -l 3000 --cors"

# 5초 대기
Start-Sleep -Seconds 5

# Cloudflare Tunnel 시작
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cloudflared tunnel run freeshell"
```

### 방법 2: 수동 시작

**3개의 PowerShell 창을 열어서:**

**창 1 - 백엔드:**
```bash
cd C:\Users\partn\OneDrive\바탕 화면\Cursor\Freeshell\backend
npm run dev
```

**창 2 - 프론트엔드:**
```bash
cd C:\Users\partn\OneDrive\바탕 화면\Cursor\Freeshell
serve -s dist -l 3000 --cors
```

**창 3 - Cloudflare Tunnel:**
```bash
cloudflared tunnel run freeshell
```

## 🔐 로그인 확인

1. https://freeshell.co.kr 접속
2. 로그인 버튼 클릭
3. 계정 정보 입력:
   ```
   이메일: master@freeshell.co.kr
   비밀번호: Master2024!@#
   ```

## 💡 추가 팁

### 포트 충돌 확인
```powershell
netstat -ano | findstr :3001
```

만약 이미 사용 중이라면:
```powershell
taskkill /PID <PID번호> /F
```

### 데이터베이스 초기화
```bash
cd backend
npx prisma migrate reset
npm run seed
```

### 계정 재생성
```bash
cd backend
npm run create-admin
```

## 🆘 그래도 안 되면

1. 모든 PowerShell 창 닫기
2. 프로젝트 폴더로 이동
3. 위의 "방법 2: 수동 시작" 따라하기
4. 각 창에서 오류 메시지 확인
5. 오류 메시지와 함께 다시 문의

