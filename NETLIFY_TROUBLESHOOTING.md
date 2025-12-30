# Netlify 배포 문제 해결 가이드

## Netlify가 반응하지 않는 경우

### 1. 배치 파일을 다시 실행하세요

```bash
.github\deploy.bat
```

배치 파일이 다음을 수행합니다:
- 변경사항 커밋
- `master` 브랜치로 push
- `main` 브랜치로 자동 push (Netlify용)

### 2. Netlify 대시보드에서 수동 배포 트리거

1. **Netlify 대시보드 접속**: https://app.netlify.com
2. 사이트 선택: `freeshell.co.kr`
3. **Deploys** 탭 클릭
4. **Trigger deploy** 버튼 클릭 → **Deploy site** 선택

### 3. Netlify 설정 확인

#### Continuous Deployment 확인
1. **Site settings** → **Build & deploy** → **Continuous Deployment**
2. **Repository**가 올바르게 연결되어 있는지 확인
   - Repository: `partner0010/freeshell`
3. **Production branch**가 `main`인지 확인
   - Production branch: `main`

#### Build settings 확인
1. **Site settings** → **Build & deploy** → **Build settings**
2. **Build command**: `npm run build`
3. **Base directory**: `.` (루트)
4. **Publish directory**: `.next`

### 4. GitHub 웹훅 확인

Netlify가 GitHub 변경사항을 감지하려면 웹훅이 설정되어 있어야 합니다:

1. **Site settings** → **Build & deploy** → **Continuous Deployment**
2. **Build hooks** 섹션 확인
3. 필요시 **Add build hook** 클릭하여 새 웹훅 생성

### 5. 최근 빌드 로그 확인

1. **Deploys** 탭에서 최근 빌드 클릭
2. 빌드 로그에서 오류 메시지 확인
3. 일반적인 오류:
   - `package.json` not found → GitHub에 파일이 있는지 확인
   - Build command failed → 빌드 명령어 확인
   - Environment variables missing → 환경 변수 설정 확인

### 6. 수동으로 main 브랜치에 push

배치 파일이 작동하지 않는 경우:

```bash
# 1. 변경사항 커밋
git add .
git commit -m "Update deployment"

# 2. main 브랜치로 push
git push origin master:main --force-with-lease

# 또는 main 브랜치로 체크아웃 후 push
git checkout main
git merge master
git push origin main
```

### 7. Netlify CLI를 사용한 배포

```bash
# Netlify CLI 설치
npm install -g netlify-cli

# Netlify 로그인
netlify login

# 배포
netlify deploy --prod
```

### 8. 문제가 계속되면

1. **Netlify 지원팀 문의**: https://www.netlify.com/support/
2. **GitHub Issues 확인**: 저장소에 문제가 있는지 확인
3. **로그 확인**: Netlify 대시보드의 빌드 로그에서 정확한 오류 확인

## 빠른 체크리스트

- [ ] 배치 파일 실행 완료
- [ ] GitHub에 변경사항 push 완료
- [ ] Netlify 대시보드에서 저장소 연결 확인
- [ ] Production branch가 `main`으로 설정됨
- [ ] Build command가 `npm run build`로 설정됨
- [ ] 최근 빌드 로그 확인 (오류 없음)
- [ ] 수동 배포 시도 (Trigger deploy)

## 유용한 링크

- Netlify 대시보드: https://app.netlify.com
- GitHub 저장소: https://github.com/partner0010/freeshell
- 사이트 URL: https://freeshell.co.kr

