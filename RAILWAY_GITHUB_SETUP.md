# Railway + GitHub 저장소 설정 가이드

## 🎯 현재 상황

Railway에서 "저장소를 찾지 못했어요" 메시지가 보입니다.

**해결 방법**: GitHub에 저장소를 만들고 코드를 푸시해야 합니다.

---

## 📋 단계별 해결 방법

### 방법 1: GitHub에서 새 저장소 만들기 (권장)

#### 1단계: GitHub에서 저장소 생성

1. **GitHub 웹사이트 접속**: https://github.com
2. **로그인**
3. **우측 상단 "+" 버튼** 클릭
4. **"New repository"** 선택
5. **저장소 정보 입력**:
   - Repository name: `TinTop` (또는 원하는 이름)
   - Description: (선택 사항)
   - Public 또는 Private 선택
   - **"Initialize this repository with a README" 체크 해제** (이미 코드가 있으므로)
6. **"Create repository"** 클릭

#### 2단계: 로컬 코드를 GitHub에 푸시

**PowerShell에서 실행:**

```powershell
# 1. Git 초기화 (이미 되어 있다면 스킵)
git init

# 2. 모든 파일 추가
git add .

# 3. 커밋
git commit -m "Initial commit"

# 4. 메인 브랜치로 변경
git branch -M main

# 5. GitHub 저장소 연결 (your-username을 실제 사용자명으로 변경)
git remote add origin https://github.com/your-username/TinTop.git

# 6. 푸시
git push -u origin main
```

**주의**: `your-username`을 실제 GitHub 사용자명으로 변경하세요!

---

### 방법 2: Railway에서 직접 만들기

1. **"Create a new repository"** 버튼 클릭
2. 저장소 이름 입력
3. **"Create and Deploy"** 클릭
4. Railway가 자동으로 GitHub에 저장소 생성

**단점**: 저장소가 Railway에서만 관리됨

---

## ✅ 저장소 생성 후

### Railway로 돌아가기

1. **Railway 워크스페이스로 돌아가기**
2. **"New Project"** 클릭
3. **"Deploy from GitHub repo"** 선택
4. **방금 만든 저장소 선택**
5. **"Deploy"** 클릭

---

## 🔧 문제 해결

### "저장소를 찾지 못했어요" 계속 나오는 경우

1. **GitHub 계정 연동 확인**
   - Railway Settings → Connected Accounts → GitHub 확인

2. **저장소 권한 확인**
   - GitHub에서 저장소가 Public인지 확인
   - 또는 Railway에 GitHub 권한이 있는지 확인

3. **검색창에서 직접 검색**
   - 저장소 이름을 검색창에 입력
   - 예: `TinTop`

### Git 푸시 오류

**"remote origin already exists" 오류:**
```powershell
git remote remove origin
git remote add origin https://github.com/your-username/TinTop.git
git push -u origin main
```

**인증 오류:**
- GitHub Personal Access Token 필요
- 또는 GitHub Desktop 사용

---

## 🚀 빠른 해결 (한 번에)

**PowerShell에서 한 번에 실행:**

```powershell
# 현재 디렉토리 확인
cd "C:\Users\partn\OneDrive\바탕 화면\Cursor\TinTop"

# Git 상태 확인
git status

# Git 초기화 (필요시)
if (-not (Test-Path .git)) {
    git init
}

# 모든 파일 추가
git add .

# 커밋
git commit -m "Initial commit for Railway deployment"

# 브랜치 변경
git branch -M main

# GitHub 저장소 URL (여기에 실제 URL 입력 필요)
# git remote add origin https://github.com/your-username/TinTop.git

# 푸시
# git push -u origin main
```

**주의**: GitHub 저장소를 먼저 만들고, URL을 확인한 후 위 명령 실행!

---

## 📝 체크리스트

배포 전 확인:

- [ ] GitHub에 저장소 생성 완료
- [ ] 로컬 코드를 GitHub에 푸시 완료
- [ ] Railway에서 GitHub 계정 연동 확인
- [ ] Railway에서 저장소 검색 성공
- [ ] 프로젝트 배포 시작

---

## ✅ 완료!

**GitHub 저장소를 만들고 푸시하면 Railway에서 찾을 수 있습니다!**

**다음 단계**: Railway에서 저장소 선택 후 배포 진행

