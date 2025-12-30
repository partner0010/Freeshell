# 배치 파일 실행 문제 빠른 해결 방법

## 🔧 문제: 배치 파일이 중간에 꺼짐

배치 파일이 실행 중에 갑자기 종료되는 문제를 해결하는 방법입니다.

## ✅ 해결 방법 1: 출력 리다이렉션으로 실행

배치 파일을 다음 명령어로 실행하면 모든 출력이 `deploy.log` 파일에 기록됩니다:

### 명령 프롬프트에서:

```cmd
cd "C:\Users\partn\OneDrive\바탕 화면\Cursor\Freeshell Update"
.github\deploy.bat > deploy.log 2>&1
```

### PowerShell에서:

```powershell
cd "C:\Users\partn\OneDrive\바탕 화면\Cursor\Freeshell Update"
.github\deploy.bat *> deploy.log
```

## ✅ 해결 방법 2: 래퍼 스크립트 사용

`.github\deploy-with-log.bat` 파일을 사용하면 자동으로 로그가 기록됩니다:

```cmd
.github\deploy-with-log.bat
```

## 🔍 로그 확인

배치 파일 실행 후 로그를 확인하세요:

```powershell
Get-Content deploy.log -Tail 100
```

또는

```cmd
.github\view-log.bat
```

## 📋 배치 파일이 꺼지는 일반적인 원인

1. **에러 발생**: 배치 파일 중간에 에러가 발생하면 `exit /b` 또는 `pause` 없이 종료될 수 있음
2. **Git 인증 문제**: GitHub 인증이 필요한데 입력 대기 중 창이 닫힘
3. **조건문 오류**: `if` 문의 조건이 잘못되어 예상치 못한 분기
4. **변수 문제**: `ERRORLEVEL` 또는 변수 처리 오류

## 🛠️ 디버깅 방법

### 1. 배치 파일 끝에 pause 추가

배치 파일의 마지막에 `pause`가 있는지 확인하세요.

### 2. 각 단계마다 pause 추가

문제가 발생하는 위치를 확인하기 위해 중요한 단계마다 `pause`를 추가할 수 있습니다.

### 3. 에러 레벨 확인

각 Git 명령어 실행 후 `ERRORLEVEL`을 확인하세요:

```batch
git push ...
echo ERRORLEVEL: %ERRORLEVEL%
pause
```

## 💡 권장 사항

**항상 로그와 함께 실행하세요:**

```cmd
.github\deploy.bat > deploy.log 2>&1
```

이렇게 하면:
- 모든 출력이 로그 파일에 기록됨
- 배치 파일이 종료되어도 로그 확인 가능
- 문제 발생 위치 파악 가능

