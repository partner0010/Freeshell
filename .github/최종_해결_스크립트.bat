@echo off
chcp 65001 >nul
echo ========================================
echo 최종 해결 스크립트 - 모든 누락 패키지 추가
echo ========================================
echo.

set "PROJECT_ROOT=%~dp0.."
cd /d "%PROJECT_ROOT%"

echo 현재 디렉토리: %CD%
echo.

echo [1/5] package.json 확인 및 생성...
if not exist "package.json" (
    echo package.json 파일이 없습니다. 생성합니다...
    if exist ".github\package.json" (
        copy /Y ".github\package.json" "package.json" >nul
        echo ✓ package.json 복사 완료
    ) else (
        echo ✗ .github\package.json 파일을 찾을 수 없습니다
        pause
        exit /b 1
    )
) else (
    echo ✓ package.json 파일이 있습니다
)
echo.

echo [2/5] 누락된 패키지 확인 및 추가...
powershell -Command "$json = Get-Content 'package.json' -Raw | ConvertFrom-Json; $added = $false; if (-not $json.dependencies.'@dnd-kit/core') { $json.dependencies | Add-Member -NotePropertyName '@dnd-kit/core' -NotePropertyValue '^6.1.0' -Force; $added = $true }; if (-not $json.dependencies.'@dnd-kit/sortable') { $json.dependencies | Add-Member -NotePropertyName '@dnd-kit/sortable' -NotePropertyValue '^8.0.0' -Force; $added = $true }; if (-not $json.dependencies.'@dnd-kit/utilities') { $json.dependencies | Add-Member -NotePropertyName '@dnd-kit/utilities' -NotePropertyValue '^3.2.2' -Force; $added = $true }; if (-not $json.dependencies.'axios') { $json.dependencies | Add-Member -NotePropertyName 'axios' -NotePropertyValue '^1.6.0' -Force; $added = $true }; if ($added) { $json | ConvertTo-Json -Depth 10 | Set-Content 'package.json'; Write-Host '✓ 패키지 추가 완료' } else { Write-Host '✓ 모든 패키지가 이미 있습니다' }"
echo.

echo [3/5] netlify.toml 확인...
if not exist "netlify.toml" (
    echo netlify.toml 파일이 없습니다. 생성합니다...
    if exist ".github\netlify.toml" (
        copy /Y ".github\netlify.toml" "netlify.toml" >nul
        echo ✓ netlify.toml 복사 완료
    ) else (
        echo netlify.toml 파일을 생성합니다...
        (
            echo [build]
            echo   command = "npx prisma generate && npm run build"
            echo   publish = ".next"
            echo.
            echo [[plugins]]
            echo   package = "@netlify/plugin-nextjs"
            echo.
            echo [build.environment]
            echo   NODE_VERSION = "18"
        ) > netlify.toml
        echo ✓ netlify.toml 생성 완료
    )
) else (
    echo ✓ netlify.toml 파일이 있습니다
)
echo.

echo [4/5] prisma/schema.prisma 확인...
if not exist "prisma" (
    mkdir "prisma" >nul
)
if not exist "prisma\schema.prisma" (
    echo prisma\schema.prisma 파일이 없습니다. 복사합니다...
    if exist ".github\prisma\schema.prisma" (
        copy /Y ".github\prisma\schema.prisma" "prisma\schema.prisma" >nul
        echo ✓ schema.prisma 복사 완료
    ) else (
        echo ✗ .github\prisma\schema.prisma 파일을 찾을 수 없습니다
    )
) else (
    echo ✓ prisma\schema.prisma 파일이 있습니다
)
echo.

echo [5/5] Git 상태 확인...
git status --short package.json netlify.toml prisma/schema.prisma 2>nul
if errorlevel 1 (
    echo Git 저장소가 아닙니다. Git 초기화가 필요할 수 있습니다.
) else (
    echo.
    echo Git에 커밋 및 푸시를 진행하시겠습니까? (Y/N)
    set /p PUSH="> "
    if /i "%PUSH%"=="Y" (
        git add package.json netlify.toml prisma/schema.prisma
        git commit -m "fix: add missing packages (axios, @dnd-kit) and config files"
        git pull origin main --rebase
        git push origin main
        echo.
        echo ✓ Git 푸시 완료
    ) else (
        echo Git 푸시를 건너뜁니다.
    )
)

echo.
echo ========================================
echo 완료!
echo ========================================
echo.
echo 다음 단계:
echo 1. Git에 푸시 (위에서 하지 않은 경우)
echo 2. Netlify에서 재배포 확인
echo.
pause

