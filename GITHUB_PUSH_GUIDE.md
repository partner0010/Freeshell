# GitHub 푸시 가이드 (프리셀 저장소)

## 🎯 현재 상황

GitHub 저장소 "프리셀" (Freeshell)이 생성되었습니다!
이제 로컬 코드를 이 저장소에 푸시해야 합니다.

---

## 📋 단계별 가이드

### 방법 1: PowerShell에서 직접 실행 (권장)

**PowerShell을 관리자 권한으로 열고** 다음 명령어를 **하나씩** 실행하세요:

```powershell
# 1. 현재 디렉토리로 이동
cd "C:\Users\partn\OneDrive\바탕 화면\Cursor\TinTop"

# 2. Git 초기화
git init

# 3. 모든 파일 추가
git add .

# 4. 커밋
git commit -m "Initial commit for Railway deployment"

# 5. 메인 브랜치로 변경
git branch -M main

# 6. GitHub 저장소 연결
git remote add origin https://github.com/partner0010/Freeshell.git

# 7. 푸시 (인증 필요할 수 있음)
git push -u origin main
```

---

### 방법 2: GitHub Desktop 사용 (더 쉬움)

1. **GitHub Desktop 다운로드**: https://desktop.github.com/
2. **설치 후 실행**
3. **"File" → "Add Local Repository"**
4. **폴더 선택**: `C:\Users\partn\OneDrive\바탕 화면\Cursor\TinTop`
5. **"Publish repository"** 클릭
6. **저장소 선택**: `partner0010/Freeshell`
7. **"Publish repository"** 클릭

---

## 🔐 인증 문제 해결

### 푸시 시 인증 오류가 나는 경우

**Personal Access Token 필요:**

1. **GitHub 웹사이트 접속**: https://github.com
2. **우측 상단 프로필** 클릭
3. **"Settings"** 클릭
4. **왼쪽 메뉴에서 "Developer settings"** 클릭
5. **"Personal access tokens" → "Tokens (classic)"** 클릭
6. **"Generate new token" → "Generate new token (classic)"** 클릭
7. **설정**:
   - Note: `Railway Deployment`
   - Expiration: `90 days` (또는 원하는 기간)
   - Scopes: `repo` 체크 (모든 권한)
8. **"Generate token"** 클릭
9. **토큰 복사** (한 번만 보여줌!)

**PowerShell에서 푸시 시:**
```powershell
git push -u origin main
# Username: partner0010
# Password: (복사한 토큰 붙여넣기)
```

---

## ✅ 푸시 완료 확인

1. **GitHub 웹사이트 접속**: https://github.com/partner0010/Freeshell
2. **파일 목록 확인**
3. **코드가 보이면 성공!** ✅

---

## 🚀 Railway로 돌아가기

푸시가 완료되면:

1. **Railway 워크스페이스로 돌아가기**
2. **"New Project"** 클릭
3. **"Deploy from GitHub repo"** 선택
4. **"프리셀" (Freeshell) 저장소 검색**
5. **저장소 선택**
6. **"Deploy"** 클릭

---

## ⚠️ 문제 해결

### "remote origin already exists" 오류

```powershell
git remote remove origin
git remote add origin https://github.com/partner0010/Freeshell.git
git push -u origin main
```

### "fatal: not a git repository" 오류

```powershell
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/partner0010/Freeshell.git
git push -u origin main
```

### 인증 계속 실패

- GitHub Desktop 사용 권장
- 또는 Personal Access Token 사용

---

## ✅ 완료!

**코드를 푸시하면 Railway에서 저장소를 찾을 수 있습니다!**

**다음 단계**: Railway에서 저장소 선택 후 배포 진행

