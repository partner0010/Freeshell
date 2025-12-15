# 🗑️ Vercel 프로젝트 삭제 후 재생성 가이드

기존 프로젝트를 삭제하고 깨끗하게 새로 만드는 방법입니다.

## 📋 1단계: 기존 프로젝트 삭제

### Step 1: 프로젝트 찾기
1. Vercel 대시보드 접속: https://vercel.com/dashboard
2. 프로젝트 목록에서 **freeshell** 찾기
3. 프로젝트 클릭

### Step 2: Settings로 이동
1. 프로젝트 페이지에서 **Settings** 탭 클릭
2. (위쪽 탭 메뉴에서)

### Step 3: 삭제하기
1. Settings 페이지에서 **맨 아래로 스크롤**
2. **"Danger Zone"** 섹션 찾기
   - 빨간색 배경의 섹션입니다
3. **"Delete Project"** 또는 **"프로젝트 삭제"** 버튼 클릭
4. 확인 창에서:
   - 프로젝트 이름 입력: `freeshell`
   - 또는 확인 체크박스 선택
5. **"Delete"** 또는 **"삭제"** 버튼 클릭
6. 삭제 완료!

---

## 📦 2단계: 새 프로젝트 생성

### Step 1: 새 프로젝트 시작
1. Vercel 대시보드에서 **"Add New Project"** 버튼 클릭
   - (우측 상단 또는 중앙에 있음)

### Step 2: GitHub 저장소 선택
1. GitHub 저장소 목록이 나타남
2. **freeshell** 저장소 찾기
3. **"Import"** 버튼 클릭

### Step 3: 프로젝트 설정
1. **Project Name**: `freeshell` (기본값 그대로)
2. **Framework Preset**: `Next.js` (자동 감지됨)
3. **Root Directory**: `./` (기본값)
4. **Build Command**: `npm run build` (기본값)
5. **Output Directory**: `.next` (기본값)
6. **Install Command**: `npm install` (기본값)

**모두 기본값 그대로 두면 됩니다!**

---

## ⚙️ 3단계: 환경 변수 설정 (중요!)

### Step 1: Environment Variables 섹션 찾기
프로젝트 설정 페이지에서 **"Environment Variables"** 섹션 찾기

### Step 2: 환경 변수 추가
다음 5개 변수를 하나씩 추가하세요:

#### 1. GOOGLE_CLIENT_ID
- **Name**: `GOOGLE_CLIENT_ID`
- **Value**: Google Cloud Console에서 복사한 클라이언트 ID
- **Environment**: ✅ Production, ✅ Preview, ✅ Development 모두 선택
- **Save** 클릭

#### 2. GOOGLE_CLIENT_SECRET
- **Name**: `GOOGLE_CLIENT_SECRET`
- **Value**: Google Cloud Console에서 복사한 클라이언트 보안 비밀번호
- **Environment**: ✅ Production, ✅ Preview, ✅ Development 모두 선택
- **Save** 클릭

#### 3. NEXTAUTH_SECRET
- **Name**: `NEXTAUTH_SECRET`
- **Value**: 로컬 `.env` 파일에 있는 값
  - 예: `5OtQ2J2wZOGR7hlY+GTT9AybwFVbHu8vkn1TFNPTOTU=`
- **Environment**: ✅ Production, ✅ Preview, ✅ Development 모두 선택
- **Save** 클릭

#### 4. NEXTAUTH_URL
- **Name**: `NEXTAUTH_URL`
- **Value**: `https://freeshell.co.kr`
- **Environment**: ✅ Production만 선택 (Preview, Development는 해제)
- **Save** 클릭

#### 5. NEXT_PUBLIC_DOMAIN
- **Name**: `NEXT_PUBLIC_DOMAIN`
- **Value**: `freeshell.co.kr`
- **Environment**: ✅ Production, ✅ Preview, ✅ Development 모두 선택
- **Save** 클릭

---

## 🚀 4단계: 배포 실행

### Step 1: 배포 시작
1. 모든 설정이 완료되면 **"Deploy"** 버튼 클릭
2. 배포 진행 상황 확인

### Step 2: 배포 완료 대기
- 보통 2-3분 소요됩니다
- 진행 상황이 실시간으로 표시됩니다

### Step 3: 배포 완료 확인
- 배포가 완료되면 URL이 표시됩니다
- 예: `https://freeshell-xxx.vercel.app`
- 이 URL로 접속해서 확인하세요!

---

## 🌐 5단계: 도메인 연결

### Step 1: Domains 설정으로 이동
1. 프로젝트 페이지에서 **Settings** 클릭
2. **"Domains"** 탭 클릭

### Step 2: 도메인 추가
1. 도메인 입력 필드에 `freeshell.co.kr` 입력
2. **"Add"** 버튼 클릭

### Step 3: DNS 설정 안내 확인
- Vercel이 DNS 설정 방법을 안내합니다
- 도메인 제공업체에서 DNS 설정 필요

---

## ✅ 체크리스트

### 삭제
- [ ] 기존 프로젝트 찾기
- [ ] Settings → Danger Zone
- [ ] Delete Project 클릭
- [ ] 삭제 확인

### 재생성
- [ ] Add New Project 클릭
- [ ] freeshell 저장소 선택
- [ ] Import 클릭
- [ ] 프로젝트 설정 확인

### 환경 변수
- [ ] GOOGLE_CLIENT_ID 추가
- [ ] GOOGLE_CLIENT_SECRET 추가
- [ ] NEXTAUTH_SECRET 추가
- [ ] NEXTAUTH_URL 추가
- [ ] NEXT_PUBLIC_DOMAIN 추가

### 배포
- [ ] Deploy 클릭
- [ ] 배포 완료 확인
- [ ] URL로 접속 테스트

### 도메인
- [ ] Settings → Domains
- [ ] freeshell.co.kr 추가
- [ ] DNS 설정 확인

---

## 💡 팁

- 환경 변수는 정확히 입력해야 합니다
- 각 환경 변수 추가 후 "Save"를 클릭해야 저장됩니다
- 배포가 실패하면 로그를 확인하세요
- 도메인 연결은 DNS 전파까지 1-2시간 소요될 수 있습니다

---

## 🆘 문제 해결

### "Delete Project 버튼이 없습니다"
- 프로젝트 소유자가 아닐 수 있습니다
- 팀/조직의 관리자 권한이 필요할 수 있습니다

### "프로젝트를 찾을 수 없습니다"
- 다른 팀/조직에 있을 수 있습니다
- 왼쪽 사이드바에서 팀/조직 선택 확인

### "배포가 실패합니다"
- 환경 변수가 올바르게 설정되었는지 확인
- Build Log를 확인하여 오류 원인 파악

---

**이제 단계별로 진행하세요!** 🚀

