# 🔧 Vercel 기존 프로젝트 처리 방법

Vercel에 이미 freeshell 프로젝트가 있다면 다음 방법 중 하나를 선택하세요.

## 방법 1: 기존 프로젝트 삭제 후 새로 만들기 (권장)

### 1단계: 기존 프로젝트 삭제

1. Vercel 접속: https://vercel.com
2. 로그인
3. 대시보드에서 **freeshell** 프로젝트 찾기
4. 프로젝트 클릭
5. Settings (설정) 탭 클릭
6. 맨 아래로 스크롤
7. "Delete Project" 또는 "프로젝트 삭제" 버튼 클릭
8. 프로젝트 이름 입력하여 삭제 확인: `freeshell`
9. 삭제 완료!

### 2단계: 새 프로젝트 생성

1. "Add New Project" 클릭
2. GitHub 저장소 목록에서 **freeshell** 선택
3. "Import" 클릭
4. 환경 변수 설정
5. "Deploy" 클릭

---

## 방법 2: 기존 프로젝트 재사용 (빠른 방법)

기존 프로젝트를 그대로 사용하고 새 코드로 재배포:

### 1단계: 기존 프로젝트 열기

1. Vercel 대시보드에서 **freeshell** 프로젝트 클릭
2. Settings (설정) 탭 클릭

### 2단계: Git 저장소 확인

1. "Git" 섹션 확인
2. 저장소가 `partner0010/freeshell`로 연결되어 있는지 확인
3. 연결되어 있다면 그대로 사용 가능!

### 3단계: 환경 변수 확인/수정

1. "Environment Variables" 섹션으로 이동
2. 기존 환경 변수 확인
3. 필요한 변수 추가 또는 수정:
   - GOOGLE_CLIENT_ID
   - GOOGLE_CLIENT_SECRET
   - NEXTAUTH_SECRET
   - NEXTAUTH_URL = `https://freeshell.co.kr`
   - NEXT_PUBLIC_DOMAIN = `freeshell.co.kr`

### 4단계: 자동 재배포

GitHub에 푸시했으므로 Vercel이 자동으로 재배포를 시작할 수 있습니다!

1. "Deployments" 탭 확인
2. 새로운 배포가 자동으로 시작되는지 확인
3. 시작되지 않으면 "Redeploy" 버튼 클릭

---

## 방법 3: 다른 이름으로 새 프로젝트 만들기

삭제가 안되면 다른 이름으로 만들기:

1. "Add New Project" 클릭
2. GitHub 저장소 목록에서 **freeshell** 선택
3. Project Name을 변경: `freeshell-v2` 또는 `freeshell-new`
4. "Import" 클릭
5. 환경 변수 설정
6. "Deploy" 클릭

---

## 💡 추천 방법

**방법 2 (기존 프로젝트 재사용)**를 추천합니다!
- 더 빠르고 간단합니다
- 기존 도메인 설정이 유지됩니다
- 환경 변수만 확인/수정하면 됩니다

---

## ✅ 체크리스트

- [ ] Vercel에 로그인
- [ ] 기존 프로젝트 확인
- [ ] 삭제 또는 재사용 결정
- [ ] 환경 변수 확인/설정
- [ ] 배포 실행

---

## 🆘 문제 해결

### "프로젝트를 찾을 수 없습니다"
- 다른 팀/조직에 있을 수 있습니다
- 왼쪽 사이드바에서 팀/조직 선택 확인

### "삭제 버튼이 없습니다"
- 프로젝트 소유자가 아닐 수 있습니다
- 방법 3으로 다른 이름으로 새로 만드세요

### "자동 배포가 안됩니다"
- Settings → Git에서 저장소 연결 확인
- "Redeploy" 버튼으로 수동 배포

---

**어떤 방법을 선택하시겠어요?**

