@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
cls
echo ========================================
echo Shell Quick Deploy
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

if not exist "app" (
    echo [ERROR] app directory not found.
    echo Current location: %CD%
    pause
    exit /b 1
)

echo Current working directory: %CD%
echo.

echo [1/4] Build test...
echo.

REM Check if node_modules exists, if not install dependencies
if not exist "node_modules" (
    echo node_modules not found. Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo [ERROR] npm install failed!
        pause
        exit /b 1
    )
    echo Dependencies installed successfully!
    echo.
) else (
    REM Check if next is installed in node_modules
    if not exist "node_modules\.bin\next.cmd" (
        echo next not found in node_modules. Installing dependencies...
        call npm install
        if errorlevel 1 (
            echo [ERROR] npm install failed!
            pause
            exit /b 1
        )
        echo Dependencies installed successfully!
        echo.
    )
)

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
echo.
echo ========================================
echo Checking essential files...
echo ========================================

REM Verify files exist locally
if not exist "package.json" (
    echo [ERROR] package.json not found in current directory!
    echo Current directory: %CD%
    pause
    exit /b 1
) else (
    echo [OK] package.json found locally
)

if not exist "netlify.toml" (
    echo [WARNING] netlify.toml not found locally
) else (
    echo [OK] netlify.toml found locally
)

echo.
echo Adding files to Git...

REM Force add essential files
git add -f package.json
if errorlevel 1 (
    echo [ERROR] Failed to add package.json to Git!
) else (
    echo [OK] package.json added to Git
)

if exist "netlify.toml" (
    git add -f netlify.toml
    if errorlevel 1 (
        echo [WARNING] Failed to add netlify.toml to Git
    ) else (
        echo [OK] netlify.toml added to Git
    )
)

REM Add all other changes
echo Adding all changes to Git...
git add . 2>&1
if errorlevel 1 (
    echo [WARNING] git add . encountered an issue, but continuing...
) else (
    echo [OK] All changes added to Git
)
echo.

echo Verifying files are staged...
git --no-pager diff --cached --name-only 2>nul | findstr /C:"package.json" /C:"netlify.toml" >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Essential files may not be staged properly
    echo Checking staged files count...
    git --no-pager diff --cached --name-only 2>nul | find /C /V "" >nul 2>&1
) else (
    echo [OK] Essential files are staged
)
echo.

echo Enter commit message (default: "Shell updates and improvements"):
set /p commit_msg=
if "!commit_msg!"=="" set commit_msg=Shell updates and improvements
echo.
echo Committing with message: !commit_msg!
echo.

