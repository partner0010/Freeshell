# OneDrive 경로 문제 해결 방법

## 문제

OneDrive 폴더에 프로젝트가 있으면 `.next` 디렉토리 접근에 문제가 발생할 수 있습니다.

## 해결 방법

### 방법 1: OneDrive에서 `.next` 폴더 제외 (권장)

1. **OneDrive 설정 열기**
   - 작업 표시줄의 OneDrive 아이콘 우클릭
   - "설정" 클릭

2. **백업 탭 선택**
   - "백업" 또는 "Backup" 탭 클릭

3. **폴더 제외 추가**
   - "폴더 제외" 또는 "Exclude folders" 클릭
   - 프로젝트의 `.next` 폴더를 제외 목록에 추가

### 방법 2: 프로젝트를 OneDrive 밖으로 이동 (가장 확실)

1. **프로젝트 폴더를 다른 위치로 이동**
   - 예: `C:\Projects\Freeshell Update` 또는 `C:\Users\partn\Documents\Freeshell Update`
   - OneDrive 폴더가 아닌 곳으로 이동

2. **터미널에서 새 위치로 이동**
   ```powershell
   cd "C:\Projects\Freeshell Update"
   npm run dev
   ```

### 방법 3: OneDrive 동기화 일시 중지 (임시 해결)

1. **OneDrive 동기화 일시 중지**
   - 작업 표시줄의 OneDrive 아이콘 우클릭
   - "동기화 일시 중지" 클릭

2. **개발 서버 실행**
   ```powershell
   npm run dev
   ```

3. **개발 완료 후 동기화 재개**

## 빠른 해결 (권장)

**가장 빠른 해결 방법:**
1. 프로젝트를 OneDrive 밖으로 이동 (예: `C:\Projects\`)
2. 새 위치에서 `npm run dev` 실행

**또는:**
1. OneDrive 설정에서 `.next` 폴더 제외
2. 기존 위치에서 계속 사용

---

**참고:** OneDrive 동기화는 개발 중인 파일들에 영향을 줄 수 있으므로, 프로젝트를 OneDrive 밖에 두는 것이 권장됩니다.
