# 배포 스크립트 실행 가이드

## ⚠️ 배치 파일이 바로 닫히는 경우

배치 파일을 더블클릭하면 바로 닫힐 수 있습니다. 다음 방법을 사용하세요:

## 📋 실행 방법

### 방법 1: CMD에서 실행 (권장)

1. **Win + R** 키 누르기
2. `cmd` 입력하고 Enter
3. 다음 명령어 입력:

```cmd
cd "C:\Users\partn\OneDrive\바탕 화면\Cursor\Freeshell Update"
.github\deploy.bat
```

### 방법 2: PowerShell에서 실행

1. **Win + X** 키 누르기
2. **Windows PowerShell** 선택
3. 다음 명령어 입력:

```powershell
cd "C:\Users\partn\OneDrive\바탕 화면\Cursor\Freeshell Update"
.\.github\deploy.bat
```

### 방법 3: 파일 탐색기에서

1. 파일 탐색기에서 `.github` 폴더 열기
2. `deploy.bat` 파일을 **우클릭**
3. **"여기서 명령 프롬프트 열기"** 또는 **"PowerShell에서 실행"** 선택

### 방법 4: 테스트 스크립트로 확인

먼저 테스트 스크립트로 배치 파일이 정상 작동하는지 확인:

```cmd
cd "C:\Users\partn\OneDrive\바탕 화면\Cursor\Freeshell Update"
.github\test-deploy.bat
```

이 스크립트가 정상적으로 실행되면 배치 파일 자체는 문제가 없습니다.

## 🔍 문제 진단

### 배치 파일이 바로 닫히는 이유

1. **더블클릭으로 실행**: 더블클릭 시 에러 발생 시 바로 닫힘
2. **초기 에러**: 배치 파일 시작 부분에서 에러 발생
3. **경로 문제**: 잘못된 디렉토리에서 실행

### 해결 방법

1. **CMD에서 실행**: 위의 방법 1 사용
2. **디버그 스크립트 실행**: 
   ```
   .github\deploy-debug.bat
   ```
3. **테스트 스크립트 실행**:
   ```
   .github\test-deploy.bat
   ```

## 📝 배치 파일 목록

- **`deploy.bat`**: 정상 배포 스크립트
- **`deploy-debug.bat`**: 디버그 모드 (문제 진단용)
- **`test-deploy.bat`**: 간단한 테스트 (창이 제대로 열리는지 확인)

## 🚀 빠른 시작

가장 쉬운 방법:

```cmd
cd /d "C:\Users\partn\OneDrive\바탕 화면\Cursor\Freeshell Update" && .github\deploy.bat
```

또는 PowerShell에서:

```powershell
cd "C:\Users\partn\OneDrive\바탕 화면\Cursor\Freeshell Update"; .\.github\deploy.bat
```

## 💡 팁

배치 파일을 자주 사용한다면:

1. **바로가기 생성**:
   - `deploy.bat` 우클릭 → 바로가기 만들기
   - 바로가기 우클릭 → 속성
   - **대상**에 다음 추가: `cmd /k`
   - 예: `C:\Windows\System32\cmd.exe /k "C:\Users\partn\OneDrive\바탕 화면\Cursor\Freeshell Update\.github\deploy.bat"`

2. **작업 디렉토리 설정**:
   - 바로가기 속성에서
   - **시작 위치**: `C:\Users\partn\OneDrive\바탕 화면\Cursor\Freeshell Update`

이렇게 하면 바로가기를 더블클릭해도 창이 바로 닫히지 않습니다!

