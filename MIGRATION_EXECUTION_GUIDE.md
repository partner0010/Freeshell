# 데이터베이스 마이그레이션 실행 가이드

## ⚠️ 현재 상황

한글 경로 문제로 인해 자동 실행이 어려운 상황입니다. 다음 방법 중 하나를 사용하여 수동으로 실행해주세요.

## 🚀 실행 방법

### 방법 1: Windows 탐색기에서 실행 (가장 간단)

1. **Windows 탐색기 열기**
2. **프로젝트 폴더로 이동**
   - `C:\Users\partn\OneDrive\바탕 화면\Cursor\TinTop\backend`
3. **`run-migration.bat` 파일 더블클릭**

### 방법 2: 명령 프롬프트(CMD) 사용

1. **Windows 키 + R** 누르기
2. **`cmd` 입력 후 Enter**
3. **다음 명령어 실행:**

```cmd
cd /d "C:\Users\partn\OneDrive\바탕 화면\Cursor\TinTop\backend"
run-migration.bat
```

### 방법 3: PowerShell에서 직접 실행

**주의**: PowerShell에서 한글 경로가 깨질 수 있습니다.

```powershell
# 현재 디렉토리 확인
Get-Location

# backend 폴더로 이동 (이미 backend에 있다면 생략)
cd backend

# 환경 변수 설정
$env:DATABASE_URL="file:./data/database.db"

# data 디렉토리 생성
if (-not (Test-Path data)) { New-Item -ItemType Directory -Path data -Force }

# 의존성 설치 (처음만)
if (-not (Test-Path node_modules)) { npm install }

# Prisma 클라이언트 생성
npm run prisma:generate

# 마이그레이션 실행
npm run prisma:migrate -- --name comprehensive_upgrade
```

### 방법 4: VS Code 터미널 사용

1. **VS Code에서 프로젝트 열기**
2. **터미널 열기** (Ctrl + `)
3. **다음 명령어 실행:**

```bash
cd backend
npm install  # 처음만
$env:DATABASE_URL="file:./data/database.db"
npm run prisma:generate
npm run prisma:migrate -- --name comprehensive_upgrade
```

## ✅ 성공 확인

마이그레이션이 성공하면:

1. **데이터베이스 파일 생성 확인**
   - `backend/data/database.db` 파일이 생성되었는지 확인

2. **성공 메시지 확인**
   ```
   ✅ Prisma 클라이언트 생성 완료
   ✅ 마이그레이션 완료
   🎉 모든 작업이 완료되었습니다!
   ```

3. **Prisma Studio로 확인 (선택사항)**
   ```bash
   cd backend
   npm run prisma:studio
   ```
   - 브라우저에서 데이터베이스 구조 확인 가능

## ❌ 오류 발생 시

### 오류: "Prisma schema validation - The datasource property `url` is no longer supported"

**원인**: Prisma 7.0.1이 설치되어 있지만, package.json에는 5.7.1이 명시되어 있습니다.

**해결 방법**:
1. **로컬 Prisma 설치 확인**
   ```bash
   cd backend
   npm install
   ```

2. **로컬 Prisma 사용**
   ```bash
   npx prisma@5.7.1 generate
   npx prisma@5.7.1 migrate dev --name comprehensive_upgrade
   ```

### 오류: "prisma is not recognized"

**원인**: Prisma가 설치되지 않았습니다.

**해결 방법**:
```bash
cd backend
npm install
```

## 📋 마이그레이션 후 다음 단계

마이그레이션이 완료되면:

1. **로컬 테스트 진행**
   - 백엔드 서버 실행: `npm run dev`
   - 프론트엔드 서버 실행: `npm run dev`

2. **기능 테스트**
   - 회원가입/로그인
   - 콘텐츠 생성
   - 플랫폼 연동
   - 등등...

3. **서버 배포**
   - AWS Lightsail 또는 Cafe24 VPS
   - `backend/README.md` 참고

## 💡 팁

- **한글 경로 문제**가 계속 발생하면, 프로젝트를 영문 경로로 이동하는 것을 고려해보세요.
- 예: `C:\Projects\TinTop`

