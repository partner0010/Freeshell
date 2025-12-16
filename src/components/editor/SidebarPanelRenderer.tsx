/**
 * Sidebar 패널 렌더러
 * 공유 가능한 패널 렌더링 로직
 */

import React from 'react';
import type { SidebarTab } from './Sidebar';
import { BlockPalette } from './BlockPalette';
import { StylePanel } from './StylePanel';
import { AIAssistant } from './AIAssistant';
import { PagesList } from './PagesList';
import { ThemeCustomizer } from './ThemeCustomizer';
import { SEOPanel } from './SEOPanel';
import { ExportPanel } from './ExportPanel';
import { HistoryPanel } from './HistoryPanel';
import { PerformancePanel } from './PerformancePanel';
import { AccessibilityChecker } from './AccessibilityChecker';
import { CustomCSSPanel } from './CustomCSSPanel';
import { SharePanel } from './SharePanel';
import { ProjectManager } from './ProjectManager';
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
import { SignaturePanel } from './SignaturePanel';
import { AICodeValidator } from './AICodeValidator';
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
import { WebScrapingPanel } from '../scraping/WebScrapingPanel';
import { PWAPanel } from '../pwa/PWAPanel';
import { ChartBuilderPanel } from '../charts/ChartBuilderPanel';
import { WorkflowBuilderPanel } from '../workflow/WorkflowBuilderPanel';
import { TemplateMarketplacePanel } from '../templates/TemplateMarketplacePanel';
import { CodeReviewPanel } from '../code-review/CodeReviewPanel';
import { MultimodalAIPanel } from '../multimodal/MultimodalAIPanel';
import { FeedbackPanel } from '../feedback/FeedbackPanel';
import { ActivityLogPanel } from '../audit/ActivityLogPanel';
import { TaskSchedulerPanel } from '../scheduler/TaskSchedulerPanel';
import { BackupRestorePanel } from '../backup/BackupRestorePanel';
import { ImportExportPanel } from '../import-export/ImportExportPanel';
import { FileManagerPanel } from '../files/FileManagerPanel';
import { ReportBuilderPanel } from '../reporting/ReportBuilderPanel';
import { CustomFieldsPanel } from '../metadata/CustomFieldsPanel';
import { SSOPanel } from '../auth/SSOPanel';
import { RateLimiterPanel } from '../api/RateLimiterPanel';
import { ModerationPanel } from '../content/ModerationPanel';
import { VersionComparisonPanel } from '../version/VersionComparisonPanel';
import { GlobalSearchPanel } from '../search/GlobalSearchPanel';
import { PresentationBuilderPanel } from '../presentation/PresentationBuilderPanel';
import { WireframeBuilderPanel } from '../wireframe/WireframeBuilderPanel';
import { AnalyticsDashboardPanel } from '../analytics/AnalyticsDashboardPanel';
import { RealtimeChatPanel } from '../chat/RealtimeChatPanel';
import { CodeSnippetsPanel } from '../snippets/CodeSnippetsPanel';
import { PluginManagerPanel } from '../plugins/PluginManagerPanel';
import { APIBuilderPanel } from '../api/APIBuilderPanel';
import { FormBuilderPanel } from '../forms/FormBuilderPanel';
import { WebhookBuilderPanel } from '../webhooks/WebhookBuilderPanel';
import { EnvironmentManagerPanel } from '../config/EnvironmentManagerPanel';
import { DatabaseBuilderPanel } from '../database/DatabaseBuilderPanel';
import { DocumentationGeneratorPanel } from '../docs/DocumentationGeneratorPanel';
import { EmailBuilderPanel } from '../email/EmailBuilderPanel';
import { CodePlaygroundPanel } from '../playground/CodePlaygroundPanel';
import { ABTestingPanel } from '../ab-testing/ABTestingPanel';
import { UserManagementPanel } from '../users/UserManagementPanel';
import { DeploymentManagerPanel } from '../deployment/DeploymentManagerPanel';
import { FeatureFlagsPanel } from '../features/FeatureFlagsPanel';
import { SecretsManagerPanel } from '../secrets/SecretsManagerPanel';
import { RemoteSupportPanel } from '../remote/RemoteSupportPanel';
import { CodeValidatorPanel } from '../testing/CodeValidatorPanel';
import { EnhancedPenetrationTestPanel } from '../security/EnhancedPenetrationTestPanel';
import { MonitoringDashboard } from '../monitoring/MonitoringDashboard';
import { E2ETestPanel } from '../testing/E2ETestPanel';

