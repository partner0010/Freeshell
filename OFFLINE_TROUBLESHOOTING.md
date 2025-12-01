# 오프라인 문제 해결 가이드

## 🚨 온라인이 안 될 때 사용하는 가이드

프로그램에 문제가 생겼는데 온라인에 접속할 수 없을 때 사용하는 자가 진단 및 복구 시스템입니다.

---

## 🔧 자동 문제 해결 도구

### 1. 오프라인 문제 해결 스크립트 (Windows)

```powershell
# 프로젝트 루트에서 실행
.\scripts\offline-troubleshooter.ps1
```

**이 스크립트가 자동으로 확인하는 것들**:
- ✅ Node.js 설치 확인
- ✅ npm 설치 확인
- ✅ 프로젝트 구조 확인
- ✅ 환경 변수 파일 확인 및 생성
- ✅ 필수 디렉토리 생성
- ✅ 의존성 설치 확인
- ✅ 데이터베이스 확인 및 마이그레이션
- ✅ 포트 사용 확인

### 2. 백엔드 자가 진단 API

서버가 실행 중이라면:

```bash
# 브라우저에서 접속
http://localhost:3001/api/diagnosis
```

**또는 자동 복구**:
```bash
# POST 요청으로 자동 복구 시도
curl -X POST http://localhost:3001/api/diagnosis/fix
```

---

## 📋 일반적인 문제 및 해결 방법

### 문제 1: 서버가 시작되지 않음

**증상**: `npm.cmd run dev` 실행 시 오류

**해결**:
1. 오프라인 문제 해결 스크립트 실행
2. `.env` 파일 확인
3. `node_modules` 삭제 후 재설치:
   ```powershell
   cd backend
   Remove-Item -Recurse -Force node_modules
   npm.cmd install
   ```

### 문제 2: 데이터베이스 오류

**증상**: "데이터베이스 연결 실패" 오류

**해결**:
```powershell
cd backend
npx prisma generate
npx prisma migrate dev
```

### 문제 3: 포트 충돌

**증상**: "포트 3001이 이미 사용 중입니다"

**해결 방법 1**: 다른 포트 사용
```powershell
# .env 파일 수정
PORT=3002
```

**해결 방법 2**: 사용 중인 프로세스 종료
```powershell
# 포트 사용 중인 프로세스 찾기
netstat -ano | findstr :3001

# PID 확인 후 종료 (예: PID가 1234인 경우)
taskkill /PID 1234 /F
```

### 문제 4: 환경 변수 오류

**증상**: "JWT_SECRET이 설정되지 않았습니다"

**해결**:
1. `backend/.env` 파일 확인
2. 다음 내용 추가:
   ```env
   JWT_SECRET=your_random_secret_key_min_32_characters_long
   ENCRYPTION_KEY=your_encryption_key_min_32_characters
   ```

### 문제 5: 의존성 오류

**증상**: "Cannot find module" 오류

**해결**:
```powershell
cd backend
Remove-Item -Recurse -Force node_modules
npm.cmd install
```

### 문제 6: Prisma 오류

**증상**: "@prisma/client를 찾을 수 없습니다"

**해결**:
```powershell
cd backend
npx prisma generate
npm.cmd install
```

---

## 🤖 자동 진단 및 복구 시스템

### 백엔드에 내장된 기능

프로그램에는 자동으로 문제를 진단하고 해결하는 시스템이 내장되어 있습니다:

1. **자가 진단 시스템** (`/api/diagnosis`)
   - 시스템 상태 자동 확인
   - 문제점 자동 발견
   - 해결 방법 제시

2. **자동 복구 시스템** (`/api/diagnosis/fix`)
   - 자동으로 수정 가능한 문제 해결
   - 디렉토리 생성
   - 의존성 설치

3. **에러 분석 시스템** (`/api/diagnosis/analyze-error`)
   - 에러 메시지 분석
   - 원인 파악
   - 해결책 제시

---

## 📝 문제 해결 체크리스트

문제가 발생했을 때 순서대로 확인:

- [ ] 오프라인 문제 해결 스크립트 실행
- [ ] `.env` 파일 확인 (API 키, JWT_SECRET 등)
- [ ] `node_modules` 재설치
- [ ] Prisma 클라이언트 재생성 (`npx prisma generate`)
- [ ] 데이터베이스 마이그레이션 (`npx prisma migrate dev`)
- [ ] 포트 사용 확인
- [ ] 로그 파일 확인 (`backend/logs/` 폴더)
- [ ] 자가 진단 API 확인 (`/api/diagnosis`)

---

## 🆘 여전히 해결되지 않으면

1. **로그 파일 확인**
   - `backend/logs/` 폴더의 최신 로그 확인
   - 에러 메시지 복사

2. **에러 정보 수집**
   - 에러 메시지 전체
   - 발생 시점
   - 실행한 명령어

3. **백업 및 복구**
   - 데이터베이스 백업 (`backend/data/database.db` 복사)
   - 환경 변수 백업 (`.env` 파일 복사)

---

## 💡 예방 조치

문제를 미리 방지하기 위해:

1. **정기적인 백업**
   - 데이터베이스 파일 백업
   - 환경 변수 파일 백업

2. **로그 모니터링**
   - 정기적으로 로그 확인
   - 이상 징후 조기 발견

3. **시스템 상태 확인**
   - 주기적으로 `/api/diagnosis` 실행
   - 문제 조기 발견

---

## ✅ 결론

이제 **온라인이 안 되어도** 프로그램의 문제를 자동으로 진단하고 해결할 수 있습니다!

**"공장장AI"**처럼 자동으로 문제를 찾고 수정하는 시스템이 내장되어 있습니다.

