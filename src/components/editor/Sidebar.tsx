'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Blocks, Palette, Sparkles, FileText, Search, Download, Download as DownloadIcon, FolderOpen, Wand2,
  History, Zap, Accessibility, Code, Share2, Image, MoreHorizontal,
  Users, GitBranch, Bot, Globe, Split, LayoutGrid, ClipboardList,
  Type, Scroll, Trophy, ImagePlus, MousePointer2, Bell, Timer, QrCode, Layers,
  Mic, Variable, FileSignature, Code2, Shield, Map, Rocket,
  Scale, Gauge, Bug, Lock, AlertTriangle, Brain,
  Package, Eye, Target, TestTube, Activity, TrendingUp,
  Fingerprint, Contrast, LayoutDashboard, BarChart3, ShoppingBag, GitCompare,
  Presentation, MessageCircle, Puzzle, Network, Settings, Database, Book, Mail, MessageSquare,
  Clock, HardDrive, Folder, FileBarChart, Tags, ShieldAlert, Flag, Key, Monitor, CheckCircle, TestTube2,
  FileCode, Layout
} from 'lucide-react';
import { useEditorStore } from '@/store/editor-store';
import { BlockPalette } from './BlockPalette';
import { StylePanel } from './StylePanel';
import { AIAssistant } from './AIAssistant';
import { PagesList } from './PagesList';
import { SEOPanel } from './SEOPanel';
import { ExportPanel } from './ExportPanel';
import { ProjectManager } from './ProjectManager';
import { ThemeCustomizer } from './ThemeCustomizer';
import { AnimationPanel } from './AnimationPanel';
import { HistoryPanel } from './HistoryPanel';
import { PerformancePanel } from './PerformancePanel';
import { AccessibilityChecker } from './AccessibilityChecker';
import { CustomCSSPanel } from './CustomCSSPanel';
import { SharePanel } from './SharePanel';
import CollaborationPanel from './CollaborationPanel';
import VersionControlPanel from './VersionControlPanel';
import AICopilot from './AICopilot';
import FormBuilder from './FormBuilder';
import ABTestPanel from './ABTestPanel';
import LanguagePanel from './LanguagePanel';
import GridLayoutPanel from './GridLayoutPanel';
import ScrollAnimations from './ScrollAnimations';
import GradientGenerator from './GradientGenerator';
import TypographyPanel from './TypographyPanel';
import AIImageGenerator from './AIImageGenerator';
import GamificationPanel from './GamificationPanel';
import CursorEffects from './CursorEffects';
import SocialProofWidget from './SocialProofWidget';
import CountdownTimer from './CountdownTimer';
import QRCodeGenerator from './QRCodeGenerator';
import PopupBuilder from './PopupBuilder';
import MagicWand from './MagicWand';
import VoiceCommands from './VoiceCommands';
import DynamicContent from './DynamicContent';
import { ElectronicSignature } from './ElectronicSignature';
import { VoiceTranslation } from './VoiceTranslation';
import { AICodeValidator } from './AICodeValidator';
import { SignaturePanel } from './SignaturePanel';
import { AIDesignSuggestions } from './AIDesignSuggestions';
import { AIImprovementSuggestions } from './AIImprovementSuggestions';
import { AIFreeAPIValidator } from './AIFreeAPIValidator';
import { AIFutureFeatures } from './AIFutureFeatures';
import { LegalCompliancePanel } from '../legal/LegalCompliancePanel';
import { PerformanceOptimizer } from '../performance/PerformanceOptimizer';
import { SourceCodeAuditPanel } from '../security/SourceCodeAuditPanel';
import { ComprehensiveDebugger } from '../debugging/ComprehensiveDebugger';
import { WebsiteAuditor } from '../audit/WebsiteAuditor';
import { PipelinePanel } from '../cicd/PipelinePanel';
import { ZeroTrustPanel } from '../security/ZeroTrustPanel';
import { GDPRPanel } from '../compliance/GDPRPanel';
import { BackupRecoveryPanel } from '../backup/BackupRecoveryPanel';
import { APISecurityTester } from '../security/APISecurityTester';
import { IntrusionDetectionPanel } from '../security/IntrusionDetectionPanel';
import { SIEMPanel } from '../security/SIEMPanel';
import { AnomalyDetectionPanel } from '../ai/AnomalyDetectionPanel';
import { ContainerSecurityPanel } from '../security/ContainerSecurityPanel';
import { DLPPanel } from '../security/DLPPanel';
import { WAFPanel } from '../security/WAFPanel';
import { ThreatIntelligencePanel } from '../security/ThreatIntelligencePanel';
import { PenetrationTestPanel } from '../security/PenetrationTestPanel';
import { AutomatedTestingPanel } from '../testing/AutomatedTestingPanel';
import { RUMPanel } from '../monitoring/RUMPanel';
import { EfficiencyOptimizer } from '../efficiency/EfficiencyOptimizer';
import { AdvancedFeaturesPanel } from '../advanced/AdvancedFeaturesPanel';
import { SystemOptimizer } from '../system/SystemOptimizer';
import { FreeAPIIntegrationPanel } from '../ai/FreeAPIIntegrationPanel';
import { BehavioralSecurityPanel } from '../security/BehavioralSecurityPanel';
import { BiometricAuthPanel } from '../security/BiometricAuthPanel';
import { AdvancedFreeAPIPanel } from '../ai/AdvancedFreeAPIPanel';
import { MicroInteractionsPanel } from '../design/MicroInteractionsPanel';
import { AccessibilityPanel } from '../accessibility/AccessibilityPanel';
import { AdvancedPerformancePanel } from '../performance/AdvancedPerformancePanel';
import { CSPanel } from '../security/CSPanel';
import { AIWritingAssistant } from '../ai/AIWritingAssistant';
import { CustomizableDashboard } from '../dashboard/CustomizableDashboard';
import { UnifiedNotificationCenter } from '../notifications/UnifiedNotificationCenter';
import { AIRecommendationsPanel } from '../ai/AIRecommendationsPanel';
import { HighContrastPanel } from '../accessibility/HighContrastPanel';

