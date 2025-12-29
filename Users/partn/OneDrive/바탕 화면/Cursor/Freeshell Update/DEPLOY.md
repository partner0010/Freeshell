# Shell 배포 가이드

## 배포 방법

### 1. 배치 파일 사용 (권장)

프로젝트 루트에서 다음 명령어 실행:

```bash
.github\deploy.bat
```

또는 더블클릭으로 실행

### 2. 수동 배포

```bash
# 1. 빌드 테스트
npm run build

# 2. Git 커밋
git add .
git commit -m "Shell updates"

# 3. GitHub 푸시
git push origin main
```

## 배포 플랫폼

### Netlify
- 설정 파일: `netlify.toml`
- 자동 배포: GitHub 푸시 시 자동 배포
- 도메인: freeshell.co.kr

### Vercel
- 설정 파일: `vercel.json`
- 자동 배포: GitHub 푸시 시 자동 배포
- 도메인: freeshell.co.kr

## 환경 변수 설정

배포 플랫폼에서 다음 환경 변수를 설정하세요:

```env
OPENAI_API_KEY=sk-your-key-here
NEXT_PUBLIC_APP_URL=https://freeshell.co.kr
```

## 배포 확인

1. GitHub 저장소 확인
2. 배포 플랫폼 대시보드 확인
3. https://freeshell.co.kr 접속 확인

## 문제 해결

### 빌드 실패
```bash
# .next 폴더 삭제
rmdir /s /q .next

# 의존성 재설치
rmdir /s /q node_modules
npm install
```

### Git 푸시 실패
```bash
# 브랜치 확인
git branch

# 원격 저장소 확인
git remote -v

# 강제 푸시 (주의)
git push -u origin main
```

