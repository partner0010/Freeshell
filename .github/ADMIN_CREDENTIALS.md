# 👑 관리자 계정 정보

## 🔐 기본 관리자 계정

### 계정 정보
```
이메일: admin@freeshell.co.kr
비밀번호: Admin123!@#
역할: admin
```

---

## 📝 계정 생성 방법

### 데이터베이스에 직접 추가

#### 1. Prisma Studio 사용
```bash
cd backend
npx prisma studio
```

#### 2. SQL로 직접 추가
```sql
-- 비밀번호는 bcrypt로 해시된 값
INSERT INTO "User" (
  id,
  email,
  username,
  password,
  role,
  "isActive",
  "createdAt",
  "updatedAt"
) VALUES (
  'admin-001',
  'admin@freeshell.co.kr',
  'admin',
  '$2b$10$...',  -- bcrypt 해시 필요
  'admin',
  true,
  NOW(),
  NOW()
);
```

#### 3. API로 생성 (권장)
```typescript
// backend/src/scripts/createAdmin.ts 생성 필요

import { getPrismaClient } from '../utils/database'
import { hashPassword } from '../utils/encryption'

async function createAdmin() {
  const prisma = getPrismaClient()
  
  const hashedPassword = await hashPassword('Admin123!@#')
  
  const admin = await prisma.user.create({
    data: {
      email: 'admin@freeshell.co.kr',
      username: 'admin',
      password: hashedPassword,
      role: 'admin',
      isActive: true,
    }
  })
  
  console.log('관리자 생성 완료:', admin)
}

createAdmin()
```

---

## 🚀 사용 방법

### 1. 회원가입으로 첫 계정 생성
```
https://freeshell.co.kr/register

1. 이메일 입력
2. 사용자명 입력
3. 비밀번호 입력
4. 회원가입 클릭
```

### 2. 데이터베이스에서 role 변경
```sql
UPDATE "User" 
SET role = 'admin' 
WHERE email = '본인이메일@example.com';
```

### 3. 로그아웃 후 재로그인
```
https://freeshell.co.kr/login

관리자 권한으로 로그인됨
```

### 4. 관리자 페이지 접속
```
https://freeshell.co.kr/admin

👑 마스터 컨트롤 메뉴 표시됨
```

---

## 🔒 보안 권장사항

### 비밀번호 정책
```
최소 8자 이상
영문 대소문자 포함
숫자 포함
특수문자 포함

예: Admin123!@#
```

### 정기 변경
```
3개월마다 비밀번호 변경 권장
```

### 2FA (추가 권장)
```
Google Authenticator
이메일 인증
SMS 인증
```

---

## 👑 관리자 권한

### 접근 가능 기능
```
✅ /admin - 마스터 컨트롤
✅ 모든 사용자 관리
✅ 역할 변경
✅ 계정 활성화/비활성화
✅ 차단 기능
✅ 통계 조회
```

### 일반 사용자와의 차이
```
일반 사용자:
- 자신의 콘텐츠만 관리
- 기본 기능 사용

관리자:
- 모든 사용자 관리
- 모든 콘텐츠 조회
- 시스템 설정
- 통계 조회
- 긴급 조치 가능
```

---

## 📊 현재 역할 시스템

### 역할 종류
```typescript
user       - 일반 사용자
moderator  - 운영자 (준비 중)
admin      - 관리자
```

### 권한 체계
```
admin > moderator > user

admin:
- 모든 권한
- 사용자 관리
- 시스템 제어

moderator:
- 콘텐츠 검토
- 사용자 신고 처리

user:
- 기본 기능 사용
- 자신의 콘텐츠 관리
```

---

## 💡 빠른 시작

### 1단계: 첫 계정 만들기
```
1. https://freeshell.co.kr/register
2. 회원가입 완료
```

### 2단계: 관리자로 승급
```
방법 1: Prisma Studio
  npx prisma studio
  → User 테이블
  → role을 'admin'으로 변경

방법 2: SQL
  UPDATE "User" SET role = 'admin' 
  WHERE email = '본인이메일';
```

### 3단계: 재로그인
```
1. 로그아웃
2. 다시 로그인
3. 👑 마스터 컨트롤 메뉴 확인
```

---

**관리자 계정을 만들고 모든 기능을 제어하세요!** 👑✨

