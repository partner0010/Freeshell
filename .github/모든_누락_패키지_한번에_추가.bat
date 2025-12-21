@echo off
chcp 65001 >nul
echo ========================================
echo 모든 누락 패키지 한번에 추가
echo ========================================
echo.

set "PROJECT_ROOT=%~dp0.."
cd /d "%PROJECT_ROOT%"

echo 현재 디렉토리: %CD%
echo.

echo [1/2] package.json에 모든 누락 패키지 추가...
powershell -Command "$json = Get-Content 'package.json' -Raw | ConvertFrom-Json; $added = $false; $packages = @{'@dnd-kit/core'='^6.1.0'; '@dnd-kit/sortable'='^8.0.0'; '@dnd-kit/utilities'='^3.2.2'; 'axios'='^1.6.0'; 'openai'='^4.20.0'}; foreach ($pkg in $packages.Keys) { if (-not $json.dependencies.$pkg) { $json.dependencies | Add-Member -NotePropertyName $pkg -NotePropertyValue $packages[$pkg] -Force; $added = $true; Write-Host \"✓ $pkg 추가\" } }; if ($added) { $json | ConvertTo-Json -Depth 10 | Set-Content 'package.json'; Write-Host \"`n✓ 모든 패키지 추가 완료\" } else { Write-Host \"✓ 모든 패키지가 이미 있습니다\" }"
echo.

echo [2/2] package.json 내용 확인...
findstr /C:"@dnd-kit" package.json >nul && echo ✓ @dnd-kit 패키지 확인됨 || echo ✗ @dnd-kit 패키지 없음
findstr /C:"axios" package.json >nul && echo ✓ axios 패키지 확인됨 || echo ✗ axios 패키지 없음
findstr /C:"openai" package.json >nul && echo ✓ openai 패키지 확인됨 || echo ✗ openai 패키지 없음
echo.

echo ========================================
echo 완료!
echo ========================================
echo.
echo 다음 단계:
echo 1. Git에 푸시: git add package.json ^&^& git commit -m "fix: add all missing packages" ^&^& git push origin main
echo 2. Netlify에서 재배포 확인
echo.
pause

