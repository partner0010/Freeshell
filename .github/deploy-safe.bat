@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
cls
echo ========================================
echo Shell Quick Deploy (Safe Mode)
echo ========================================
echo.

REM Trap errors and continue
set "ERROR_OCCURRED=0"

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

REM Check if node_modules exists
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
    pause
    exit /b 1
)
echo Build successful!
echo.

echo [2/4] Git status check...
git status 2>&1
if errorlevel 1 (
    echo [WARNING] git status failed, but continuing...
    set "ERROR_OCCURRED=1"
)
echo.
echo Changed files preview:
git status --short 2>&1
echo.

echo [3/4] Commit changes...
echo.
echo ========================================
echo Checking essential files...
echo ========================================

if not exist "package.json" (
    echo [ERROR] package.json not found in current directory!
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

git add -f package.json 2>&1
if errorlevel 1 (
    echo [WARNING] Failed to add package.json to Git
    set "ERROR_OCCURRED=1"
) else (
    echo [OK] package.json added to Git
)

if exist "netlify.toml" (
    git add -f netlify.toml 2>&1
    if errorlevel 1 (
        echo [WARNING] Failed to add netlify.toml to Git
        set "ERROR_OCCURRED=1"
    ) else (
        echo [OK] netlify.toml added to Git
    )
)

echo Adding all changes to Git...
git add . 2>&1
if errorlevel 1 (
    echo [WARNING] git add . encountered an issue
    set "ERROR_OCCURRED=1"
) else (
    echo [OK] All changes added to Git
)
echo.

echo Verifying files are staged...
git --no-pager diff --cached --name-only 2>nul | findstr /C:"package.json" /C:"netlify.toml" >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Essential files may not be staged properly
) else (
    echo [OK] Essential files are staged
)
echo.

echo.
echo ========================================
echo Changed files to be committed:
echo ========================================
git --no-pager diff --cached --name-only 2>nul
if errorlevel 1 (
    git --no-pager diff --name-only 2>nul
)
echo.
echo Enter commit message (default: "Shell updates and improvements"):
set /p commit_msg=
if "!commit_msg!"=="" set commit_msg=Shell updates and improvements
echo.
echo Committing with message: !commit_msg!
echo.

git commit -m "!commit_msg!" 2>&1
set commit_result=!errorlevel!
if !commit_result! neq 0 (
    echo [WARNING] Commit failed or no changes to commit (errorlevel: !commit_result!)
    echo.
    echo Current Git status:
    git status --short 2>&1
    echo.
    echo Do you want to skip commit and continue? (Y/N)
    set /p skip_commit=
    if /i "!skip_commit!"=="Y" (
        echo Commit skipped. Continuing...
    ) else (
        echo Attempting to commit with --allow-empty...
        git commit --allow-empty -m "!commit_msg! - force commit" 2>&1
        if errorlevel 1 (
            echo [WARNING] Force commit also failed!
        ) else (
            echo [SUCCESS] Force commit completed!
        )
    )
) else (
    echo [SUCCESS] Commit completed!
)
echo.

echo [4/4] Push to GitHub...
for /f "tokens=*" %%i in ('git branch --show-current 2^>nul') do set current_branch=%%i
if "!current_branch!"=="" (
    for /f "tokens=*" %%i in ('git rev-parse --abbrev-ref HEAD 2^>nul') do set current_branch=%%i
)
if "!current_branch!"=="" set current_branch=master

echo Current branch: !current_branch!
echo.

git remote get-url origin >nul 2>&1
if errorlevel 1 (
    echo [INFO] Git remote 'origin' is not configured.
    echo.
    echo Attempting to set remote to: https://github.com/partner0010/freeshell.git
    echo.
    git remote add origin https://github.com/partner0010/freeshell.git 2>&1
    if errorlevel 1 (
        echo [WARNING] Failed to add remote automatically.
        echo.
        pause
        exit /b 1
    )
    echo [SUCCESS] Remote 'origin' added successfully!
    echo.
)

echo Checking Git remote configuration...
git remote -v 2>&1
echo.

echo ========================================
echo IMPORTANT: Netlify 배포 확인
echo ========================================
echo.
echo Push to GitHub? (Y/N)
set /p push_confirm=
if /i "!push_confirm!"=="Y" (
    echo.
    echo Pushing to origin !current_branch!...
    echo.
    
    call git push -u origin !current_branch! 2>&1
    if errorlevel 1 (
        echo.
        echo First push failed, trying regular push...
        call git push origin !current_branch! 2>&1
        if errorlevel 1 (
            echo.
            echo [ERROR] Push failed!
            echo.
            echo To push manually, run:
            echo   git push -u origin !current_branch!
            echo.
            pause
            exit /b 1
        )
    )
    
    if /i "!current_branch!"=="master" (
        echo.
        echo Also pushing to 'main' branch for Netlify deployment...
        call git push origin master:main --force-with-lease 2>&1
        if errorlevel 1 (
            echo [WARNING] Force push failed, trying regular push...
            call git push origin master:main 2>&1
            if errorlevel 1 (
                echo [ERROR] Failed to push to main branch!
                pause
            ) else (
                echo [SUCCESS] Pushed to 'main' branch successfully!
            )
        ) else (
            echo [SUCCESS] Pushed to 'main' branch successfully!
        )
    )
    
    echo.
    echo [SUCCESS] Push to GitHub completed!
    echo.
) else (
    echo Push skipped.
    echo.
)

echo.
echo ========================================
echo Deploy script completed!
echo ========================================
echo.
pause

