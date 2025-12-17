/**
 * 종합 로깅 및 감사 추적 시스템
 * Comprehensive Logging and Audit Trail
 */

export interface AuditLog {
  id: string;
  timestamp: number;
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  type: 'create' | 'read' | 'update' | 'delete' | 'access' | 'security';
  severity: 'info' | 'warning' | 'error' | 'critical';
  ip?: string;
  userAgent?: string;
  details: Record<string, any>;
  result: 'success' | 'failure' | 'partial';
}

export interface AuditTrail {
  resourceId: string;
  resourceType: string;
  logs: AuditLog[];
  timeline: TimelineEvent[];
}

export interface TimelineEvent {
  timestamp: number;
  action: string;
  user?: string;
  changes?: Record<string, { before: unknown; after: unknown }>;
}

export interface ComplianceReport {
  standard: 'GDPR' | 'HIPAA' | 'SOX' | 'ISO27001' | 'PCI-DSS';
  compliance: number; // 0-100
  issues: ComplianceIssue[];
  recommendations: string[];
}

export interface ComplianceIssue {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  requirement: string;
  remediation: string;
}

// 종합 로깅 시스템
export class ComprehensiveAuditSystem {
  private logs: Map<string, AuditLog> = new Map();
  private trails: Map<string, AuditTrail> = new Map();

  // 로그 기록
  log(log: Omit<AuditLog, 'id' | 'timestamp'>): AuditLog {
    const fullLog: AuditLog = {
      ...log,
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };

    this.logs.set(fullLog.id, fullLog);

    // 감사 추적 업데이트
    if (log.resourceId) {
      this.updateAuditTrail(log.resourceId, log.resource, fullLog);
    }

    return fullLog;
  }

  // 감사 추적 업데이트
  private updateAuditTrail(resourceId: string, resourceType: string, log: AuditLog): void {
    const key = `${resourceType}:${resourceId}`;
    const trail = this.trails.get(key) || {
      resourceId,
      resourceType,
      logs: [],
      timeline: [],
    };

    trail.logs.push(log);
    trail.timeline.push({
      timestamp: log.timestamp,
      action: log.action,
      user: log.userId,
      changes: log.details.changes,
    });

    this.trails.set(key, trail);
  }

  // 감사 추적 조회
  getAuditTrail(resourceId: string, resourceType: string): AuditTrail | null {
    const key = `${resourceType}:${resourceId}`;
    return this.trails.get(key) || null;
  }

  // 로그 검색
  searchLogs(query: {
    userId?: string;
    action?: string;
    resource?: string;
    type?: AuditLog['type'];
    severity?: AuditLog['severity'];
    startTime?: number;
    endTime?: number;
  }): AuditLog[] {
    let logs = Array.from(this.logs.values());

    if (query.userId) {
      logs = logs.filter((l) => l.userId === query.userId);
    }
    if (typeof query.action === 'string') {
      logs = logs.filter((l) => l.action?.includes(query.action as string));
    }
    if (query.resource) {
      logs = logs.filter((l) => l.resource === query.resource);
    }
    if (query.type) {
      logs = logs.filter((l) => l.type === query.type);
    }
    if (query.severity) {
      logs = logs.filter((l) => l.severity === query.severity);
    }
    if (query.startTime) {
      logs = logs.filter((l) => l.timestamp >= query.startTime!);
    }
    if (query.endTime) {
      logs = logs.filter((l) => l.timestamp <= query.endTime!);
    }

    return logs.sort((a, b) => b.timestamp - a.timestamp);
  }

  // 컴플라이언스 검사
  checkCompliance(standard: ComplianceReport['standard']): ComplianceReport {
    const logs = Array.from(this.logs.values());
    const issues: ComplianceIssue[] = [];
    let compliance = 100;

    switch (standard) {
      case 'GDPR':
        // GDPR 요구사항 검사
        const hasDataAccessLogs = logs.some((l) => l.type === 'read' && l.resource === 'user-data');
        if (!hasDataAccessLogs) {
          issues.push({
            id: 'gdpr-1',
            severity: 'high',
            description: '데이터 접근 로그가 없습니다',
            requirement: 'GDPR Article 15: 데이터 주체의 접근 권리',
            remediation: '모든 데이터 접근을 로깅하세요',
          });
          compliance -= 20;
        }
        break;

      case 'ISO27001':
        // ISO 27001 요구사항 검사
        const hasSecurityLogs = logs.some((l) => l.type === 'security');
        if (!hasSecurityLogs) {
          issues.push({
            id: 'iso-1',
            severity: 'critical',
            description: '보안 이벤트 로깅이 없습니다',
            requirement: 'ISO 27001 A.12.4.1: 이벤트 로깅',
            remediation: '모든 보안 이벤트를 로깅하세요',
          });
          compliance -= 30;
        }
        break;
    }

    const recommendations: string[] = [];
    if (compliance < 100) {
      recommendations.push('로깅 범위를 확대하세요');
      recommendations.push('로그 보관 기간을 연장하세요');
      recommendations.push('자동 컴플라이언스 검사를 설정하세요');
    }

    return {
      standard,
      compliance: Math.max(0, compliance),
      issues,
      recommendations,
    };
  }

  // 로그 통계
  getStats(): {
    total: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
    recent: number;
  } {
    const logs = Array.from(this.logs.values());
    const now = Date.now();
    const dayAgo = now - 24 * 60 * 60 * 1000;

    return {
      total: logs.length,
      byType: logs.reduce((acc, log) => {
        acc[log.type] = (acc[log.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      bySeverity: logs.reduce((acc, log) => {
        acc[log.severity] = (acc[log.severity] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      recent: logs.filter((l) => l.timestamp >= dayAgo).length,
    };
  }
}

export const comprehensiveAuditSystem = new ComprehensiveAuditSystem();

