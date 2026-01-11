# 데이터베이스 마이그레이션 가이드

## 📋 개요

메모리 기반 스토리지에서 PostgreSQL + Prisma로 마이그레이션합니다.

## 🔧 설정 단계

### 1. 데이터베이스 준비

#### 옵션 A: Supabase (무료 티어 추천)
1. [Supabase](https://supabase.com)에서 계정 생성
2. 새 프로젝트 생성
3. Settings > Database에서 Connection String 복사
4. `DATABASE_URL` 환경 변수에 설정

#### 옵션 B: PostgreSQL 로컬 설치
```bash
# Docker 사용
docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres

# DATABASE_URL 설정
DATABASE_URL="postgresql://postgres:password@localhost:5432/shell?schema=public"
```

#### 옵션 C: Neon (무료 PostgreSQL)
1. [Neon](https://neon.tech)에서 계정 생성
2. 프로젝트 생성 후 Connection String 복사
3. `DATABASE_URL` 환경 변수에 설정

### 2. 환경 변수 설정

`.env` 파일에 추가:
```env
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"
```

### 3. 마이그레이션 실행

```bash
# Prisma 마이그레이션 생성
npx prisma migrate dev --name init

# Prisma Client 생성
npx prisma generate
```

### 4. 데이터 마이그레이션 (선택사항)

기존 메모리 데이터가 있다면 마이그레이션 스크립트 실행:
```bash
npm run migrate:data
```

## 📊 스키마 구조

### User (사용자)
- id: String (CUID)
- email: String (Unique)
- password: String (해시)
- plan: PlanType (FREE, PERSONAL, PRO, ENTERPRISE)
- createdAt, updatedAt

### Project (프로젝트)
- id: String (CUID)
- userId: String (User 외래키)
- title: String
- targetAudience: String
- purpose: ProjectPurpose (TRAFFIC, CONVERSION, BRANDING)
- platform: String
- contentType: ContentType
- templateId: String? (Optional)
- createdAt, updatedAt

### AIStepResult (AI 단계 결과)
- id: String (CUID)
- projectId: String (Project 외래키)
- stepType: StepType (PLAN, STRUCTURE, DRAFT, QUALITY, PLATFORM)
- inputData: Json
- outputData: Json? (Optional)
- status: StepStatus (SUCCESS, RETRY, FAILED)
- createdAt, updatedAt

### Payment (결제)
- id: String (CUID)
- userId: String (User 외래키)
- plan: PlanType
- amount: Float
- periodStart: DateTime
- periodEnd: DateTime
- status: PaymentStatus (PENDING, COMPLETED, FAILED, CANCELLED)
- stripePaymentIntentId: String? (Optional)
- createdAt, updatedAt

## 🔄 마이그레이션 후 작업

1. **서비스 레이어 업데이트**
   - `lib/services/userService.ts` - Prisma 사용
   - `lib/services/projectService.ts` - Prisma 사용
   - `lib/services/paymentService.ts` - Prisma 사용

2. **기존 스토리지 제거**
   - `lib/db/storage.ts`는 개발/테스트용으로만 유지
   - 프로덕션에서는 Prisma만 사용

3. **테스트**
   - 모든 API 엔드포인트 테스트
   - 데이터 CRUD 작업 확인

## ⚠️ 주의사항

- 프로덕션 배포 전 반드시 백업
- 마이그레이션은 순차적으로 실행
- 환경 변수는 안전하게 관리
- 데이터베이스 연결 풀 설정 확인

## 📚 참고 자료

- [Prisma 문서](https://www.prisma.io/docs)
- [PostgreSQL 문서](https://www.postgresql.org/docs/)
- [Supabase 문서](https://supabase.com/docs)

