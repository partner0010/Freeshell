@echo off
chcp 65001 >nul
echo ========================================
echo JSX 오류 수정사항 배포
echo ========================================
echo.

cd /d "%~dp0"

echo [1/4] Git 상태 확인...
git status
echo.

echo [2/4] 변경사항 추가...
git add .
echo.

echo [3/4] 커밋...
git commit -m "fix: 빌드 오류 수정

- WebsiteAuditor를 최소 버전으로 교체하여 JSX 오류 해결
- Sidebar와 SidebarPanelRenderer에서 WebsiteAuditor 임시 비활성화
- tailwind.config.js에 surface.border, shadow 클래스 추가
- AIWritingAssistant에 CardHeader, CardTitle, CardContent import 추가
- SidebarPanelRenderer에 누락된 컴포넌트 import 추가
- Badge 컴포넌트에 outline variant 추가
- optimizer.ts와 penetration-testing.ts에서 module 변수명 변경
- component-optimizer.ts를 .tsx로 변경하여 JSX 파싱 오류 해결
- 여러 파일에서 따옴표 이스케이프 오류 수정
- billing/page.tsx에서 planIcons 타입 오류 수정
- logs/page.tsx와 projects/page.tsx에서 icon 타입 오류 수정
- security/page.tsx에서 severity 타입 오류 수정
- SSOPanel.tsx에서 Input multiline prop 오류 수정 (textarea로 변경)
- BackupRecoveryPanel.tsx에서 duration 속성 오류 수정 (completedAt과 startedAt으로 계산)
- EnhancedCommandPalette.tsx에서 filteredCommands와 handleExecute 선언 순서 수정
- ComprehensiveDebugger.tsx에서 aiFixBug 반환값 타입 매핑 수정"
echo.

echo [4/4] 푸시...
git push origin main
echo.

echo ========================================
echo 완료! Vercel에서 자동으로 빌드가 시작됩니다.
echo ========================================
pause

