# 환경 설정 가이드

## 환경별 설정 파일

프로젝트는 환경별로 분리된 설정 파일을 사용합니다:

- `.env.development` - 개발 환경
- `.env.staging` - 스테이징 환경
- `.env.production` - 프로덕션 환경

## 빠른 시작

### 1. 환경 파일 복사

```bash
# 개발 환경
cp .env.development.example .env.development

# 스테이징 환경
cp .env.staging.example .env.staging

# 프로덕션 환경
cp .env.production.example .env.production
```

### 2. 환경 변수 설정

각 환경 파일을 열어 필요한 값들을 설정하세요:

```bash
# 개발 환경 편집
nano .env.development

# 프로덕션 환경 편집
nano .env.production
```

### 3. 환경 파일 로드

#### Linux/Mac

```bash
# 스크립트 사용
chmod +x scripts/load-env.sh
./scripts/load-env.sh development

# 또는 수동으로
cp .env.development .env
```

#### Windows (PowerShell)

```powershell
# 스크립트 사용
.\scripts\load-env.ps1 -Env development

# 또는 수동으로
Copy-Item .env.development .env
```

## 필수 환경 변수

### 데이터베이스

```bash
DATABASE_URL=postgresql+asyncpg://user:password@host:5432/database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-password
POSTGRES_DB=freeshell
```

### Redis

```bash
REDIS_URL=redis://:password@host:6379/0
REDIS_PASSWORD=your-redis-password
```

### JWT

```bash
JWT_SECRET=your-very-strong-secret-key-min-32-characters
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### API Keys

```bash
OPENAI_API_KEY=sk-...
REPLICATE_API_TOKEN=r8_...
STABILITY_API_KEY=sk-...
ELEVENLABS_API_KEY=...
```

### AWS S3

```bash
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
```

### Stripe

```bash
STRIPE_SECRET_KEY=sk_live_...  # 프로덕션: sk_live_, 개발/스테이징: sk_test_
STRIPE_WEBHOOK_SECRET=whsec_...
```

## 환경별 차이점

### Development (개발)

- `LOG_LEVEL=DEBUG`: 상세한 로그 출력
- `SENTRY_TRACES_SAMPLE_RATE=1.0`: 모든 트레이스 수집
- `ALLOWED_ORIGINS`: localhost 허용
- `DATABASE_URL`: 로컬 데이터베이스

### Staging (스테이징)

- `LOG_LEVEL=INFO`: 일반 로그 출력
- `SENTRY_TRACES_SAMPLE_RATE=0.5`: 50% 샘플링
- `ALLOWED_ORIGINS`: 스테이징 도메인
- `STRIPE_SECRET_KEY`: 테스트 키 사용

### Production (프로덕션)

- `LOG_LEVEL=INFO`: 일반 로그 출력
- `SENTRY_TRACES_SAMPLE_RATE=0.1`: 10% 샘플링
- `ALLOWED_ORIGINS`: 프로덕션 도메인
- `STRIPE_SECRET_KEY`: 라이브 키 사용
- 강력한 비밀번호 필수

## Docker Compose 사용 시

Docker Compose는 자동으로 `.env` 파일을 읽습니다:

```bash
# 환경 파일 로드 후 Docker Compose 실행
cp .env.production .env
docker-compose up -d
```

또는 환경 변수로 직접 지정:

```bash
ENV_FILE=.env.production docker-compose up -d
```

## 보안 주의사항

1. **절대 커밋하지 마세요**: `.env.*` 파일은 `.gitignore`에 포함되어 있습니다
2. **강력한 비밀번호 사용**: 프로덕션 환경에서는 반드시 강력한 비밀번호 사용
3. **JWT_SECRET**: 최소 32자 이상의 랜덤 문자열 사용
4. **API 키 보호**: 모든 API 키는 안전하게 관리
5. **환경 변수 검증**: 배포 전 모든 필수 환경 변수 확인

## 환경 변수 검증

배포 전 필수 환경 변수를 확인하세요:

```bash
# 필수 변수 확인 스크립트 (예시)
required_vars=(
  "DATABASE_URL"
  "REDIS_URL"
  "JWT_SECRET"
  "OPENAI_API_KEY"
  "AWS_S3_BUCKET"
  "STRIPE_SECRET_KEY"
)

for var in "${required_vars[@]}"; do
  if [ -z "${!var}" ]; then
    echo "Error: $var is not set"
    exit 1
  fi
done
```

## 문제 해결

### 환경 변수가 로드되지 않음

```bash
# .env 파일이 존재하는지 확인
ls -la .env

# 환경 변수 확인
cat .env | grep DATABASE_URL
```

### Docker에서 환경 변수 미적용

```bash
# Docker Compose 재시작
docker-compose down
docker-compose up -d

# 환경 변수 확인
docker-compose exec backend env | grep DATABASE_URL
```
