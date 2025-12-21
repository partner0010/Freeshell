# 🚨 Vercel 배포 실패 해결 방법

## 현재 상황
- 로컬 빌드: ✅ 성공
- Vercel 배포: ❌ 모든 배포가 Error 상태

## 가능한 원인

### 1. Prisma Client 생성 문제 (가장 가능성 높음)
Vercel 빌드 시 `prisma generate`가 실행되지 않아 Prisma Client가 생성되지 않음

### 2. 환경 변수 누락
DATABASE_URL 등 필수 환경 변수가 Vercel에 설정되지 않음

### 3. 의존성 문제
package.json에 필수 의존성이 누락되었거나 버전 불일치

---

## ✅ 해결 방법

### 방법 1: package.json에 postinstall 추가 (권장)

`package.json` 파일을 열고 `scripts` 섹션에 다음을 추가:

```json
{
  "scripts": {
    "postinstall": "prisma generate",
    "build": "prisma generate && next build"
  }
}
```

이렇게 하면:
- `npm install` 후 자동으로 `prisma generate` 실행
- `npm run build` 전에 자동으로 `prisma generate` 실행

### 방법 2: Vercel Build Command 수정

Vercel 대시보드에서:
1. Settings → General
2. Build & Development Settings
3. Build Command를 다음으로 변경:
   ```
   prisma generate && npm run build
   ```

### 방법 3: Vercel Build Logs 확인

1. Vercel 대시보드 → Deployments
2. 최신 Error 배포 클릭
3. Build Logs 탭 클릭
4. 오류 메시지 확인

---

## 📋 체크리스트

- [ ] package.json에 `postinstall` 스크립트 추가
- [ ] package.json에 `build` 스크립트에 `prisma generate` 추가
- [ ] Vercel Build Logs에서 정확한 오류 확인
- [ ] Vercel 환경 변수 확인 (DATABASE_URL 등)
- [ ] 변경사항 커밋 및 푸시

---

## 🚀 빠른 수정

### package.json 수정

프로젝트 루트의 `package.json` 파일을 열고:

```json
{
  "scripts": {
    "postinstall": "prisma generate",
    "build": "prisma generate && next build",
    "dev": "next dev",
    "start": "next start",
    "lint": "next lint"
  }
}
```

그 다음:
```bash
git add package.json
git commit -m "fix: add prisma generate to build process"
git push origin main
```

---

## ⚠️ 중요

**Vercel 빌드 로그를 먼저 확인하세요!**

정확한 오류를 알면 더 정확한 해결책을 제시할 수 있습니다.

1. Vercel 대시보드 → Deployments
2. 최신 Error 배포 클릭
3. Build Logs 확인
4. 오류 메시지 공유