export type SidebarTab = 
  | 'blocks' | 'styles' | 'ai' | 'pages' | 'theme' | 'seo' 
  | 'export' | 'project' | 'history' | 'performance' | 'accessibility' 
  | 'css' | 'share' | 'collab' | 'version' | 'copilot'
  | 'form' | 'abtest' | 'language' | 'grid'
  | 'scroll' | 'gradient' | 'typography' | 'aiimage' | 'achievements'
  | 'cursor' | 'socialproof' | 'countdown' | 'qrcode' | 'popup' | 'magic' | 'voice' | 'variables'
  | 'signature' | 'voice-translation' | 'code-validator' | 'security'
  | 'ai-design' | 'ai-improve' | 'ai-free-api' | 'ai-future'
  | 'legal' | 'performance' | 'code-audit' | 'debugging' | 'website-audit' | 'cicd'
  | 'zero-trust' | 'gdpr' | 'backup' | 'api-security' | 'ids' | 'siem' | 'anomaly'
  | 'container' | 'dlp' | 'waf' | 'threat-intel' | 'pentest' | 'auto-test' | 'rum'
  | 'efficiency' | 'advanced' | 'system' | 'free-api' | 'behavioral' | 'biometric'
  | 'advanced-ai' | 'micro-interactions' | 'accessibility' | 'performance-advanced' | 'security-csp'
  | 'ai-writing' | 'dashboard' | 'notifications' | 'recommendations' | 'high-contrast'
  | 'web-scraping' | 'pwa' | 'charts' | 'workflow' | 'template-marketplace' | 'code-review'
  | 'multimodal-ai' | 'version-compare' | 'global-search'
  | 'presentation' | 'wireframe' | 'analytics' | 'realtime-chat'
  | 'code-snippets' | 'plugins' | 'api-builder'
  | 'form-builder' | 'webhook-builder' | 'environment'
  | 'database-builder' | 'documentation'
  | 'email-builder' | 'playground' | 'ab-testing'
  | 'users' | 'deployment' | 'feedback' | 'activity-log'
  | 'scheduler' | 'backup' | 'import-export' | 'file-manager'
  | 'reports' | 'custom-fields' | 'sso' | 'rate-limiter' | 'moderation'
  | 'feature-flags' | 'secrets' | 'remote-support' | 'code-validator'
  | 'penetration-test-enhanced' | 'monitoring' | 'e2e-test';

