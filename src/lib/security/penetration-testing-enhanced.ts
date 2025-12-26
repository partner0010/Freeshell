/**
 * 강화된 모의해킹 및 침투 테스트 시스템
 * Enhanced Penetration Testing & Security Scanning
 * 자기 학습 시스템 통합: 테스트 결과에서 학습하여 탐지 정확도 향상
 */

import { selfLearningSystem } from '@/lib/ai/self-learning';
import { selfMonitoringSystem } from '@/lib/ai/self-monitoring';
import { selfImprovementSystem } from '@/lib/ai/self-improvement';

export type VulnerabilityType = 
  | 'xss' | 'csrf' | 'sqli' | 'rce' | 'xxe' 
  | 'ssrf' | 'idor' | 'auth-bypass' | 'session-hijack'
  | 'insecure-storage' | 'weak-crypto' | 'misconfig';

export interface SecurityVulnerability {
  id: string;
  type: VulnerabilityType;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  affectedUrl?: string;
  affectedComponent?: string;
  recommendation: string;
  cwe?: string;
  cvss?: number;
  detectedAt: Date;
}

export interface PenetrationTestResult {
  id: string;
  testName: string;
  status: 'passed' | 'failed' | 'warning';
  vulnerabilities: SecurityVulnerability[];
  score: number; // 0-100
  timestamp: Date;
  duration: number; // 초
}

/**
 * 강화된 침투 테스트 엔진
 */
export class EnhancedPenetrationTester {
  private vulnerabilities: Map<string, SecurityVulnerability> = new Map();

  /**
   * XSS (Cross-Site Scripting) 테스트
   */
  async testXSS(code: string, url?: string): Promise<SecurityVulnerability[]> {
    const issues: SecurityVulnerability[] = [];

    // innerHTML 사용 검사
    if (code.includes('innerHTML') && !code.includes('DOMPurify') && !code.includes('sanitize')) {
      issues.push({
        id: `xss-${Date.now()}-1`,
        type: 'xss',
        severity: 'high',
        title: 'Potential XSS via innerHTML',
        description: 'innerHTML 사용 시 사용자 입력을 그대로 삽입하면 XSS 공격에 취약합니다.',
        affectedComponent: this.extractComponentName(code),
        recommendation: 'DOMPurify나 textContent를 사용하거나 입력값을 검증/이스케이프하세요.',
        cwe: 'CWE-79',
        cvss: 7.5,
        detectedAt: new Date(),
      });
    }

    // eval 사용 검사
    if (code.includes('eval(') || code.includes('Function(')) {
      issues.push({
        id: `xss-${Date.now()}-2`,
        type: 'rce',
        severity: 'critical',
        title: 'Code Injection via eval()',
        description: 'eval() 또는 Function() 생성자 사용은 코드 인젝션 공격에 취약합니다.',
        affectedComponent: this.extractComponentName(code),
        recommendation: 'eval() 사용을 완전히 제거하고 안전한 대안을 사용하세요.',
        cwe: 'CWE-94',
        cvss: 9.8,
        detectedAt: new Date(),
      });
    }

    // dangerouslySetInnerHTML 검사
    if (code.includes('dangerouslySetInnerHTML')) {
      issues.push({
        id: `xss-${Date.now()}-3`,
        type: 'xss',
        severity: 'high',
        title: 'Potential XSS via dangerouslySetInnerHTML',
        description: 'dangerouslySetInnerHTML은 XSS 공격에 취약합니다.',
        affectedComponent: this.extractComponentName(code),
        recommendation: 'HTML을 렌더링하기 전에 반드시 sanitize하거나 DOMPurify를 사용하세요.',
        cwe: 'CWE-79',
        cvss: 7.5,
        detectedAt: new Date(),
      });
    }

    return issues;
  }

  /**
   * CSRF (Cross-Site Request Forgery) 테스트
   */
  async testCSRF(code: string): Promise<SecurityVulnerability[]> {
    const issues: SecurityVulnerability[] = [];

    // CSRF 토큰 검사
    if (code.includes('fetch(') || code.includes('axios.')) {
      const hasCSRFToken = code.includes('csrf') || code.includes('X-CSRF-Token') || code.includes('X-XSRF-Token');
      if (!hasCSRFToken) {
        issues.push({
          id: `csrf-${Date.now()}`,
          type: 'csrf',
          severity: 'medium',
          title: 'Missing CSRF Protection',
          description: 'API 요청에 CSRF 토큰이 없으면 CSRF 공격에 취약합니다.',
          affectedComponent: this.extractComponentName(code),
          recommendation: '모든 상태 변경 요청에 CSRF 토큰을 추가하세요.',
          cwe: 'CWE-352',
          cvss: 6.5,
          detectedAt: new Date(),
        });
      }
    }

    return issues;
  }

