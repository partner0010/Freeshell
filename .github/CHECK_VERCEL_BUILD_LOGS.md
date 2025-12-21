# 🔍 Vercel 빌드 오류 확인 가이드

## 현재 상황
- 로컬 빌드: ✅ 성공
- Vercel 배포: ❌ 모든 배포가 Error 상태

## ✅ 해결 방법

### 1단계: Vercel Build Logs 확인 (가장 중요!)

1. **Vercel 대시보드 접속**
   - https://vercel.com/dashboard

2. **프로젝트 선택**
   - Freeshell 프로젝트 클릭

3. **Deployments 탭**
   - 왼쪽 메뉴에서 "Deployments" 클릭

4. **최신 Error 배포 선택**
   - 가장 위에 있는 Error 배포 클릭 (예: `AUstJZgo3`)

5. **Build Logs 확인**
   - "Build Logs" 탭 클릭
   - **오류 메시지 전체 복사**

**확인할 오류:**
- Prisma Client 생성 오류
- 의존성 누락 오류
- TypeScript 오류
- 환경 변수 오류

---

### 2단계: 일반적인 Vercel 빌드 오류

#### A. Prisma Client 생성 오류

**오류:** `@prisma/client did not initialize yet`

**해결:**
1. `package.json`에 `postinstall` 스크립트 추가:
```json
{
  "scripts": {
    "postinstall": "prisma generate",
    "build": "prisma generate && next build"
  }
}
```

2. 또는 Vercel Build Settings에서:
   - **Build Command**: `prisma generate && npm run build`

#### B. 의존성 누락 오류

**오류:** `Module not found: Can't resolve 'xxx'`

**해결:**
1. `package.json`에 의존성 추가
2. 로컬에서 `npm install` 실행
3. `package.json`과 `package-lock.json` 커밋 및 푸시

#### C. 환경 변수 오류

**오류:** `DATABASE_URL` 또는 기타 환경 변수 누락

**해결:**
1. Vercel 대시보드 → Settings → Environment Variables
2. 필요한 환경 변수 추가:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - 기타 필요한 변수들

---

### 3단계: 수정 후 재배포

#### 방법 1: 자동 재배포
```bash
git add .
git commit -m "fix: add prisma generate to build process"
git push origin main
```

#### 방법 2: Vercel에서 수동 재배포
1. Vercel 대시보드 → Deployments
2. 최신 배포의 "..." → "Redeploy"

---

## 📋 체크리스트

빌드 오류 확인:
- [ ] Vercel Build Logs에서 정확한 오류 확인
- [ ] 오류 메시지 전체 복사
- [ ] 오류 유형 파악 (Prisma, 의존성, 환경 변수 등)

빌드 오류 수정:
- [ ] `package.json`에 `postinstall` 스크립트 추가
- [ ] 필요한 의존성 확인 및 추가
- [ ] 환경 변수 설정 확인
- [ ] 로컬에서 빌드 테스트

재배포:
- [ ] 변경사항 커밋 및 푸시
- [ ] Vercel에서 새 배포 확인
- [ ] 배포 상태가 "Ready"인지 확인

---

## 🆘 빠른 확인

**가장 중요한 것**: Vercel Build Logs에서 정확한 오류 메시지를 확인하세요!

1. Vercel → Deployments → 최신 Error 배포 → Build Logs
2. 오류 메시지 확인
3. 오류에 맞는 해결 방법 적용