git commit -m "!commit_msg!" 2>&1
if errorlevel 1 (
    echo [WARNING] Commit failed or no changes to commit.
    echo.
    echo Current Git status:
    git status --short
    echo.
    echo Attempting to commit with --allow-empty...
    git commit --allow-empty -m "!commit_msg! - force commit" 2>&1
) else (
    echo [SUCCESS] Commit completed!
    echo.
    echo Verifying commit contains essential files...
    git show HEAD --name-only --pretty=format: | findstr /C:"package.json" /C:"netlify.toml"
    if errorlevel 1 (
        echo [WARNING] Essential files may not be in the commit
    ) else (
        echo [OK] Essential files are in the commit
    )
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
echo [NOTE] Netlify Production branch is set to 'main'
echo If your current branch is 'master', it will also push to 'main' branch for Netlify deployment.
echo.

REM Check if remote exists
git remote get-url origin >nul 2>&1
if errorlevel 1 (
    echo [INFO] Git remote 'origin' is not configured.
    echo.
    echo Attempting to set remote to: https://github.com/partner0010/freeshell.git
    echo.
    git remote add origin https://github.com/partner0010/freeshell.git
    if errorlevel 1 (
        echo [WARNING] Failed to add remote automatically.
        echo.
        echo To connect your repository to GitHub manually:
        echo Run: git remote add origin https://github.com/partner0010/freeshell.git
        echo.
        echo After setting up remote, run this script again.
        echo.
        pause
        exit /b 1
    )
    echo [SUCCESS] Remote 'origin' added successfully!
    echo.
)

echo Checking Git remote configuration...
git remote -v
echo.

echo ========================================
echo IMPORTANT: Netlify 배포 확인
echo ========================================
echo 1. netlify.toml이 프로젝트 루트에 있는지 확인하세요
echo 2. Git 저장소가 GitHub와 연결되어 있는지 확인하세요 (위 참고)
echo 3. Netlify 대시보드에서 저장소 연결 확인:
echo    - Site settings ^> Build ^& deploy ^> Continuous Deployment
echo    - Repository가 올바르게 연결되어 있는지 확인
echo    - Production branch가 "%current_branch%"인지 확인
echo 4. Domain: freeshell.co.kr
echo.
echo Push to GitHub? (Y/N)
set /p push_confirm=
if /i "%push_confirm%"=="Y" (
    echo.
    echo Pushing to origin %current_branch%...
    echo.
    
    REM Try push with upstream first (for first time push)
    call git push -u origin %current_branch%
    if errorlevel 1 (
        REM If upstream push fails, try regular push (if upstream already set)
        echo.
        echo First push failed, trying regular push...
        call git push origin %current_branch%
        if errorlevel 1 (
            echo.
            echo ========================================
            echo [ERROR] Push failed!
            echo ========================================
            echo.
            echo Troubleshooting:
            echo 1. Check branch name: git branch
            echo 2. Check remote: git remote -v
            echo 3. Tried to push to: %current_branch%
            echo 4. Check if you have push access to the repository
            echo 5. Check if authentication is required (GitHub credentials)
            echo 6. If using SSH, ensure SSH key is set up
            echo.
            echo To push manually, run:
            echo   git push -u origin %current_branch%
            echo.
            pause
            exit /b 1
        )
    )
    
    REM If current branch is master, also push to main for Netlify
    if /i "%current_branch%"=="master" (
        echo.
        echo Also pushing to 'main' branch for Netlify deployment...
        call git push origin master:main --force-with-lease
        if errorlevel 1 (
            echo [WARNING] Force push failed, trying regular push...
            call git push origin master:main
            if errorlevel 1 (
                echo [ERROR] Failed to push to main branch!
                echo.
                echo This is critical - Netlify monitors the 'main' branch.
                echo Please check:
                echo 1. GitHub authentication
                echo 2. Repository permissions
                echo 3. Branch protection settings
                echo.
                pause
            ) else (
                echo [SUCCESS] Pushed to 'main' branch successfully!
            )
        ) else (
            echo [SUCCESS] Pushed to 'main' branch successfully!
        )
        echo.
        echo Verifying files exist on GitHub main branch...
        timeout /t 3 /nobreak >nul
        echo Please manually verify at: https://github.com/partner0010/freeshell/blob/main/package.json
    )
    
    echo.
    echo ========================================
    echo [SUCCESS] Push to GitHub completed!
    echo ========================================
    echo.
    echo IMPORTANT: GitHub 저장소 확인
    echo ========================================
    echo 다음 링크에서 package.json과 netlify.toml 파일이 있는지 확인하세요:
    echo.
    if /i "%current_branch%"=="master" (
        echo Main branch: https://github.com/partner0010/freeshell/blob/main/package.json
        echo Main branch: https://github.com/partner0010/freeshell/blob/main/netlify.toml
    ) else (
        echo %current_branch% branch: https://github.com/partner0010/freeshell/blob/%current_branch%/package.json
        echo %current_branch% branch: https://github.com/partner0010/freeshell/blob/%current_branch%/netlify.toml
    )
    echo.
    echo 파일이 보이지 않으면:
    echo 1. 브라우저에서 위 링크를 열어 확인
    echo 2. 파일이 없으면 다시 배치 파일을 실행
    echo.
    echo Next steps:
    echo 1. Go to Netlify dashboard: https://app.netlify.com
    echo 2. Select your site (freeshell.co.kr)
    echo 3. Go to "Deploys" tab
    echo 4. Wait for automatic deployment (usually 1-2 minutes)
    echo 5. If no deployment appears:
    echo    - Check Site settings ^> Build ^& deploy ^> Continuous Deployment
    echo    - Verify repository is connected
    echo    - Verify production branch is: %current_branch%
    echo    - Try "Trigger deploy" button manually
    echo 6. Check domain: https://freeshell.co.kr
    echo.
    echo ========================================
    echo.
) else (
    echo Push skipped.
    echo.
    echo To deploy manually:
    echo 1. Run: git push origin %current_branch%
    echo 2. Or use deployment platform CLI
    echo 3. Or trigger deploy from dashboard
)

echo.
pause
