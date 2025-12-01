# 로컬 테스트 준비 가이드

## 📋 사전 준비 단계

### 1단계: 환경 변수 파일 생성

```bash
cd backend
copy .env.example .env
```

또는 수동으로 `backend/.env` 파일을 생성하고 다음 내용을 입력:

```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
DATABASE_URL="file:./data/database.db"

# 최소 하나의 AI API 키 필요
OPENAI_API_KEY=your_key_here
# 또는
CLAUDE_API_KEY=your_key_here

# JWT Secret (32자 이상 랜덤 문자열)
JWT_SECRET=your_random_secret_key_min_32_characters_long

# 암호화 키 (32자 이상)
ENCRYPTION_KEY=your_encryption_key_min_32_characters

# API Key (선택)
API_KEY=your_api_key_optional
```

**중요**: 
- `JWT_SECRET`과 `ENCRYPTION_KEY`는 반드시 32자 이상의 랜덤 문자열로 설정하세요
- 최소 하나의 AI API 키(`OPENAI_API_KEY` 또는 `CLAUDE_API_KEY`)는 필수입니다

### 2단계: 데이터베이스 마이그레이션

```bash
cd backend

# Prisma 클라이언트 생성
npx prisma generate

# 데이터베이스 마이그레이션 실행
npx prisma migrate dev --name add_oauth_tokens_and_user_features
```

**예상 출력**:
```
✔ Generated Prisma Client
✔ Created migration: add_oauth_tokens_and_user_features
✔ Applied migration: add_oauth_tokens_and_user_features
```

### 3단계: 필수 디렉토리 확인

다음 디렉토리들이 자동으로 생성되지만, 확인해보세요:

```
backend/
├── data/              # 데이터베이스 파일
├── uploads/
│   ├── images/       # 업로드된 이미지
│   ├── videos/       # 생성된 비디오
│   └── temp/         # 임시 파일
└── logs/             # 로그 파일
```

### 4단계: 의존성 설치

#### 백엔드
```bash
cd backend
npm.cmd install
```

#### 프론트엔드
```bash
# 프로젝트 루트에서
npm.cmd install
```

---

## 🚀 로컬 테스트 실행

### 백엔드 서버 시작

```bash
cd backend
npm.cmd run dev
```

**성공 메시지**:
```
✅ 서버가 http://localhost:3001 에서 실행 중입니다
```

### 프론트엔드 서버 시작 (새 터미널)

```bash
# 프로젝트 루트에서
npm.cmd run dev
```

**성공 메시지**:
```
  VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:5173/
```

---

## ✅ 테스트 체크리스트

### 기본 기능 테스트

1. **헬스 체크**
   - 브라우저에서 `http://localhost:3001/api/health` 접속
   - JSON 응답 확인

2. **회원가입**
   - `http://localhost:5173/register` 접속
   - 이메일, 사용자명, 비밀번호 입력
   - 회원가입 성공 확인

3. **로그인**
   - `http://localhost:5173/login` 접속
   - 로그인 성공 확인

4. **프로필 관리**
   - 프로필 페이지 접속
   - 프로필 편집 테스트
   - 비밀번호 변경 테스트
   - 통계 확인

5. **콘텐츠 생성**
   - 콘텐츠 생성 페이지 접속
   - 콘텐츠 생성 테스트
   - 미리보기 확인

### 고급 기능 테스트

6. **YouTube OAuth** (선택)
   - 설정 페이지 접속
   - YouTube 인증 버튼 클릭
   - OAuth 플로우 확인

7. **비디오 편집** (FFmpeg 필요)
   - 콘텐츠 생성 시 고급 편집 옵션 테스트

---

## 🐛 문제 해결

### 데이터베이스 마이그레이션 오류

**오류**: `Migration engine failed to connect`
**해결**:
```bash
# 데이터베이스 파일 삭제 후 재생성
cd backend
rm data/database.db
npx prisma migrate dev
```

### Prisma 클라이언트 오류

**오류**: `Cannot find module '@prisma/client'`
**해결**:
```bash
cd backend
npx prisma generate
npm.cmd install
```

### 포트 충돌

**오류**: `Port 3001 is already in use`
**해결**:
- `.env` 파일에서 `PORT` 값 변경
- 또는 사용 중인 프로세스 종료

### 환경 변수 오류

**오류**: `JWT_SECRET이 설정되지 않았습니다`
**해결**:
- `.env` 파일 확인
- `JWT_SECRET`과 `ENCRYPTION_KEY`가 32자 이상인지 확인

### FFmpeg 오류

**오류**: `FFmpeg를 찾을 수 없습니다`
**해결**:
- FFmpeg 설치 (선택사항, 비디오 생성 기능만 사용 불가)
- Windows: https://ffmpeg.org/download.html
- 또는 비디오 생성 없이 다른 기능 테스트

---

## 📝 다음 단계

로컬 테스트가 성공적으로 완료되면:

1. **서버 배포 준비**
   - `DEPLOYMENT_GUIDE.md` 참고
   - 서버 선택 및 신청
   - 배포 스크립트 실행

2. **프로덕션 환경 변수 설정**
   - 서버에서 `.env` 파일 설정
   - 실제 API 키 설정
   - 보안 키 생성

---

## 💡 팁

- **개발 중**: `npm.cmd run dev` 사용 (핫 리로드)
- **프로덕션**: `npm.cmd run build` 후 `npm.cmd start`
- **데이터베이스 확인**: `npx prisma studio` (브라우저에서 데이터 확인)

