# Docker 설정 가이드

## 사전 요구사항

- Docker 20.10 이상
- Docker Compose 2.0 이상

## 빠른 시작

### 1. 환경 변수 설정

```bash
# .env.example을 복사하여 .env 파일 생성
cp .env.example .env

# .env 파일을 편집하여 필요한 값 설정
nano .env
```

### 2. Docker Compose로 서비스 시작

```bash
# 모든 서비스 빌드 및 시작
docker-compose up -d --build

# 로그 확인
docker-compose logs -f

# 특정 서비스 로그 확인
docker-compose logs -f backend
docker-compose logs -f frontend
```

### 3. 서비스 접근

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API 문서: http://localhost:8000/api/docs
- Nginx (프록시): http://localhost

## 서비스 관리

### 서비스 시작/중지

```bash
# 서비스 시작
docker-compose start

# 서비스 중지
docker-compose stop

# 서비스 재시작
docker-compose restart

# 서비스 중지 및 컨테이너 제거
docker-compose down

# 볼륨까지 제거 (데이터 삭제)
docker-compose down -v
```

### 개별 서비스 관리

```bash
# 특정 서비스만 시작
docker-compose up -d backend

# 특정 서비스만 재빌드
docker-compose build backend

# 특정 서비스 로그 확인
docker-compose logs -f backend
```

## 데이터베이스 관리

### 데이터베이스 접속

```bash
# PostgreSQL 접속
docker-compose exec postgres psql -U postgres -d freeshell

# Redis 접속
docker-compose exec redis redis-cli -a redis
```

### 데이터베이스 백업

```bash
# 백업
docker-compose exec postgres pg_dump -U postgres freeshell > backup.sql

# 복원
docker-compose exec -T postgres psql -U postgres freeshell < backup.sql
```

## 개발 모드

### 개발 환경에서 실행

```bash
# 볼륨 마운트로 코드 변경 즉시 반영
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

## 프로덕션 배포

### 1. 환경 변수 설정

프로덕션 환경에 맞게 `.env` 파일 수정:

```bash
ENVIRONMENT=production
LOG_LEVEL=INFO
ALLOWED_ORIGINS=https://yourdomain.com
```

### 2. HTTPS 설정 (Nginx)

SSL 인증서를 설정하고 `nginx/conf.d/default.conf`에 HTTPS 설정 추가

### 3. 배포

```bash
# 이미지 빌드
docker-compose build

# 서비스 시작
docker-compose up -d
```

## 문제 해결

### 포트 충돌

`.env` 파일에서 포트 번호 변경:

```bash
POSTGRES_PORT=5433
REDIS_PORT=6380
BACKEND_PORT=8001
FRONTEND_PORT=3001
```

### 로그 확인

```bash
# 모든 서비스 로그
docker-compose logs

# 특정 서비스 로그
docker-compose logs backend

# 실시간 로그
docker-compose logs -f
```

### 컨테이너 재시작

```bash
# 특정 컨테이너 재시작
docker-compose restart backend

# 모든 컨테이너 재시작
docker-compose restart
```

### 데이터베이스 초기화

```bash
# 볼륨 제거 및 재생성
docker-compose down -v
docker-compose up -d postgres

# 마이그레이션 실행
docker-compose exec backend alembic upgrade head
```

## 헬스체크

모든 서비스는 헬스체크를 포함하고 있습니다:

```bash
# 서비스 상태 확인
docker-compose ps

# 헬스체크 결과 확인
docker inspect freeshell_backend | grep -A 10 Health
```

## 볼륨

- `postgres_data`: PostgreSQL 데이터
- `redis_data`: Redis 데이터
- `./backend/logs`: Backend 로그 파일

## 네트워크

모든 서비스는 `freeshell_network` 브리지 네트워크에 연결되어 있습니다.
