# Supabase Connection String 찾기

## 현재 위치: Database Settings

현재 Database Settings 페이지에 있습니다. Connection String을 찾으려면:

### 방법 1: API Settings에서 찾기 (추천)

1. 왼쪽 사이드바에서 **"Project Settings"** 클릭 (맨 아래)
2. **"API"** 메뉴 클릭
3. **"Database"** 섹션 찾기
4. **"Connection string"** 또는 **"Connection pooling"** 섹션에서 URI 복사

### 방법 2: Database 메뉴에서 찾기

1. 왼쪽 사이드바에서 **"Database"** 클릭 (현재 위치)
2. 상단 탭에서 **"Connection string"** 또는 **"Connection pooling"** 클릭
3. **"URI"** 탭 선택
4. Connection string 복사

### 방법 3: 직접 URL 접근

브라우저 주소창에 다음 URL 입력:
```
https://supabase.com/dashboard/project/yrpjsdyqgdwgueqrvshp/settings/database
```

또는

```
https://supabase.com/dashboard/project/yrpjsdyqgdwgueqrvshp/settings/api
```

## Connection String 형식

복사한 Connection String은 다음과 같은 형식입니다:

```
postgresql://postgres.yrpjsdyqgdwgueqrvshp:[YOUR-PASSWORD]@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres
```

또는

```
postgresql://postgres:[YOUR-PASSWORD]@db.yrpjsdyqgdwgueqrvshp.supabase.co:5432/postgres
```

## 비밀번호 확인

Connection String에 `[YOUR-PASSWORD]`가 있다면:

1. 현재 페이지에서 **"Reset database password"** 버튼 클릭
2. 새 비밀번호 설정
3. 설정한 비밀번호로 `[YOUR-PASSWORD]` 부분 교체

또는 프로젝트 생성 시 설정한 비밀번호를 사용하세요.

## 다음 단계

Connection String을 복사했다면:

1. `.env` 파일에 추가:
   ```env
   DATABASE_URL="복사한_connection_string"
   ```

2. 비밀번호 교체 (필요시)

3. 마이그레이션 실행:
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

