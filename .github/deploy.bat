@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

REM ========================================
REM Shell Quick Deploy - 완전 재작성 버전
REM ========================================

REM 배치 파일이 있는 디렉토리의 절대 경로 가져오기
set "BATCH_DIR=%~dp0"
set "BATCH_DIR=!BATCH_DIR:~0,-1!"

REM 프로젝트 루트 디렉토리 찾기 (배치 파일이 .github 폴더에 있다고 가정)
if exist "!BATCH_DIR!\..\package.json" (
    set "PROJECT_ROOT=!BATCH_DIR!\.."
) else if exist "!BATCH_DIR!\..\..\package.json" (
    set "PROJECT_ROOT=!BATCH_DIR!\..\.."
) else (
    REM 현재 디렉토리에서 찾기
    if exist "package.json" (
        set "PROJECT_ROOT=%CD%"
    ) else (
        echo [ERROR] 프로젝트 루트를 찾을 수 없습니다.
        echo 배치 파일 위치: !BATCH_DIR!
        echo 현재 디렉토리: %CD%
        pause
        exit /b 1
    )
)

REM 프로젝트 루트로 이동
cd /d "!PROJECT_ROOT!"
set "PROJECT_ROOT=%CD%"

cls
echo ========================================
echo Shell Quick Deploy
echo ========================================
echo.
echo 프로젝트 루트: %PROJECT_ROOT%
echo.

REM 필수 파일 존재 확인
if not exist "package.json" (
    echo [ERROR] package.json을 찾을 수 없습니다.
    echo 위치: %PROJECT_ROOT%
    pause
    exit /b 1
)

if not exist "app" (
    echo [ERROR] app 디렉토리를 찾을 수 없습니다.
    echo 위치: %PROJECT_ROOT%
    pause
    exit /b 1
)

REM Git 저장소 확인 및 초기화
REM 현재 디렉토리에 .git 폴더가 있는지 확인
if not exist ".git" (
    echo [INFO] Git 저장소가 없습니다. 초기화 중...
    git init -b master
    if errorlevel 1 (
        echo [ERROR] Git 초기화 실패
        pause
        exit /b 1
    )
    echo Git 저장소 초기화 완료
) else (
    echo Git 저장소 확인 완료
)
echo.

REM 원격 저장소 설정
git remote get-url origin >nul 2>&1
if errorlevel 1 (
    echo [INFO] 원격 저장소 설정 중...
    git remote add origin https://github.com/partner0010/freeshell.git
    if errorlevel 1 (
        echo [WARNING] 원격 저장소 추가 실패 (이미 존재할 수 있음)
        echo 원격 저장소 목록 확인 중...
        git remote -v
    ) else (
        echo [OK] 원격 저장소 추가 완료
    )
) else (
    echo [OK] 원격 저장소 확인 완료
    git remote -v
)
echo.

echo [1/4] 의존성 확인 및 설치...
echo.

REM 의존성 확인
if not exist "node_modules\.bin\next.cmd" (
    echo node_modules가 없거나 불완전합니다. 설치 중...
    call npm install
    if errorlevel 1 (
        echo [ERROR] npm install 실패!
        pause
        exit /b 1
    )
    echo 의존성 설치 완료!
) else (
    echo 의존성 확인 완료
)
echo.

echo [2/4] 빌드 테스트...
echo.

REM .next 폴더 정리
if exist ".next" (
    echo .next 폴더 삭제 중...
    rmdir /s /q .next 2>nul
)

echo 빌드 시작 (몇 분 소요될 수 있습니다)...
set NODE_OPTIONS=--max-old-space-size=4096
call npm run build
if errorlevel 1 (
    echo.
    echo [ERROR] 빌드 실패!
    echo.
    pause
    exit /b 1
)
echo 빌드 성공!
echo.

