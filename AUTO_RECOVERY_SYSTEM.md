# 자동 진단 및 복구 시스템 완료

## 🎉 완성된 기능

### 1. 자가 진단 시스템 (Self-Diagnosis)

프로그램이 스스로 문제를 찾아냅니다!

**기능**:
- ✅ 데이터베이스 연결 확인
- ✅ 환경 변수 확인
- ✅ 필수 디렉토리 확인
- ✅ 포트 사용 확인
- ✅ 의존성 확인
- ✅ 디스크 공간 확인

**사용 방법**:
```bash
# 브라우저에서
http://localhost:3001/api/diagnosis

# 또는 curl
curl http://localhost:3001/api/diagnosis
```

### 2. 자동 복구 시스템 (Auto-Recovery)

발견된 문제를 자동으로 해결합니다!

**자동으로 수정 가능한 문제**:
- ✅ 필수 디렉토리 생성
- ✅ 의존성 자동 설치
- ✅ 기타 자동 수정 가능한 문제

**사용 방법**:
```bash
# POST 요청으로 자동 복구
curl -X POST http://localhost:3001/api/diagnosis/fix
```

### 3. 에러 분석 시스템

에러가 발생하면 자동으로 분석하고 해결책을 제시합니다!

**기능**:
- ✅ 에러 타입별 분석
- ✅ 원인 파악
- ✅ 해결책 제시
- ✅ 자동 복구 시도 (가능한 경우)

**사용 방법**:
```bash
# 에러 분석
curl -X POST http://localhost:3001/api/diagnosis/analyze-error \
  -H "Content-Type: application/json" \
  -d '{"error": {"message": "에러 메시지"}}'

# 자동 복구 시도
curl -X POST http://localhost:3001/api/diagnosis/recover \
  -H "Content-Type: application/json" \
  -d '{"error": {"message": "에러 메시지"}}'
```

### 4. 오프라인 문제 해결 스크립트

**온라인이 안 될 때 사용하는 스크립트!**

```powershell
# 프로젝트 루트에서 실행
.\scripts\offline-troubleshooter.ps1
```

**자동으로 확인 및 수정**:
- ✅ Node.js/npm 설치 확인
- ✅ 프로젝트 구조 확인
- ✅ 환경 변수 파일 생성
- ✅ 필수 디렉토리 생성
- ✅ 의존성 설치
- ✅ 데이터베이스 마이그레이션
- ✅ 포트 확인

---

## 🚀 사용 예시

### 시나리오 1: 서버가 시작되지 않음

**1단계**: 오프라인 문제 해결 스크립트 실행
```powershell
.\scripts\offline-troubleshooter.ps1
```

**2단계**: 자가 진단 확인
```bash
http://localhost:3001/api/diagnosis
```

**3단계**: 자동 복구 시도
```bash
curl -X POST http://localhost:3001/api/diagnosis/fix
```

### 시나리오 2: 에러 발생

**1단계**: 에러 분석
```bash
curl -X POST http://localhost:3001/api/diagnosis/analyze-error \
  -H "Content-Type: application/json" \
  -d '{"error": {"message": "데이터베이스 연결 실패"}}'
```

**응답**:
```json
{
  "success": true,
  "analysis": {
    "diagnosis": "데이터베이스 연결 실패",
    "solution": "데이터베이스 서버가 실행 중인지 확인하거나 SQLite 파일이 존재하는지 확인하세요",
    "autoFixable": false,
    "fixCommand": "npx prisma migrate dev"
  }
}
```

**2단계**: 자동 복구 시도 (가능한 경우)
```bash
curl -X POST http://localhost:3001/api/diagnosis/recover \
  -H "Content-Type: application/json" \
  -d '{"error": {"message": "필수 디렉토리가 없습니다"}}'
```

---

## 📊 통합된 헬스 체크

기존 헬스 체크에 자가 진단이 통합되었습니다:

```bash
http://localhost:3001/api/health
```

**응답 예시**:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "diagnosis": {
    "status": "healthy",
    "issueCount": 0,
    "criticalIssues": 0
  }
}
```

---

## 🎯 "공장장AI" 기능

이제 프로그램이 **"공장장AI"**처럼 작동합니다:

1. **자동으로 문제 발견** ✅
2. **자동으로 원인 분석** ✅
3. **자동으로 해결책 제시** ✅
4. **자동으로 수정 가능한 문제 해결** ✅
5. **오프라인에서도 작동** ✅

---

## 📝 추가된 파일

### 백엔드
- `backend/src/services/selfDiagnosis.ts` - 자가 진단 시스템
- `backend/src/services/errorRecovery.ts` - 에러 분석 및 복구
- `backend/src/routes/diagnosis.ts` - 진단 API 라우트

### 스크립트
- `scripts/offline-troubleshooter.ps1` - 오프라인 문제 해결 스크립트

### 문서
- `OFFLINE_TROUBLESHOOTING.md` - 오프라인 문제 해결 가이드
- `AUTO_RECOVERY_SYSTEM.md` - 자동 복구 시스템 설명

---

## ✅ 완료!

이제 **온라인이 안 되어도** 프로그램의 문제를 자동으로 진단하고 해결할 수 있습니다!

**"공장장AI"** 기능이 완성되었습니다! 🎉

