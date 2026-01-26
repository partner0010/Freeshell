# Netlify 배포 가이드

## 문제 해결: Netlify 배포가 자동으로 트리거되지 않는 경우

### 1. Netlify 대시보드에서 설정 확인

1. **Netlify 대시보드 접속**
   - https://app.netlify.com 접속
   - 사이트 선택 (freeshell.co.kr)

2. **저장소 연결 확인**
   - Site settings > Build & deploy > Continuous Deployment
   - Repository가 올바르게 연결되어 있는지 확인
   - 연결되어 있지 않다면 "Link repository" 클릭하여 연결

3. **Production branch 확인**
   - Site settings > Build & deploy > Continuous Deployment
   - Production branch가 `main` 또는 `master`로 설정되어 있는지 확인
   - 현재 브랜치와 일치해야 함

4. **빌드 설정 확인**
   - Site settings > Build & deploy > Build settings
   - Build command: `npm run build`
   - Publish directory: `.next` (Next.js의 경우)
   - 또는 `netlify.toml` 파일이 있으면 자동으로 사용됨

### 2. 수동 배포 트리거

1. **Netlify 대시보드에서**
   - Deploys 탭으로 이동
   - "Trigger deploy" 버튼 클릭
   - "Deploy site" 선택

2. **GitHub에서 직접 푸시**
   ```bash
   git push origin main
   ```
   또는
   ```bash
   git push origin master
   ```

### 3. GitHub Actions를 통한 배포 (권장)

GitHub Actions 워크플로우를 사용하여 Netlify에 배포할 수 있습니다.

#### 필요한 GitHub Secrets 설정

1. **Netlify Auth Token 생성**
   - Netlify 대시보드 > User settings > Applications
   - "New access token" 클릭
   - 토큰 복사

2. **Netlify Site ID 확인**
   - Site settings > General
   - "Site details" 섹션에서 Site ID 확인

3. **GitHub Secrets 추가**
   - GitHub 저장소 > Settings > Secrets and variables > Actions
   - "New repository secret" 클릭
   - 다음 두 개의 Secret 추가:
     - `NETLIFY_AUTH_TOKEN`: Netlify에서 생성한 토큰
     - `NETLIFY_SITE_ID`: Netlify Site ID

#### 워크플로우 사용

`.github/workflows/netlify-deploy.yml` 파일이 생성되었습니다.

- `main` 또는 `master` 브랜치에 push하면 자동으로 배포됩니다
- GitHub Actions 탭에서 수동으로 실행할 수도 있습니다

### 4. Netlify CLI를 사용한 배포

로컬에서 직접 배포하려면:

```bash
# Netlify CLI 설치
npm install -g netlify-cli

# 로그인
netlify login

# 배포
netlify deploy --prod
```

### 5. 문제 해결 체크리스트

- [ ] Netlify 대시보드에서 저장소가 연결되어 있는가?
- [ ] Production branch가 올바르게 설정되어 있는가?
- [ ] `netlify.toml` 파일이 프로젝트 루트에 있는가?
- [ ] GitHub에 push가 성공했는가?
- [ ] Netlify Deploys 탭에서 배포가 시작되었는가?
- [ ] 빌드 로그에 오류가 없는가?

### 6. 빌드 로그 확인

Netlify 대시보드 > Deploys 탭에서:
- 각 배포를 클릭하여 상세 로그 확인
- 빌드 오류가 있는지 확인
- 환경 변수가 올바르게 설정되어 있는지 확인

### 7. 도메인 확인

- Site settings > Domain management
- Custom domain이 올바르게 설정되어 있는지 확인
- DNS 설정이 올바른지 확인

## 추가 정보

- Netlify 문서: https://docs.netlify.com/
- Next.js 배포 가이드: https://docs.netlify.com/integrations/frameworks/nextjs/