echo [3/4] Git 커밋...
echo.
echo [DEBUG] 단계 3 시작: 브랜치 확인 중...
REM 현재 브랜치 확인
for /f "tokens=*" %%i in ('git rev-parse --abbrev-ref HEAD 2^>nul') do set "CURRENT_BRANCH=%%i"
if "!CURRENT_BRANCH!"=="" (
    echo [DEBUG] HEAD 브랜치 이름을 가져올 수 없음, 다른 방법 시도...
    REM 아직 커밋이 없는 경우
    for /f "tokens=*" %%i in ('git branch --show-current 2^>nul') do set "CURRENT_BRANCH=%%i"
    if "!CURRENT_BRANCH!"=="" (
        echo [DEBUG] 브랜치 이름을 찾을 수 없음, master 브랜치 생성 중...
        REM master 브랜치 생성
        git checkout -b master 2>nul
        if errorlevel 1 (
            git branch master 2>nul
        )
        set "CURRENT_BRANCH=master"
    )
)
if "!CURRENT_BRANCH!"=="HEAD" set "CURRENT_BRANCH=master"

echo [DEBUG] 브랜치 확인 완료
echo 현재 브랜치: !CURRENT_BRANCH!
echo.

REM 필수 파일 강제 추가
echo [DEBUG] 단계 3-1: 필수 파일 추가 시작...
echo 필수 파일 추가 중...
git add -f package.json
if errorlevel 1 (
    echo [WARNING] package.json 추가 실패
) else (
    echo [OK] package.json 추가 완료
)
if exist "netlify.toml" (
    git add -f netlify.toml
    if errorlevel 1 (
        echo [WARNING] netlify.toml 추가 실패
    ) else (
        echo [OK] netlify.toml 추가 완료
    )
)
echo [DEBUG] 필수 파일 추가 완료

REM 모든 변경사항 추가
echo [DEBUG] 단계 3-2: 모든 변경사항 추가 시작...
echo 모든 변경사항 추가 중...
git add -A
if errorlevel 1 (
    echo [WARNING] git add 실패
) else (
    echo [OK] 파일 추가 완료
)
echo [DEBUG] 모든 변경사항 추가 완료
echo.

REM 커밋 메시지 입력
echo [DEBUG] 단계 3-3: 커밋 메시지 입력 시작...
echo 커밋 메시지를 입력하세요 (Enter: 기본값 사용):
set /p "COMMIT_MSG="
if "!COMMIT_MSG!"=="" set "COMMIT_MSG=Shell updates and improvements"
echo.
echo 커밋 메시지: !COMMIT_MSG!
echo [DEBUG] 커밋 메시지 입력 완료
echo.

REM 커밋
echo [DEBUG] 단계 3-4: Git 커밋 실행 시작...
echo 커밋 중...
git commit -m "!COMMIT_MSG!"
if errorlevel 1 (
    echo.
    echo [WARNING] 커밋 실패 또는 변경사항 없음
    echo Git 상태 확인:
    git status --short
    echo.
    echo 변경사항이 없어도 계속 진행합니다...
) else (
    echo [OK] 커밋 완료!
)
echo [DEBUG] Git 커밋 단계 완료
echo.

echo [4/4] GitHub로 푸시...
echo.
echo [DEBUG] 단계 4 시작: GitHub 푸시 준비...
echo.

REM 원격 저장소 내용 가져오기 (먼저 시도)
echo [DEBUG] 단계 4-1: 원격 저장소 fetch 시작...
echo 원격 저장소 정보 가져오는 중...
git fetch origin 2>&1 | findstr /V "fatal:" >nul
if errorlevel 1 (
    echo [INFO] 원격 저장소를 가져올 수 없습니다 (첫 푸시일 수 있음)
    echo 이는 정상일 수 있습니다. 계속 진행합니다.
) else (
    echo [OK] 원격 저장소 정보 가져오기 완료
)
echo [DEBUG] 원격 저장소 fetch 완료
echo.

REM 로컬 커밋이 있는지 확인
echo [DEBUG] 단계 4-2: 로컬 커밋 확인 시작...
git rev-parse --verify HEAD >nul 2>&1
if errorlevel 1 (
    echo [ERROR] 로컬 커밋이 없습니다!
    echo 커밋이 필요합니다. 다시 시도해주세요.
    pause
    exit /b 1
) else (
    echo [OK] 로컬 커밋 확인됨
)
echo [DEBUG] 로컬 커밋 확인 완료
echo.