const mainTabs = [
  { id: 'blocks' as const, icon: Blocks, label: '블록' },
  { id: 'styles' as const, icon: Palette, label: '스타일' },
  { id: 'copilot' as const, icon: Bot, label: 'AI' },
  { id: 'pages' as const, icon: FileText, label: '페이지' },
  { id: 'theme' as const, icon: Wand2, label: '테마' },
  { id: 'collab' as const, icon: Users, label: '협업' },
];

const toolTabs = [
  { id: 'magic' as const, icon: Wand2, label: '마법' },
  { id: 'voice' as const, icon: Mic, label: '음성' },
  { id: 'version' as const, icon: GitBranch, label: '버전' },
  { id: 'grid' as const, icon: LayoutGrid, label: '그리드' },
  { id: 'typography' as const, icon: Type, label: '타이포' },
  { id: 'gradient' as const, icon: Palette, label: '그라디언트' },
  { id: 'scroll' as const, icon: Scroll, label: '스크롤' },
  { id: 'cursor' as const, icon: MousePointer2, label: '커서' },
  { id: 'aiimage' as const, icon: ImagePlus, label: 'AI이미지' },
  { id: 'popup' as const, icon: Layers, label: '팝업' },
  { id: 'socialproof' as const, icon: Bell, label: '소셜' },
  { id: 'countdown' as const, icon: Timer, label: '타이머' },
  { id: 'qrcode' as const, icon: QrCode, label: 'QR' },
  { id: 'variables' as const, icon: Variable, label: '변수' },
  { id: 'form' as const, icon: ClipboardList, label: '폼' },
  { id: 'abtest' as const, icon: Split, label: 'A/B' },
  { id: 'language' as const, icon: Globe, label: '다국어' },
  { id: 'achievements' as const, icon: Trophy, label: '성취' },
  { id: 'history' as const, icon: History, label: '히스토리' },
  { id: 'seo' as const, icon: Search, label: 'SEO' },
  { id: 'performance' as const, icon: Zap, label: '성능' },
  { id: 'accessibility' as const, icon: Accessibility, label: '접근성' },
  { id: 'css' as const, icon: Code, label: 'CSS' },
  { id: 'export' as const, icon: Download, label: '내보내기' },
  { id: 'share' as const, icon: Share2, label: '공유' },
  { id: 'project' as const, icon: FolderOpen, label: '프로젝트' },
  { id: 'signature' as const, icon: FileSignature, label: '전자결재' },
  { id: 'voice-translation' as const, icon: Mic, label: '음성번역' },
  { id: 'code-validator' as const, icon: Code2, label: '코드검증' },
  { id: 'security' as const, icon: Shield, label: '보안' },
  { id: 'ai-design' as const, icon: Palette, label: 'AI디자인' },
  { id: 'ai-improve' as const, icon: Sparkles, label: 'AI개선' },
  { id: 'ai-free-api' as const, icon: Zap, label: 'AI검증' },
  { id: 'ai-future' as const, icon: Rocket, label: '미래기능' },
  { id: 'legal' as const, icon: Scale, label: '법적검토' },
  { id: 'performance' as const, icon: Gauge, label: '성능최적화' },
  { id: 'code-audit' as const, icon: Shield, label: '코드감사' },
  { id: 'debugging' as const, icon: Bug, label: '디버깅' },
  { id: 'website-audit' as const, icon: FileCode, label: '웹사이트감사' },
  { id: 'cicd' as const, icon: GitBranch, label: 'CI/CD' },
  { id: 'zero-trust' as const, icon: Lock, label: 'Zero Trust' },
  { id: 'gdpr' as const, icon: Shield, label: 'GDPR' },
  { id: 'backup' as const, icon: Download, label: '백업복구' },
  { id: 'api-security' as const, icon: FileCode, label: 'API보안' },
  { id: 'ids' as const, icon: AlertTriangle, label: '침입탐지' },
  { id: 'siem' as const, icon: Search, label: 'SIEM' },
  { id: 'anomaly' as const, icon: Brain, label: 'AI탐지' },
  { id: 'container' as const, icon: Package, label: '컨테이너보안' },
  { id: 'dlp' as const, icon: Eye, label: 'DLP' },
  { id: 'waf' as const, icon: Shield, label: 'WAF' },
  { id: 'threat-intel' as const, icon: Globe, label: '위협정보' },
  { id: 'pentest' as const, icon: Target, label: '침투테스트' },
  { id: 'auto-test' as const, icon: TestTube, label: '자동테스트' },
  { id: 'rum' as const, icon: Activity, label: '실시간모니터링' },
  { id: 'efficiency' as const, icon: Zap, label: '효율성최적화' },
  { id: 'advanced' as const, icon: Sparkles, label: '고급기능' },
  { id: 'system' as const, icon: TrendingUp, label: '시스템최적화' },
  { id: 'free-api' as const, icon: Sparkles, label: '무료AI통합' },
  { id: 'behavioral' as const, icon: Shield, label: '행동보안' },
  { id: 'biometric' as const, icon: Fingerprint, label: '생체인증' },
  { id: 'advanced-ai' as const, icon: Sparkles, label: '고급AIAPI' },
  { id: 'micro-interactions' as const, icon: Zap, label: '마이크로인터랙션' },
  { id: 'accessibility' as const, icon: Accessibility, label: '접근성강화' },
  { id: 'performance-advanced' as const, icon: TrendingUp, label: '성능최적화+' },
  { id: 'security-csp' as const, icon: Shield, label: 'CSP보안' },
  { id: 'ai-writing' as const, icon: FileText, label: 'AI글쓰기' },
  { id: 'dashboard' as const, icon: LayoutDashboard, label: '대시보드' },
  { id: 'notifications' as const, icon: Bell, label: '알림센터' },
  { id: 'recommendations' as const, icon: Sparkles, label: 'AI추천' },
  { id: 'high-contrast' as const, icon: Contrast, label: '고대비모드' },
  { id: 'web-scraping' as const, icon: Globe, label: '웹스크래핑' },
  { id: 'pwa' as const, icon: Download, label: 'PWA설정' },
  { id: 'charts' as const, icon: BarChart3, label: '차트빌더' },
  { id: 'workflow' as const, icon: GitBranch, label: '워크플로우' },
  { id: 'template-marketplace' as const, icon: ShoppingBag, label: '템플릿마켓' },
  { id: 'code-review' as const, icon: Code2, label: '코드리뷰' },
  { id: 'multimodal-ai' as const, icon: Sparkles, label: '멀티모달AI' },
  { id: 'version-compare' as const, icon: GitCompare, label: '버전비교' },
  { id: 'global-search' as const, icon: Search, label: '전체검색' },
  { id: 'presentation' as const, icon: Presentation, label: '프레젠테이션' },
  { id: 'wireframe' as const, icon: Layout, label: '와이어프레임' },
  { id: 'analytics' as const, icon: TrendingUp, label: '분석대시보드' },
  { id: 'realtime-chat' as const, icon: MessageCircle, label: '실시간채팅' },
  { id: 'code-snippets' as const, icon: Code2, label: '코드스니펫' },
  { id: 'plugins' as const, icon: Puzzle, label: '플러그인' },
  { id: 'api-builder' as const, icon: Network, label: 'API빌더' },
  { id: 'form-builder' as const, icon: FileText, label: '폼빌더' },
  { id: 'webhook-builder' as const, icon: Zap, label: '웹훅' },
  { id: 'environment' as const, icon: Settings, label: '환경변수' },
  { id: 'database-builder' as const, icon: Database, label: '데이터베이스' },
  { id: 'documentation' as const, icon: Book, label: '문서생성' },
  { id: 'email-builder' as const, icon: Mail, label: '이메일빌더' },
  { id: 'playground' as const, icon: Code, label: '플레이그라운드' },
  { id: 'ab-testing' as const, icon: TestTube, label: 'A/B테스트' },
  { id: 'users' as const, icon: Users, label: '사용자관리' },
  { id: 'deployment' as const, icon: Rocket, label: '배포관리' },
  { id: 'feedback' as const, icon: MessageSquare, label: '피드백' },
  { id: 'activity-log' as const, icon: FileText, label: '활동로그' },
  { id: 'scheduler' as const, icon: Clock, label: '작업스케줄러' },
  { id: 'backup' as const, icon: HardDrive, label: '백업복원' },
  { id: 'import-export' as const, icon: Download, label: '가져오기/내보내기' },
  { id: 'file-manager' as const, icon: Folder, label: '파일관리자' },
  { id: 'reports' as const, icon: FileBarChart, label: '보고서빌더' },
  { id: 'custom-fields' as const, icon: Tags, label: '커스텀필드' },
  { id: 'sso' as const, icon: Shield, label: 'SSO인증' },
  { id: 'rate-limiter' as const, icon: Gauge, label: 'Rate Limit' },
  { id: 'moderation' as const, icon: ShieldAlert, label: '콘텐츠모더레이션' },
  { id: 'feature-flags' as const, icon: Flag, label: 'Feature Flags' },
  { id: 'secrets' as const, icon: Key, label: 'Secrets관리' },
  { id: 'remote-support' as const, icon: Monitor, label: '원격지원' },
  { id: 'code-validator' as const, icon: CheckCircle, label: '코드검증' },
  { id: 'penetration-test-enhanced' as const, icon: Shield, label: '모의해킹' },
  { id: 'monitoring' as const, icon: Activity, label: '모니터링' },
  { id: 'e2e-test' as const, icon: TestTube2, label: 'E2E테스트' },
];

