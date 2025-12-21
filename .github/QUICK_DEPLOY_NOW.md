# 🚀 즉시 재배포 방법

## 방법 1: 자동 스크립트 실행 (권장)

프로젝트 루트에서:
```bash
.github\deploy-now.bat
```

이 스크립트가 자동으로:
1. Git 경로 설정
2. 변경사항 커밋
3. GitHub에 푸시
4. Vercel 자동 배포 트리거

---

## 방법 2: Vercel 대시보드에서 직접 재배포 (가장 빠름) ⭐

1. **Vercel 대시보드 접속**
   - https://vercel.com/dashboard

2. **프로젝트 선택**
   - Freeshell 프로젝트 클릭

3. **Deployments 탭**
   - 왼쪽 메뉴에서 "Deployments" 클릭

4. **최신 배포 선택**
   - 가장 위에 있는 배포 선택

5. **Redeploy 실행**
   - 배포 카드 오른쪽 상단의 **"..."** (점 3개) 메뉴 클릭
   - **"Redeploy"** 선택
   - 확인

6. **배포 완료 대기**
   - 약 1-2분 소요
   - 상태가 "Ready" (초록색)가 되면 완료

---

## 방법 3: 수동 Git 푸시

프로젝트 루트에서:

```bash
# 1. Git 경로 설정 (필요한 경우)
git config --global --add safe.directory "C:/Users/partn/OneDrive/바탕 화면/Cursor/Freeshell"

# 2. 변경사항 추가 및 커밋
git add .
git commit -m "fix: resolve all TypeScript and Prisma schema errors"

# 3. 푸시
git push origin main
```

---

## ✅ 권장 방법

**가장 빠르고 확실한 방법**: **방법 2 (Vercel 대시보드에서 직접 "Redeploy" 버튼 클릭)**

1. https://vercel.com/dashboard
2. Freeshell 프로젝트 → Deployments
3. 최신 배포의 "..." → "Redeploy"

이 방법이 가장 빠르고 확실합니다! 🚀

