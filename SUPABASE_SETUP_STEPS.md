# Supabase 데이터베이스 연결 단계

## 1단계: Connection String 가져오기

1. Supabase 대시보드에서 **Settings** (왼쪽 사이드바 맨 아래) 클릭
2. **Database** 메뉴 클릭
3. **Connection string** 섹션 찾기
4. **URI** 탭 선택
5. Connection string 복사
   - 예시: `postgresql://postgres.[프로젝트-참조]:[비밀번호]@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres`

## 2단계: 환경 변수 설정

프로젝트 루트에 `.env` 파일이 있는지 확인하고, 없으면 생성:

```env
DATABASE_URL="복사한_connection_string_여기에_붙여넣기"
```

**중요**: 
- 비밀번호 부분 `[YOUR-PASSWORD]`를 실제 비밀번호로 교체
- 또는 Connection string에 이미 비밀번호가 포함되어 있을 수 있음

## 3단계: 마이그레이션 실행

터미널에서 실행:

```bash
# Prisma Client 생성
npx prisma generate

# 데이터베이스 마이그레이션 (테이블 생성)
npx prisma migrate dev --name init
```

## 4단계: 확인

```bash
# Prisma Studio 실행
npx prisma studio
```

브라우저에서 http://localhost:5555 열어서 테이블 확인

