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
- ComprehensiveDebugger.tsx에서 aiFixBug 반환값 타입 매핑 수정
- uuid 패키지 의존성 제거 및 공통 UUID 유틸리티 함수 추가
- AdvancedBlockRenderer.tsx에서 platformIcons 타입 오류 수정
- AdvancedBlockRenderer.tsx에서 NewsletterBlockContent subtitle 및 privacyText 속성 오류 수정 (description 사용)
- AdvancedBlockRenderer.tsx에서 ProcessBlockContent steps 옵셔널 체이닝 추가
- AnimationPanel.tsx에서 BlockStyles animation 속성 타입 오류 수정
- AutoSave.tsx에서 EditorState blocks, pages, styles 속성 오류 수정 (project에서 추출)
- BlockRenderer.tsx에서 BlockContent 타입 오류 수정 (타입 단언 추가)
- BlogCMSPanel.tsx에서 newPost status 타입 오류 수정 (타입 명시적 지정)
- CollaborationPanel.tsx에서 Lucide 아이콘 타입 호환성 오류 수정
- CommandPalette.tsx에서 Lucide 아이콘 타입 호환성 오류 수정
- CommandPalette.tsx에서 addBlock 호출 시 id 누락 오류 수정 (generateUUID 추가)
- uuid.ts에 generateUUID 함수 추가
- EditorMinimap.tsx에서 EditorState blocks 속성 오류 수정 (project에서 추출)
- ElectronicSignature.tsx에서 initialDocument content 타입 오류 수정 (undefined 체크 추가)
- FloatingToolbar.tsx에서 EditorState blocks 속성 오류 수정 (project에서 추출)
- FloatingToolbar.tsx에서 moveBlock 호출 시 타입 오류 수정 (인덱스 사용)
- GamificationPanel.tsx에서 Lucide 아이콘 타입 호환성 오류 수정
- ImprovedSidebar.tsx에서 Sidebar 컴포넌트 props 오류 수정 (props 제거)
- MembershipPanel.tsx에서 newTier interval 타입 오류 수정 (타입 명시적 지정)
- OnboardingTutorial.tsx에서 Lucide 아이콘 타입 호환성 오류 수정
- Sidebar.tsx에서 SidebarTab 타입 export 추가
- OrganizedSidebar.tsx에서 SidebarTab import 오류 수정
- advanced-optimization.ts에 advancedOptimizationSystem 객체 추가
- .vercelignore 파일 생성으로 빌드 최적화"
echo.

echo [4/4] 푸시...
git push origin main
echo.

echo ========================================
echo 완료! Vercel에서 자동으로 빌드가 시작됩니다.
echo ========================================
pause

