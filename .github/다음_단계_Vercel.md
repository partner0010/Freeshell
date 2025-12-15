# 🎉 GitHub 업로드 완료!

## ✅ 완료된 작업

- ✅ Git 사용자 정보 설정 완료
- ✅ 파일 커밋 완료 (603개 파일, 891.16 KiB)
- ✅ GitHub에 업로드 완료
- ✅ main 브랜치 생성 및 푸시 완료

저장소 확인: https://github.com/partner0010/freeshell

---

## 🚀 다음 단계: Vercel 배포

이제 Vercel에서 배포하면 됩니다!

### 1단계: Vercel 접속

1. 브라우저에서 https://vercel.com 접속
2. "Sign Up" 또는 "Log In" 클릭
3. GitHub 계정으로 로그인

### 2단계: 프로젝트 추가

1. "Add New Project" 클릭
2. GitHub 저장소 목록에서 **freeshell** 선택
3. "Import" 클릭

### 3단계: 프로젝트 설정

1. Project Name: `freeshell` (기본값 그대로)
2. Framework Preset: `Next.js` (자동 감지됨)
3. Root Directory: `./` (기본값)
4. Build Command: `npm run build` (기본값)
5. Output Directory: `.next` (기본값)

### 4단계: 환경 변수 설정 (중요!)

"Environment Variables" 섹션에서 다음 5개 변수를 추가:

#### 1. GOOGLE_CLIENT_ID
- Value: Google Cloud Console에서 복사한 클라이언트 ID
- Environment: Production, Preview, Development 모두 선택

#### 2. GOOGLE_CLIENT_SECRET
- Value: Google Cloud Console에서 복사한 클라이언트 보안 비밀번호
- Environment: Production, Preview, Development 모두 선택

#### 3. NEXTAUTH_SECRET
- Value: 로컬 `.env` 파일에 있는 값
- Environment: Production, Preview, Development 모두 선택

#### 4. NEXTAUTH_URL
- Value: `https://freeshell.co.kr`
- Environment: Production만 선택

#### 5. NEXT_PUBLIC_DOMAIN
- Value: `freeshell.co.kr`
- Environment: Production, Preview, Development 모두 선택

### 5단계: 배포 실행

1. "Deploy" 버튼 클릭
2. 배포 진행 상황 확인 (2-3분 소요)
3. 배포 완료되면 URL 확인 (예: `https://freeshell-xxx.vercel.app`)

### 6단계: 도메인 연결

1. 프로젝트 페이지에서 "Settings" 클릭
2. "Domains" 탭 클릭
3. `freeshell.co.kr` 입력
4. "Add" 클릭
5. DNS 설정 안내 확인

---

## 📝 체크리스트

- [ ] Vercel 로그인 완료
- [ ] GitHub 저장소 연결 완료
- [ ] 환경 변수 5개 모두 설정 완료
- [ ] 배포 완료
- [ ] 도메인 추가 완료

---

## 💡 팁

- 환경 변수는 정확히 입력해야 합니다
- 배포가 실패하면 로그를 확인하세요
- 도메인 연결은 DNS 전파까지 1-2시간 소요될 수 있습니다

---

**축하합니다! 이제 Vercel에서 배포만 하면 됩니다!** 🎉

