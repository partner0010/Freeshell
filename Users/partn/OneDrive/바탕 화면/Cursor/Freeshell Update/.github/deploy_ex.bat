@echo off
chcp 65001 >nul
cls
echo ========================================
echo Freeshell Quick Deploy
echo ========================================
echo.

REM Change to project root if in .github folder
if exist "..\package.json" (
    cd ..
    echo Changed to project root: %CD%
    echo.
) else if exist "..\..\package.json" (
    cd ..\..
    echo Changed to project root: %CD%
    echo.
)

REM Check if in project root
if not exist "package.json" (
    echo [ERROR] package.json not found.
    echo Current location: %CD%
    echo Please run from project root folder.
    pause
    exit /b 1
)

if not exist "src\app" (
    echo [ERROR] src\app directory not found.
    echo Current location: %CD%
    pause
    exit /b 1
)

echo Current working directory: %CD%
echo.

echo [1/4] Build test...
echo.
echo Cleaning .next folder...
if exist ".next" rmdir /s /q .next 2>nul
echo.

echo Starting build (this may take a few minutes)...
set NODE_OPTIONS=--max-old-space-size=4096
call npm run build
if errorlevel 1 (
    echo [ERROR] Build failed! Please check errors.
    echo.
    echo Troubleshooting:
    echo 1. Delete .next folder: rmdir /s /q .next
    echo 2. Reinstall dependencies: rmdir /s /q node_modules ^&^& npm install
    echo 3. Check TypeScript errors: npx tsc --noEmit
    echo.
    pause
    exit /b 1
)
echo Build successful!
echo.

echo [2/4] Git status check...
git status
echo.

echo [3/4] Commit changes...
echo Enter commit message (default: "Feature updates and improvements"):
set /p commit_msg=
if "%commit_msg%"=="" set commit_msg=Feature updates and improvements

git add .
git commit -m "%commit_msg%"
if errorlevel 1 (
    echo [WARNING] Commit failed or no changes.
) else (
    echo Commit completed!
)
echo.

echo [4/4] Push to GitHub...
REM Get current branch name
for /f "tokens=*" %%i in ('git branch --show-current 2^>nul') do set current_branch=%%i
if "%current_branch%"=="" (
    for /f "tokens=*" %%i in ('git rev-parse --abbrev-ref HEAD 2^>nul') do set current_branch=%%i
)
if "%current_branch%"=="" set current_branch=master

echo Current branch: %current_branch%
echo.
echo ========================================
echo IMPORTANT: Netlify 배포 확인
echo ========================================
echo 1. netlify.toml이 프로젝트 루트에 있는지 확인하세요
echo 2. Git 저장소가 GitHub와 연결되어 있는지 확인하세요
echo 3. Netlify가 Git 저장소와 연결되어 있는지 확인하세요
echo.
echo Push to GitHub? (Y/N)
set /p push_confirm=
if /i "%push_confirm%"=="Y" (
    echo.
    echo Pushing to origin %current_branch%...
    git push origin %current_branch%
    if errorlevel 1 (
        echo.
        echo [ERROR] Push failed!
        echo.
        echo Troubleshooting:
        echo 1. Check branch name: git branch
        echo 2. Check remote: git remote -v
        echo 3. Tried to push to: %current_branch%
        echo 4. If branch doesn't exist, create it: git push -u origin %current_branch%
        echo.
        pause
        exit /b 1
    )
    echo.
    echo ========================================
    echo [SUCCESS] Push to GitHub completed!
    echo ========================================
    echo.
    echo Next steps:
    echo 1. Check Netlify dashboard: https://app.netlify.com
    echo 2. Go to Deploys tab
    echo 3. Wait for automatic deployment (usually 1-2 minutes)
    echo 4. If no deployment appears, check:
    echo    - Site settings ^> Build ^& deploy ^> Continuous Deployment
    echo    - Repository connection
    echo    - Branch name matches: %current_branch%
    echo.
    echo ========================================
) else (
    echo Push skipped.
    echo.
    echo To deploy manually:
    echo 1. Run: git push origin %current_branch%
    echo 2. Or use Netlify CLI: netlify deploy --prod
    echo 3. Or trigger deploy from Netlify dashboard
)

echo.
pause

