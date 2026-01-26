# GitHub Actions 워크플로우

이 디렉토리에는 프로젝트의 CI/CD 파이프라인 워크플로우가 포함되어 있습니다.

## 워크플로우 파일

### 1. `deploy.yml` - 메인 배포 파이프라인

**트리거:**
- `main` 브랜치에 푸시
- `main` 브랜치로 Pull Request

**단계:**
1. 코드 체크아웃
2. Python/Node.js 의존성 설치
3. 테스트 실행
4. Docker 이미지 빌드
5. GitHub Container Registry에 푸시
6. SSH를 통한 서버 배포
7. 헬스체크

### 2. `test.yml` - 테스트 스위트

**트리거:**
- `main`, `develop` 브랜치에 푸시
- Pull Request

**기능:**
- Backend 테스트 (PostgreSQL, Redis 포함)
- Frontend 테스트 및 빌드
- 코드 린팅

### 3. `docker-build.yml` - Docker 이미지 빌드

**트리거:**
- `main` 브랜치에 푸시
- 태그 푸시 (`v*`)
- 수동 실행 (workflow_dispatch)

**기능:**
- Backend/Frontend Docker 이미지 빌드
- 멀티 플랫폼 빌드 (amd64, arm64)
- GitHub Container Registry에 푸시

### 4. `deploy-staging.yml` - 스테이징 배포

**트리거:**
- `develop`, `staging` 브랜치에 푸시

**기능:**
- 스테이징 서버에 자동 배포
- 헬스체크

### 5. `security-scan.yml` - 보안 스캔

**트리거:**
- `main` 브랜치에 푸시
- Pull Request
- 매주 일요일 (스케줄)

**기능:**
- 의존성 취약점 스캔
- Docker 이미지 보안 스캔

### 6. `code-quality.yml` - 코드 품질

**트리거:**
- `main`, `develop` 브랜치에 푸시
- Pull Request

**기능:**
- Backend: Black, Flake8, mypy
- Frontend: ESLint, TypeScript 체크

## 필요한 GitHub Secrets

### 배포 관련

```
SSH_PRIVATE_KEY          # 서버 SSH 개인 키
SSH_USER                 # SSH 사용자명
SSH_HOST                 # 서버 호스트
DEPLOY_PATH              # 배포 경로 (기본: /opt/freeshell)
BACKEND_URL              # Backend URL
FRONTEND_URL             # Frontend URL
DEPLOY_URL               # 배포 URL
```

### 스테이징 배포

```
STAGING_SSH_PRIVATE_KEY  # 스테이징 서버 SSH 개인 키
STAGING_SSH_USER         # 스테이징 SSH 사용자명
STAGING_SSH_HOST         # 스테이징 서버 호스트
STAGING_DEPLOY_PATH      # 스테이징 배포 경로
STAGING_BACKEND_URL      # 스테이징 Backend URL
STAGING_URL              # 스테이징 URL
```

### Frontend 빌드

```
NEXT_PUBLIC_API_BASE_URL # API Base URL
```

## Secrets 설정 방법

1. GitHub 저장소로 이동
2. Settings > Secrets and variables > Actions
3. "New repository secret" 클릭
4. 이름과 값을 입력

## 배포 프로세스

### 자동 배포 (main 브랜치)

```bash
git push origin main
```

자동으로 다음이 실행됩니다:
1. 테스트 실행
2. Docker 이미지 빌드 및 푸시
3. 프로덕션 서버 배포
4. 헬스체크

### 수동 배포

GitHub Actions 탭에서 `docker-build.yml` 워크플로우를 수동으로 실행할 수 있습니다.

### 스테이징 배포

```bash
git push origin develop
```

스테이징 서버에 자동 배포됩니다.

## 문제 해결

### 배포 실패

1. GitHub Actions 로그 확인
2. SSH 연결 확인
3. 서버 디스크 공간 확인
4. Docker Compose 상태 확인

### 헬스체크 실패

1. 서비스 로그 확인: `docker-compose logs`
2. 포트 충돌 확인
3. 환경 변수 확인

### 빌드 실패

1. 의존성 문제 확인
2. Dockerfile 문법 확인
3. 빌드 로그 확인
