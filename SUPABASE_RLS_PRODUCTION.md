# Supabase RLS 프로덕션 설정 가이드

## 현재 상태

✅ **개발 단계 설정 완료**
- RLS 활성화 완료
- 개발용 정책 설정 (모든 접근 허용)
- 경고 4개 있지만 개발 단계에서는 문제 없음

## 프로덕션 배포 전 작업 (옵션 2)

프로덕션 배포 전에 더 구체적인 RLS 정책을 설정해야 합니다.

### 1. NextAuth와 Supabase 통합 방법

이 프로젝트는 NextAuth를 사용하므로, Supabase의 `auth.uid()`를 직접 사용할 수 없습니다. 대신 다음과 같은 방법을 사용할 수 있습니다:

#### 방법 A: Service Role Key 사용 (권장)

NextAuth API 라우트에서 Supabase의 Service Role Key를 사용하여 데이터베이스에 접근합니다.

**환경 변수 설정:**
```env
# .env.local
SUPABASE_URL=https://yrpjsdyqgdwgueqrvshp.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**참고:** Service Role Key는 Supabase 대시보드 → Settings → API → service_role key에서 확인할 수 있습니다.

#### 방법 B: 사용자 ID를 직접 전달

Prisma를 통해 데이터베이스에 접근할 때, NextAuth 세션의 사용자 ID를 사용하여 필터링합니다.

### 2. 프로덕션용 RLS 정책 예시

프로덕션 배포 전에 다음 SQL 스크립트를 실행하여 더 구체적인 정책을 설정할 수 있습니다:

```sql
-- 기존 정책 삭제
DROP POLICY IF EXISTS "Enable all access for all users" ON users;
DROP POLICY IF EXISTS "Enable all access for all users" ON projects;
DROP POLICY IF EXISTS "Enable all access for all users" ON ai_step_results;
DROP POLICY IF EXISTS "Enable all access for all users" ON payments;

-- Users 테이블: 자신의 데이터만 접근 가능
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT
    USING (id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE
    USING (id = current_setting('app.current_user_id', true))
    WITH CHECK (id = current_setting('app.current_user_id', true));

-- Projects 테이블: 자신의 프로젝트만 접근 가능
CREATE POLICY "Users can view own projects" ON projects
    FOR SELECT
    USING (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can create own projects" ON projects
    FOR INSERT
    WITH CHECK (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can update own projects" ON projects
    FOR UPDATE
    USING (user_id = current_setting('app.current_user_id', true))
    WITH CHECK (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can delete own projects" ON projects
    FOR DELETE
    USING (user_id = current_setting('app.current_user_id', true));

-- AI Step Results: 자신의 프로젝트 결과만 접근 가능
CREATE POLICY "Users can view own project results" ON ai_step_results
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = ai_step_results.project_id
            AND projects.user_id = current_setting('app.current_user_id', true)
        )
    );

CREATE POLICY "Users can create own project results" ON ai_step_results
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = ai_step_results.project_id
            AND projects.user_id = current_setting('app.current_user_id', true)
        )
    );

CREATE POLICY "Users can update own project results" ON ai_step_results
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = ai_step_results.project_id
            AND projects.user_id = current_setting('app.current_user_id', true)
        )
    );

CREATE POLICY "Users can delete own project results" ON ai_step_results
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = ai_step_results.project_id
            AND projects.user_id = current_setting('app.current_user_id', true)
        )
    );

-- Payments: 자신의 결제만 접근 가능
CREATE POLICY "Users can view own payments" ON payments
    FOR SELECT
    USING (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can create own payments" ON payments
    FOR INSERT
    WITH CHECK (user_id = current_setting('app.current_user_id', true));
```

**중요:** 위 예시는 `current_setting('app.current_user_id')`를 사용합니다. 이는 Prisma를 통해 데이터베이스에 접근할 때 사용자 ID를 설정해야 합니다.

### 3. Prisma에서 사용자 ID 설정

Prisma Client를 사용할 때 사용자 ID를 설정하려면:

```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function withUserContext<T>(
  userId: string,
  callback: (prisma: PrismaClient) => Promise<T>
) {
  // 사용자 ID를 데이터베이스 세션에 설정
  await prisma.$executeRaw`SET app.current_user_id = ${userId}`;
  
  try {
    return await callback(prisma);
  } finally {
    // 세션 초기화
    await prisma.$executeRaw`RESET app.current_user_id`;
  }
}

// 사용 예시
const projects = await withUserContext(userId, async (db) => {
  return db.project.findMany();
});
```

### 4. 더 간단한 방법: 애플리케이션 레벨에서 필터링

RLS 대신 애플리케이션 코드에서 필터링하는 방법도 있습니다:

```typescript
// API 라우트 예시
import { getServerSession } from 'next-auth/next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const session = await getServerSession();
  
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  // 애플리케이션 레벨에서 필터링
  const projects = await prisma.project.findMany({
    where: {
      userId: session.user.id
    }
  });
  
  return Response.json(projects);
}
```

**참고:** 이 방법은 RLS를 사용하지 않으므로, 데이터베이스 직접 접근 시 보안이 약할 수 있습니다.

### 5. 권장 접근 방법

**개발 단계:**
- 현재 설정 사용 (RLS 활성화, 모든 접근 허용)
- 애플리케이션 코드에서 필터링

**프로덕션 배포:**
- Service Role Key 사용 (RLS 우회)
- 또는 애플리케이션 레벨에서 필터링
- 또는 Supabase Auth로 마이그레이션 (더 복잡)

### 6. 실행 순서

프로덕션 배포 전:

1. **Supabase 대시보드 → Settings → API**에서 Service Role Key 확인
2. **환경 변수 설정** (`.env.production`)
3. **API 라우트 수정** (Service Role Key 사용 또는 애플리케이션 레벨 필터링)
4. **테스트** (프로덕션 환경에서 충분히 테스트)

### 7. 주의사항

- Service Role Key는 **절대 클라이언트에 노출되면 안 됩니다**
- Service Role Key는 서버 사이드에서만 사용해야 합니다
- 프로덕션 환경에서는 반드시 환경 변수로 관리해야 합니다

---

**현재 상태:** 개발 단계 설정 완료 ✅  
**다음 단계:** 애플리케이션 개발 진행 → 프로덕션 배포 전 옵션 2 적용