REM master 브랜치로 푸시 (force-with-lease 사용)
echo [DEBUG] 단계 4-3: 브랜치 푸시 시작 (!CURRENT_BRANCH!)...
echo !CURRENT_BRANCH! 브랜치로 푸시 중...
echo [DEBUG] 원격 저장소 확인 중...
git remote -v
echo [DEBUG] 원격 저장소 확인 완료
echo.
echo [DEBUG] git push -u origin !CURRENT_BRANCH! --force-with-lease 실행 중...
echo [주의] 이 작업은 몇 초에서 몇 분이 걸릴 수 있습니다...
git push -u origin !CURRENT_BRANCH! --force-with-lease 2>&1
set PUSH_EXIT_CODE=!ERRORLEVEL!
echo [DEBUG] Git push 명령어 실행 완료 - 에러 레벨: !PUSH_EXIT_CODE!
set MASTER_PUSH_SUCCESS=0
echo [DEBUG] 조건문 확인 시작...
if !PUSH_EXIT_CODE! NEQ 0 (
    echo [DEBUG] if 블록 진입 - 에러 발생
    echo [DEBUG] force-with-lease 푸시 실패
    echo.
    echo [WARNING] force-with-lease 실패
    echo [DEBUG] 일반 푸시 시도 시작...
    echo 일반 푸시를 시도합니다...
    git push -u origin !CURRENT_BRANCH! 2>&1
    set PUSH_EXIT_CODE=!ERRORLEVEL!
    echo [DEBUG] 일반 푸시 실행 완료 - 에러 레벨: !PUSH_EXIT_CODE!
    if !PUSH_EXIT_CODE! NEQ 0 (
        echo [DEBUG] 일반 푸시도 실패
        echo.
        echo [WARNING] 일반 푸시도 실패했습니다
        echo [주의] 원격 저장소의 기존 내용을 덮어쓰기 위해 force push가 필요합니다.
        echo.
        echo 계속하시겠습니까? (Y/N)
        set /p "FORCE_CONFIRM="
        if /i "!FORCE_CONFIRM!"=="Y" (
            echo.
            echo [DEBUG] force push 실행 시작...
            echo force push 실행 중...
            git push -u origin !CURRENT_BRANCH! --force 2>&1
            set PUSH_EXIT_CODE=!ERRORLEVEL!
            echo [DEBUG] force push 실행 완료 - 에러 레벨: !PUSH_EXIT_CODE!
            if !PUSH_EXIT_CODE! NEQ 0 (
                echo.
                echo [ERROR] 푸시 실패!
                echo.
                echo 문제 해결:
                echo 1. GitHub 인증 확인
                echo 2. 저장소 권한 확인
                echo 3. 브랜치 이름 확인: !CURRENT_BRANCH!
                echo 4. 네트워크 연결 확인
                echo.
                echo [DEBUG] 에러가 발생했지만 계속 진행합니다...
                pause
            ) else (
                set MASTER_PUSH_SUCCESS=1
                echo [OK] force push 성공!
                echo [DEBUG] force push 성공
            )
        ) else (
            echo.
            echo 푸시가 취소되었습니다.
            pause
            exit /b 1
        )
    ) else (
        set MASTER_PUSH_SUCCESS=1
        echo [OK] 일반 푸시 성공!
        echo [DEBUG] 일반 푸시 성공
    )
) else (
    echo [DEBUG] else 블록 진입 시작 - 성공
    set MASTER_PUSH_SUCCESS=1
    echo [OK] force-with-lease 푸시 성공!
    echo [DEBUG] force-with-lease 푸시 성공
    echo [DEBUG] else 블록 완료
)
echo [DEBUG] 조건문 완료 확인 - 여기까지 도달
echo [DEBUG] MASTER_PUSH_SUCCESS 값: !MASTER_PUSH_SUCCESS!
echo [DEBUG] master 브랜치 푸시 완료
echo [DEBUG] 브랜치 푸시 단계 완료
echo [DEBUG] 4-3 단계 완료 확인
echo.
echo [DEBUG] 4-3 단계 완료 - 다음 단계로 진행
echo [DEBUG] 4-4 단계로 이동 전 확인...
echo [DEBUG] 현재 브랜치 변수 값: "!CURRENT_BRANCH!"
echo [DEBUG] 4-4 단계 조건 확인 시작...
pause