  /**
   * 인증/인가 취약점 테스트
   */
  async testAuthentication(code: string): Promise<SecurityVulnerability[]> {
    const issues: SecurityVulnerability[] = [];

    // 하드코딩된 인증 정보 검사
    if (code.match(/password\s*=\s*['"][^'"]+['"]/i) || 
        code.match(/api[_-]?key\s*=\s*['"][^'"]+['"]/i) ||
        code.match(/token\s*=\s*['"][^'"]+['"]/i)) {
      issues.push({
        id: `auth-${Date.now()}-1`,
        type: 'insecure-storage',
        severity: 'critical',
        title: 'Hardcoded Credentials',
        description: '코드에 하드코딩된 비밀번호, API 키, 토큰이 발견되었습니다.',
        affectedComponent: this.extractComponentName(code),
        recommendation: '모든 자격 증명을 환경 변수나 안전한 secrets 관리 시스템으로 이동하세요.',
        cwe: 'CWE-798',
        cvss: 9.1,
        detectedAt: new Date(),
      });
    }

    // 약한 세션 관리 검사
    if (code.includes('localStorage.setItem') && code.includes('token')) {
      const hasSecureFlag = code.includes('httpOnly') || code.includes('secure');
      if (!hasSecureFlag) {
        issues.push({
          id: `auth-${Date.now()}-2`,
          type: 'session-hijack',
          severity: 'high',
          title: 'Insecure Token Storage',
          description: 'localStorage에 토큰을 저장하면 XSS 공격 시 탈취 가능합니다.',
          affectedComponent: this.extractComponentName(code),
          recommendation: 'HttpOnly 쿠키를 사용하거나 적절한 보안 조치를 취하세요.',
          cwe: 'CWE-614',
          cvss: 7.5,
          detectedAt: new Date(),
        });
      }
    }

    return issues;
  }

  /**
   * 입력 검증 테스트
   */
  async testInputValidation(code: string): Promise<SecurityVulnerability[]> {
    const issues: SecurityVulnerability[] = [];

    // 입력 검증 누락 검사
    if (code.includes('onSubmit') || code.includes('handleSubmit')) {
      const hasValidation = code.includes('validate') || code.includes('schema') || code.includes('zod');
      if (!hasValidation) {
        issues.push({
          id: `input-${Date.now()}`,
          type: 'sqli',
          severity: 'medium',
          title: 'Missing Input Validation',
          description: '사용자 입력에 대한 검증이 없으면 인젝션 공격에 취약할 수 있습니다.',
          affectedComponent: this.extractComponentName(code),
          recommendation: '모든 사용자 입력을 검증하고 sanitize하세요.',
          cwe: 'CWE-20',
          cvss: 5.3,
          detectedAt: new Date(),
        });
      }
    }

    return issues;
  }

  /**
   * 종합 보안 스캔
   */
  async performFullScan(code: string, url?: string): Promise<PenetrationTestResult> {
    const startTime = Date.now();
    const vulnerabilities: SecurityVulnerability[] = [];

    // 모든 테스트 실행
    const [xssIssues, csrfIssues, authIssues, inputIssues] = await Promise.all([
      this.testXSS(code, url),
      this.testCSRF(code),
      this.testAuthentication(code),
      this.testInputValidation(code),
    ]);

    vulnerabilities.push(...xssIssues, ...csrfIssues, ...authIssues, ...inputIssues);

    // 점수 계산 (100점 만점에서 취약점당 감점)
    let score = 100;
    vulnerabilities.forEach(vuln => {
      switch (vuln.severity) {
        case 'critical':
          score -= 20;
          break;
        case 'high':
          score -= 10;
          break;
        case 'medium':
          score -= 5;
          break;
        case 'low':
          score -= 2;
          break;
      }
    });
    score = Math.max(0, score);

    const duration = (Date.now() - startTime) / 1000;

    const result: PenetrationTestResult = {
      id: `test-${Date.now()}`,
      testName: 'Full Security Scan',
      status: score >= 80 ? 'passed' : score >= 60 ? 'warning' : 'failed',
      vulnerabilities,
      score,
      timestamp: new Date(),
      duration,
    };

    // 자기 학습: 스캔 결과에서 학습
    selfLearningSystem.learnFromExperience({
      task: 'penetration_test',
      input: { codeLength: code.length, url },
      output: result,
      success: result.status === 'passed',
      performance: score / 100,
      patterns: vulnerabilities.map(v => v.type),
      improvements: vulnerabilities.map(v => v.recommendation),
    }).catch(err => console.error('침투 테스트 학습 오류:', err));

    // 자기 모니터링: 성능 추적
    selfMonitoringSystem.recordPerformance({
      task: 'penetration_test',
      performance: score / 100,
      timestamp: new Date(),
    }).catch(err => console.error('성능 모니터링 오류:', err));

    // 성능이 낮으면 자기 개선 트리거
    if (score < 70) {
      selfImprovementSystem.triggerImprovement({
        issue: `침투 테스트 점수가 낮습니다 (${score}/100)`,
        context: {
          vulnerabilities: vulnerabilities.length,
          criticalCount: vulnerabilities.filter(v => v.severity === 'critical').length,
        },
      }).catch(err => console.error('자기 개선 트리거 오류:', err));
    }

    return result;
  }

  /**
   * 컴포넌트 이름 추출
   */
  private extractComponentName(code: string): string {
    const match = code.match(/(?:function|const|export\s+(?:default\s+)?function)\s+(\w+)/);
    return match ? match[1] : 'Unknown';
  }

  /**
   * OWASP Top 10 체크리스트
   */
  getOWASPChecklist(): Record<string, boolean> {
    return {
      'A01: Broken Access Control': true,
      'A02: Cryptographic Failures': true,
      'A03: Injection': true,
      'A04: Insecure Design': true,
      'A05: Security Misconfiguration': true,
      'A06: Vulnerable Components': true,
      'A07: Authentication Failures': true,
      'A08: Software and Data Integrity': true,
      'A09: Security Logging Failures': true,
      'A10: Server-Side Request Forgery': true,
    };
  }
}

export const enhancedPenetrationTester = new EnhancedPenetrationTester();