export function renderSidebarPanel(activeTab: SidebarTab): React.ReactNode {
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
    case 'signature':
      return <SignaturePanel />;
    case 'voice-translation':
      return (
        <div className="h-full p-4">
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white mb-4">
            <h3 className="text-xl font-bold mb-2">음성 번역 메모</h3>
            <p className="text-green-100 text-sm">
              음성을 인식하고 실시간으로 번역하여 메모로 저장
            </p>
          </div>
        </div>
      );
    case 'code-validator':
      return <AICodeValidator />;
    case 'security':
      return <SourceCodeAuditPanel />;
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
    case 'performance-advanced':
      return <AdvancedPerformancePanel />;
    case 'security-csp':
      return <CSPanel />;
    case 'ai-writing':
      return <AIWritingAssistant />;
    case 'dashboard':
      return <CustomizableDashboard />;
    case 'notifications':
      return (
        <div className="h-full p-4">
          <UnifiedNotificationCenter />
        </div>
      );
    case 'recommendations':
      return <AIRecommendationsPanel />;
    case 'high-contrast':
      return <HighContrastPanel />;
    case 'web-scraping':
      return <WebScrapingPanel />;
    case 'pwa':
      return <PWAPanel />;
    case 'charts':
      return <ChartBuilderPanel />;
    case 'workflow':
      return <WorkflowBuilderPanel />;
    case 'template-marketplace':
      return <TemplateMarketplacePanel />;
    case 'code-review':
      return <CodeReviewPanel />;
    case 'multimodal-ai':
      return <MultimodalAIPanel />;
    case 'version-compare':
      return <VersionComparisonPanel />;
    case 'global-search':
      return <GlobalSearchPanel />;
    case 'presentation':
      return <PresentationBuilderPanel />;
    case 'wireframe':
      return <WireframeBuilderPanel />;
    case 'analytics':
      return <AnalyticsDashboardPanel />;
    case 'realtime-chat':
      return <RealtimeChatPanel />;
    case 'code-snippets':
      return <CodeSnippetsPanel />;
    case 'plugins':
      return <PluginManagerPanel />;
    case 'api-builder':
      return <APIBuilderPanel />;
    case 'form-builder':
      return <FormBuilderPanel />;
    case 'webhook-builder':
      return <WebhookBuilderPanel />;
    case 'environment':
      return <EnvironmentManagerPanel />;
    case 'database-builder':
      return <DatabaseBuilderPanel />;
    case 'documentation':
      return <DocumentationGeneratorPanel />;
    case 'email-builder':
      return <EmailBuilderPanel />;
    case 'playground':
      return <CodePlaygroundPanel />;
    case 'ab-testing':
      return <ABTestingPanel />;
    case 'users':
      return <UserManagementPanel />;
    case 'deployment':
      return <DeploymentManagerPanel />;
    case 'feedback':
      return <FeedbackPanel />;
    case 'activity-log':
      return <ActivityLogPanel />;
    case 'scheduler':
      return <TaskSchedulerPanel />;
    case 'backup':
      return <BackupRestorePanel />;
    case 'import-export':
      return <ImportExportPanel />;
    case 'file-manager':
      return <FileManagerPanel />;
    case 'reports':
      return <ReportBuilderPanel />;
    case 'custom-fields':
      return <CustomFieldsPanel />;
    case 'sso':
      return <SSOPanel />;
    case 'rate-limiter':
      return <RateLimiterPanel />;
    case 'moderation':
      return <ModerationPanel />;
    case 'feature-flags':
      return <FeatureFlagsPanel />;
    case 'secrets':
      return <SecretsManagerPanel />;
    case 'remote-support':
      return <RemoteSupportPanel />;
    case 'code-validator':
      return <CodeValidatorPanel />;
    case 'penetration-test-enhanced':
      return <EnhancedPenetrationTestPanel />;
    case 'monitoring':
      return <MonitoringDashboard />;
    case 'e2e-test':
      return <E2ETestPanel />;
    default:
      return <BlockPalette />;
  }
}

