@echo off
chcp 65001 >nul
echo ========================================
echo axios 패키지 추가 및 Git 푸시
echo ========================================
echo.

set "PROJECT_ROOT=%~dp0.."
cd /d "%PROJECT_ROOT%"

echo [1/4] package.json 확인...
if not exist "package.json" (
    echo package.json 파일이 없습니다. .github에서 복사합니다...
    if exist ".github\package.json" (
        copy /Y ".github\package.json" "package.json" >nul
        echo ✓ package.json 복사 완료
    ) else (
        echo ✗ .github\package.json 파일을 찾을 수 없습니다
        pause
        exit /b 1
    )
)

REM axios가 있는지 확인
findstr /C:"axios" "package.json" >nul
if errorlevel 1 (
    echo package.json에 axios 패키지 추가 중...
    REM PowerShell을 사용하여 JSON 수정
    powershell -Command "$json = Get-Content 'package.json' -Raw | ConvertFrom-Json; if (-not $json.dependencies.'axios') { $json.dependencies | Add-Member -NotePropertyName 'axios' -NotePropertyValue '^1.6.0' -Force }; $json | ConvertTo-Json -Depth 10 | Set-Content 'package.json'"
    echo ✓ axios 패키지 추가 완료
) else (
    echo ✓ package.json에 axios 패키지가 이미 있습니다
)
echo.

echo [2/4] Git 변경사항 스테이징...
git add package.json
if errorlevel 1 (
    echo 경고: git add 실패 (이미 스테이징되었거나 파일이 없을 수 있음)
)
echo.

echo [3/4] Git 커밋...
git commit -m "fix: add missing axios package"
if errorlevel 1 (
    echo 경고: 커밋할 변경사항이 없거나 이미 커밋되었습니다.
)
echo.

echo [4/4] Git 푸시...
git pull origin main --rebase
if errorlevel 1 (
    echo 경고: pull 실패. 계속 진행합니다...
)

git push origin main
if errorlevel 1 (
    echo.
    echo 푸시 실패. 수동으로 확인해주세요.
    pause
    exit /b 1
)

echo.
echo ========================================
echo 완료!
echo ========================================
echo.
echo Netlify에서 자동으로 재배포가 시작됩니다.
echo.
pause