export function Sidebar() {
  const { sidebarTab, setSidebarTab } = useEditorStore();
  const [showMoreTools, setShowMoreTools] = useState(false);
  const [activeTab, setActiveTab] = useState<SidebarTab>('blocks');

  const handleTabChange = (tabId: SidebarTab) => {
    setActiveTab(tabId);
    // Zustand store의 타입에 맞게 처리
    if (['blocks', 'styles', 'ai', 'pages'].includes(tabId)) {
      setSidebarTab(tabId as 'blocks' | 'styles' | 'ai' | 'pages');
    }
  };

  const renderPanel = () => {
    switch (activeTab) {
      case 'blocks':
        return <BlockPalette />;
      case 'styles':
        return <StylePanel />;
      case 'ai':
        return <AIAssistant />;
      case 'copilot':
        return <AICopilot />;
      case 'pages':
        return <PagesList />;
      case 'theme':
        return <ThemeCustomizer />;
      case 'collab':
        return <CollaborationPanel />;
      case 'version':
        return <VersionControlPanel />;
      case 'grid':
        return <GridLayoutPanel />;
      case 'typography':
        return <TypographyPanel />;
      case 'gradient':
        return <GradientGenerator />;
      case 'scroll':
        return <ScrollAnimations />;
      case 'aiimage':
        return <AIImageGenerator />;
      case 'form':
        return <FormBuilder />;
      case 'abtest':
        return <ABTestPanel />;
      case 'language':
        return <LanguagePanel />;
      case 'achievements':
        return <GamificationPanel />;
      case 'cursor':
        return <CursorEffects />;
      case 'socialproof':
        return <SocialProofWidget />;
      case 'countdown':
        return <CountdownTimer />;
      case 'qrcode':
        return <QRCodeGenerator />;
      case 'popup':
        return <PopupBuilder />;
      case 'magic':
        return <MagicWand />;
      case 'voice':
        return <VoiceCommands />;
      case 'variables':
        return <DynamicContent />;
      case 'history':
        return <HistoryPanel />;
      case 'seo':
        return <SEOPanel />;
      case 'performance':
        return <PerformancePanel />;
      case 'accessibility':
        return <AccessibilityChecker />;
      case 'css':
        return <CustomCSSPanel />;
      case 'export':
        return <ExportPanel />;
      case 'share':
        return <SharePanel />;
      case 'project':
        return <ProjectManager />;
      case 'voice-translation':
        return (
          <div className="h-full p-4">
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white mb-4">
              <h3 className="text-xl font-bold mb-2">음성 번역 메모</h3>
              <p className="text-green-100 text-sm">
                음성을 인식하고 실시간으로 번역하여 메모로 저장
              </p>
            </div>
            <div className="space-y-3">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  💡 <strong>팁:</strong> 화면 우측 하단의 음성 번역 패널을 사용하세요.
                </p>
                <p className="text-xs text-blue-600 mt-2">
                  마우스나 터치패드로 메모 위치를 조절할 수 있고, 불투명도도 변경 가능합니다.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-700">지원 언어</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-white border rounded">🇰🇷 한국어</div>
                  <div className="p-2 bg-white border rounded">🇺🇸 영어</div>
                  <div className="p-2 bg-white border rounded">🇯🇵 일본어</div>
                  <div className="p-2 bg-white border rounded">🇨🇳 중국어</div>
                  <div className="p-2 bg-white border rounded">🇪🇸 스페인어</div>
                  <div className="p-2 bg-white border rounded">🇫🇷 프랑스어</div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'signature':
        return <SignaturePanel />;
      case 'code-validator':
        return <AICodeValidator />;
      case 'security':
        return (
          <div className="h-full p-4">
            <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl p-6 text-white mb-4">
              <h3 className="text-xl font-bold mb-2">소스 코드 보안</h3>
              <p className="text-primary-100 text-sm">
                코드 난독화, 암호화, 민감 정보 제거 등
              </p>
            </div>
            <div className="space-y-3">
              <button className="w-full p-4 bg-white border rounded-xl text-left hover:bg-gray-50">
                <h4 className="font-semibold text-gray-800 mb-1">코드 난독화</h4>
                <p className="text-sm text-gray-500">변수명 및 코드 구조 난독화</p>
              </button>
              <button className="w-full p-4 bg-white border rounded-xl text-left hover:bg-gray-50">
                <h4 className="font-semibold text-gray-800 mb-1">코드 암호화</h4>
                <p className="text-sm text-gray-500">AES-256-GCM 암호화</p>
              </button>
              <button className="w-full p-4 bg-white border rounded-xl text-left hover:bg-gray-50">
                <h4 className="font-semibold text-gray-800 mb-1">민감 정보 제거</h4>
                <p className="text-sm text-gray-500">API 키, 비밀번호 등 자동 제거</p>
              </button>
            </div>
          </div>
        );
      case 'ai-design':
        return <AIDesignSuggestions />;
      case 'ai-improve':
        return <AIImprovementSuggestions />;
      case 'ai-free-api':
        return <AIFreeAPIValidator />;
      case 'ai-future':
        return <AIFutureFeatures />;
      case 'legal':
        return <LegalCompliancePanel />;
      case 'performance':
        return <PerformanceOptimizer />;
      case 'code-audit':
        return <SourceCodeAuditPanel />;
      case 'debugging':
        return <ComprehensiveDebugger />;
      case 'website-audit':
        return <div>Website Auditor (Temporarily Disabled)</div>;
      case 'cicd':
        return <PipelinePanel />;
      case 'zero-trust':
        return <ZeroTrustPanel />;
      case 'gdpr':
        return <GDPRPanel />;
      case 'backup':
        return <BackupRecoveryPanel />;
      case 'api-security':
        return <APISecurityTester />;
      case 'ids':
        return <IntrusionDetectionPanel />;
      case 'siem':
        return <SIEMPanel />;
      case 'anomaly':
        return <AnomalyDetectionPanel />;
      case 'container':
        return <ContainerSecurityPanel />;
      case 'dlp':
        return <DLPPanel />;
      case 'waf':
        return <WAFPanel />;
      case 'threat-intel':
        return <ThreatIntelligencePanel />;
      case 'pentest':
        return <PenetrationTestPanel />;
      case 'auto-test':
        return <AutomatedTestingPanel />;
      case 'rum':
        return <RUMPanel />;
      case 'efficiency':
        return <EfficiencyOptimizer />;
      case 'advanced':
        return <AdvancedFeaturesPanel />;
      case 'system':
        return <SystemOptimizer />;
      case 'free-api':
        return <FreeAPIIntegrationPanel />;
      case 'behavioral':
        return <BehavioralSecurityPanel />;
      case 'biometric':
        return <BiometricAuthPanel />;
      case 'advanced-ai':
        return <AdvancedFreeAPIPanel />;
      case 'micro-interactions':
        return <MicroInteractionsPanel />;
      case 'accessibility':
        return <AccessibilityPanel />;
      case 'performance-advanced':
        return <AdvancedPerformancePanel />;
      case 'security-csp':
        return <CSPanel />;
      case 'ai-writing':
        return <AIWritingAssistant />;
      case 'dashboard':
        return <CustomizableDashboard />;
      case 'notifications':
        return <UnifiedNotificationCenter />;
      case 'recommendations':
        return <AIRecommendationsPanel />;
      case 'high-contrast':
        return <HighContrastPanel />;
      default:
        return <BlockPalette />;
    }
  };

  return (
    <div className="w-80 h-full bg-white/80 backdrop-blur-xl border-r flex">
      {/* 탭 네비게이션 */}
      <div className="w-16 py-4 flex flex-col items-center gap-1 border-r bg-surface-light overflow-y-auto">
        {/* 메인 탭 */}
        {mainTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <motion.button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`
                relative w-11 h-11 rounded-xl flex flex-col items-center justify-center gap-0.5
                transition-colors
                ${isActive 
                  ? 'bg-primary-100 text-primary-600' 
                  : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                }
              `}
            >
              <tab.icon size={18} />
              <span className="text-[9px] font-medium leading-none">{tab.label}</span>
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -right-px top-2 bottom-2 w-0.5 bg-primary-500 rounded-full"
                />
              )}
            </motion.button>
          );
        })}

        {/* 구분선 */}
        <div className="w-8 h-px bg-gray-200 my-2" />

        {/* 도구 탭 (토글) */}
        <motion.button
          onClick={() => setShowMoreTools(!showMoreTools)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`
            w-11 h-11 rounded-xl flex flex-col items-center justify-center gap-0.5
            transition-colors
            ${showMoreTools ? 'bg-gray-100 text-gray-700' : 'text-gray-400 hover:bg-gray-100'}
          `}
        >
          <MoreHorizontal size={18} />
          <span className="text-[9px] font-medium leading-none">도구</span>
        </motion.button>

        {/* 도구 탭 목록 */}
        {showMoreTools && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-col items-center gap-1 mt-1"
          >
            {toolTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`
                    relative w-11 h-11 rounded-xl flex flex-col items-center justify-center gap-0.5
                    transition-colors
                    ${isActive 
                      ? 'bg-primary-100 text-primary-600' 
                      : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                    }
                  `}
                >
                  <tab.icon size={16} />
                  <span className="text-[8px] font-medium leading-none">{tab.label}</span>
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* 패널 콘텐츠 */}
      <div className="flex-1 p-4 overflow-hidden">
        {renderPanel()}
      </div>
    </div>
  );
}