REM master 브랜치인 경우 main 브랜치로도 푸시 (Netlify용)
echo [DEBUG] 4-4 단계: main 브랜치로 푸시 (Netlify용)...
echo [DEBUG] Netlify는 main 브랜치를 모니터링하므로 main 브랜치로도 푸시합니다.
echo.
echo [DEBUG] master 브랜치 조건 확인 중...
if /i "!CURRENT_BRANCH!"=="master" (
    echo [DEBUG] master 브랜치 조건 만족 - 4-4 단계 시작
    echo [DEBUG] master 브랜치 확인됨 - main 브랜치로 푸시 시작
    echo [DEBUG] 4-4 단계 시작 - master 브랜치 확인됨
    echo.
    echo [DEBUG] 단계 4-4: main 브랜치로 푸시 시작 (Netlify용)...
    echo main 브랜치로도 푸시 중 (Netlify용)...
    echo [DEBUG] 원격 저장소 확인 시작...
    git remote -v >nul 2>&1
    if errorlevel 1 (
        echo [WARNING] git remote -v 실행 실패
    ) else (
        git remote -v
        echo [DEBUG] 원격 저장소 확인 완료
    )
    echo.
    echo [DEBUG] git push origin master:main --force-with-lease 실행 중...
    echo [주의] 이 작업은 몇 초에서 몇 분이 걸릴 수 있습니다...
    git push origin master:main --force-with-lease 2>&1
    if errorlevel 1 (
        echo [WARNING] force-with-lease 실패
        echo [DEBUG] 일반 push 시도 시작...
        echo 일반 push 시도 중...
        git push origin master:main 2>&1
        if errorlevel 1 (
            echo [WARNING] 일반 push 실패
            echo [DEBUG] force push 시도 시작...
            echo force push 시도 중...
            git push origin master:main --force 2>&1
            if errorlevel 1 (
                echo.
                echo [ERROR] main 브랜치 푸시 실패!
                echo Netlify는 main 브랜치를 모니터링합니다.
                echo 수동으로 푸시해야 할 수 있습니다.
                echo 명령어: git push origin master:main --force
                echo.
                echo [DEBUG] 에러가 발생했지만 계속 진행합니다...
                pause
            ) else (
                echo [OK] main 브랜치 푸시 완료 (force)!
                echo [DEBUG] force push 성공
            )
        ) else (
            echo [OK] main 브랜치 푸시 완료!
            echo [DEBUG] 일반 push 성공
        )
    ) else (
        echo [OK] main 브랜치 푸시 완료!
        echo [DEBUG] force-with-lease push 성공
    )
    echo [DEBUG] main 브랜치 푸시 단계 완료
    echo.
    echo [DEBUG] 4-4 단계 완료
) else (
    echo [DEBUG] 현재 브랜치가 master가 아니므로 main 브랜치 푸시를 건너뜁니다.
    echo [DEBUG] 현재 브랜치: "!CURRENT_BRANCH!"
    echo.
)
echo [DEBUG] 4-4 단계 처리 완료
echo.

echo [DEBUG] 모든 단계 완료!
echo ========================================
echo [SUCCESS] 배포 준비 완료!
echo ========================================
echo.
echo GitHub 저장소 확인:
echo https://github.com/partner0010/freeshell/blob/main/package.json
echo https://github.com/partner0010/freeshell/blob/main/netlify.toml
echo.
echo Netlify 배포 확인:
echo ========================================
echo 1. Netlify 대시보드: https://app.netlify.com
echo 2. 저장소 연결 확인:
echo    - Site settings ^> Build ^& deploy ^> Continuous Deployment
echo    - Repository가 올바르게 연결되어 있는지 확인
echo    - Production branch가 "main"인지 확인
echo 3. 최근 빌드 확인:
echo    - Deploys 탭에서 최근 빌드 상태 확인
echo    - 자동 배포가 활성화되어 있는지 확인
echo 4. 수동 배포 트리거:
echo    - Deploys 탭에서 "Trigger deploy" 버튼 클릭
echo 5. 도메인: https://freeshell.co.kr
echo.
echo 참고: GitHub에 푸시되었지만 Netlify가 반응하지 않으면:
echo - Netlify 대시보드에서 저장소 연결 확인
echo - Production branch 설정 확인 (main 브랜치)
echo - "Trigger deploy" 버튼으로 수동 배포 시도
echo.
echo ========================================
echo.
echo [DEBUG] 배치 파일 종료 전 마지막 확인 지점입니다.
echo 아무 키나 누르면 종료됩니다...
pause
