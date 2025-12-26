/**
 * AI Security Guard - AI 기반 실시간 보안 보호 시스템
 * 
 * 기능:
 * - 실시간 위협 감지 및 자동 차단
 * - 정보보호, 해킹, 바이러스, 취약점 공격 방어
 * - 관리자 대시보드 로그 표시
 * - 데이터 유출 감지 및 보고
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface ThreatDetection {
  id: string;
  timestamp: Date;
  type: ThreatType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  target: string;
  description: string;
  action: 'blocked' | 'monitored' | 'allowed';
  metadata: Record<string, any>;
}

export type ThreatType =
  | 'sql_injection'
  | 'xss'
  | 'csrf'
  | 'ddos'
  | 'brute_force'
  | 'malware'
  | 'phishing'
  | 'data_exfiltration'
  | 'unauthorized_access'
  | 'vulnerability_scan'
  | 'suspicious_behavior'
  | 'api_abuse'
  | 'file_upload_attack'
  | 'command_injection'
  | 'path_traversal'
  | 'xxe'
  | 'ssrf'
  | 'insecure_deserialization';

export interface SecurityLog {
  id: string;
  timestamp: Date;
  userId?: string;
  ipAddress: string;
  userAgent: string;
  endpoint: string;
  method: string;
  threatType?: ThreatType;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  action: 'blocked' | 'monitored' | 'allowed';
  details: Record<string, any>;
  dataAccessed?: string[];
  dataLeaked?: string[];
}

export interface DataBreachReport {
  id: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  cause: string;
  affectedData: string[];
  affectedUsers: number;
  detectionMethod: string;
  status: 'investigating' | 'contained' | 'resolved';
  remediation: string[];
  logs: SecurityLog[];
}

export class AISecurityGuard {
  private threatPatterns: Map<ThreatType, RegExp[]>;
  private blockedIPs: Set<string>;
  private suspiciousIPs: Map<string, number>;
  private rateLimits: Map<string, { count: number; resetAt: Date }>;
  private dataAccessLogs: SecurityLog[];

  constructor() {
    this.threatPatterns = this.initializeThreatPatterns();
    this.blockedIPs = new Set();
    this.suspiciousIPs = new Map();
    this.rateLimits = new Map();
    this.dataAccessLogs = [];
  }

  /**
   * 위협 패턴 초기화
   */
  private initializeThreatPatterns(): Map<ThreatType, RegExp[]> {
    const patterns = new Map<ThreatType, RegExp[]>();

    // SQL Injection 패턴
    patterns.set('sql_injection', [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|SCRIPT)\b)/i,
      /('|(\\')|(;)|(--)|(\/\*)|(\*\/)|(\+)|(\%)|(\=))/i,
      /(\bOR\b.*=.*)|(\bAND\b.*=.*)/i,
      /(\bUNION\b.*\bSELECT\b)/i,
    ]);

    // XSS 패턴
    patterns.set('xss', [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/i,
      /on\w+\s*=/i,
      /<iframe[^>]*>/gi,
      /<img[^>]*onerror/i,
      /<svg[^>]*onload/i,
      /eval\s*\(/i,
      /expression\s*\(/i,
    ]);

    // Command Injection 패턴
    patterns.set('command_injection', [
      /[;&|`$(){}[\]]/,
      /\b(cat|ls|pwd|whoami|id|uname|wget|curl|nc|netcat|bash|sh|cmd|powershell)\b/i,
      /\.\.\//,
      /\.\.\\/,
    ]);

    // Path Traversal 패턴
    patterns.set('path_traversal', [
      /\.\.\//g,
      /\.\.\\/g,
      /\/\.\.\//g,
      /\\\.\.\\/g,
      /\.\.%2F/i,
      /\.\.%5C/i,
    ]);

    // XXE 패턴
    patterns.set('xxe', [
      /<!ENTITY/i,
      /SYSTEM\s+["'](file|http|ftp|php|expect):/i,
      /<!DOCTYPE.*\[/i,
    ]);

    // SSRF 패턴
    patterns.set('ssrf', [
      /(http|https|ftp|file|gopher|ldap):\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])/i,
      /(http|https|ftp|file|gopher|ldap):\/\/192\.168\./i,
      /(http|https|ftp|file|gopher|ldap):\/\/10\./i,
      /(http|https|ftp|file|gopher|ldap):\/\/172\.(1[6-9]|2[0-9]|3[0-1])\./i,
    ]);

    return patterns;
  }

  /**
   * 실시간 위협 감지 및 분석
   */
  async detectThreat(request: {
    ip: string;
    userAgent: string;
    method: string;
    url: string;
    headers: Record<string, string>;
    body?: any;
    query?: Record<string, any>;
    userId?: string;
  }): Promise<ThreatDetection | null> {
    // 이미 차단된 IP 확인
    if (this.blockedIPs.has(request.ip)) {
      return {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        type: 'unauthorized_access',
        severity: 'high',
        source: request.ip,
        target: request.url,
        description: '차단된 IP에서 접근 시도',
        action: 'blocked',
        metadata: { blocked: true },
      };
    }

    // Rate Limiting 확인
    if (this.isRateLimited(request.ip)) {
      return {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        type: 'ddos',
        severity: 'medium',
        source: request.ip,
        target: request.url,
        description: 'Rate limit 초과',
        action: 'blocked',
        metadata: { rateLimit: true },
      };
    }

    // 위협 패턴 검사
    const allInputs = [
      request.url,
      JSON.stringify(request.body || {}),
      JSON.stringify(request.query || {}),
      JSON.stringify(request.headers),
      request.userAgent,
    ].join(' ');

    for (const [threatType, patterns] of this.threatPatterns.entries()) {
      for (const pattern of patterns) {
        if (pattern.test(allInputs)) {
          const severity = this.calculateSeverity(threatType, request);
          
          // 자동 차단 결정
          const action = this.shouldBlock(threatType, severity, request.ip);

          if (action === 'blocked') {
            this.blockedIPs.add(request.ip);
          } else {
            this.recordSuspiciousActivity(request.ip);
          }

          return {
            id: crypto.randomUUID(),
            timestamp: new Date(),
            type: threatType,
            severity,
            source: request.ip,
            target: request.url,
            description: `${threatType} 공격 시도 감지`,
            action,
            metadata: {
              pattern: pattern.toString(),
              matched: allInputs.match(pattern)?.[0],
              userAgent: request.userAgent,
              method: request.method,
            },
          };
        }
      }
    }

    // 비정상 행동 패턴 감지
    const suspiciousBehavior = await this.detectSuspiciousBehavior(request);
    if (suspiciousBehavior) {
      return suspiciousBehavior;
    }

    return null;
  }

  /**
   * 비정상 행동 패턴 감지 (AI 기반)
   */
  private async detectSuspiciousBehavior(request: {
    ip: string;
    userId?: string;
    url: string;
    method: string;
  }): Promise<ThreatDetection | null> {
    // 의심스러운 IP 확인
    const suspiciousCount = this.suspiciousIPs.get(request.ip) || 0;
    if (suspiciousCount > 5) {
      return {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        type: 'suspicious_behavior',
        severity: 'high',
        source: request.ip,
        target: request.url,
        description: '반복적인 의심스러운 활동',
        action: 'blocked',
        metadata: { suspiciousCount },
      };
    }

    // 비정상적인 엔드포인트 접근 패턴
    const sensitiveEndpoints = ['/api/admin', '/api/user', '/api/auth'];
    const isSensitive = sensitiveEndpoints.some(endpoint => 
      request.url.includes(endpoint)
    );

    if (isSensitive && request.method !== 'GET') {
      // 비정상적인 시간대 접근 (예: 새벽 2-5시)
      const hour = new Date().getHours();
      if (hour >= 2 && hour <= 5) {
        return {
          id: crypto.randomUUID(),
          timestamp: new Date(),
          type: 'suspicious_behavior',
          severity: 'medium',
          source: request.ip,
          target: request.url,
          description: '비정상적인 시간대에 민감한 엔드포인트 접근',
          action: 'monitored',
          metadata: { hour, endpoint: request.url },
        };
      }
    }

    return null;
  }

  /**
   * 위협 심각도 계산
   */
  private calculateSeverity(
    threatType: ThreatType,
    request: { url: string; method: string }
  ): 'low' | 'medium' | 'high' | 'critical' {
    const criticalThreats: ThreatType[] = [
      'sql_injection',
      'command_injection',
      'data_exfiltration',
      'unauthorized_access',
    ];

    const highThreats: ThreatType[] = [
      'xss',
      'ssrf',
      'xxe',
      'path_traversal',
    ];

    if (criticalThreats.includes(threatType)) {
      return 'critical';
    }

    if (highThreats.includes(threatType)) {
      return 'high';
    }

    // 민감한 엔드포인트에서의 공격은 심각도 상향
    const sensitiveEndpoints = ['/api/admin', '/api/user', '/api/auth'];
    if (sensitiveEndpoints.some(endpoint => request.url.includes(endpoint))) {
      return 'high';
    }

    return 'medium';
  }

  /**
   * 자동 차단 결정
   */
  private shouldBlock(
    threatType: ThreatType,
    severity: 'low' | 'medium' | 'high' | 'critical',
    ip: string
  ): 'blocked' | 'monitored' | 'allowed' {
    // Critical 위협은 즉시 차단
    if (severity === 'critical') {
      return 'blocked';
    }

    // High 위협도 차단
    if (severity === 'high') {
      return 'blocked';
    }

    // 의심스러운 IP는 모니터링
    const suspiciousCount = this.suspiciousIPs.get(ip) || 0;
    if (suspiciousCount > 3) {
      return 'blocked';
    }

    return 'monitored';
  }

  /**
   * Rate Limiting 확인
   */
  private isRateLimited(ip: string): boolean {
    const limit = this.rateLimits.get(ip);
    const now = new Date();

    if (!limit || now > limit.resetAt) {
      this.rateLimits.set(ip, {
        count: 1,
        resetAt: new Date(now.getTime() + 60000), // 1분
      });
      return false;
    }

    if (limit.count >= 100) {
      // 1분에 100회 이상 요청 시 차단
      return true;
    }

    limit.count++;
    return false;
  }

  /**
   * 의심스러운 활동 기록
   */
  private recordSuspiciousActivity(ip: string): void {
    const count = this.suspiciousIPs.get(ip) || 0;
    this.suspiciousIPs.set(ip, count + 1);

    // 10회 이상이면 자동 차단
    if (count + 1 >= 10) {
      this.blockedIPs.add(ip);
    }
  }

  /**
   * 보안 로그 기록
   */
  async logSecurityEvent(log: SecurityLog): Promise<void> {
    try {
      // 데이터베이스에 저장 (Prisma 스키마에 SecurityLog 모델 추가 필요)
      // await prisma.securityLog.create({ data: log });

      // 메모리에 저장 (실시간 대시보드용)
      this.dataAccessLogs.push(log);

      // 최근 1000개만 유지
      if (this.dataAccessLogs.length > 1000) {
        this.dataAccessLogs.shift();
      }
    } catch (error) {
      console.error('보안 로그 저장 실패:', error);
    }
  }

  /**
   * 데이터 유출 감지
   */
  async detectDataBreach(
    userId: string,
    dataAccessed: string[],
    request: {
      ip: string;
      userAgent: string;
      url: string;
      method: string;
    }
  ): Promise<DataBreachReport | null> {
    // 비정상적인 데이터 접근 패턴 감지
    const sensitiveData = ['password', 'email', 'phone', 'credit_card', 'ssn'];
    const leakedData = dataAccessed.filter(data =>
      sensitiveData.some(sensitive => data.toLowerCase().includes(sensitive))
    );

    if (leakedData.length > 0) {
      // 최근 로그에서 해당 사용자의 활동 확인
      const userLogs = this.dataAccessLogs.filter(
        log => log.userId === userId
      );

      const report: DataBreachReport = {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        severity: leakedData.length > 3 ? 'critical' : 'high',
        cause: this.identifyBreachCause(userLogs, request),
        affectedData: leakedData,
        affectedUsers: 1,
        detectionMethod: 'AI pattern analysis',
        status: 'investigating',
        remediation: this.generateRemediation(leakedData),
        logs: userLogs.slice(-50), // 최근 50개 로그
      };

      return report;
    }

    return null;
  }

  /**
   * 유출 원인 식별
   */
  private identifyBreachCause(
    logs: SecurityLog[],
    request: { ip: string; url: string; method: string }
  ): string {
    // SQL Injection으로 인한 유출
    const sqlInjectionLogs = logs.filter(
      log => log.threatType === 'sql_injection'
    );
    if (sqlInjectionLogs.length > 0) {
      return 'SQL Injection 공격으로 인한 데이터 유출';
    }

    // 인증 우회
    const unauthorizedLogs = logs.filter(
      log => log.threatType === 'unauthorized_access'
    );
    if (unauthorizedLogs.length > 0) {
      return '인증 우회를 통한 무단 데이터 접근';
    }

    // API 남용
    const apiAbuseLogs = logs.filter(log => log.threatType === 'api_abuse');
    if (apiAbuseLogs.length > 0) {
      return 'API 남용을 통한 대량 데이터 추출';
    }

    // 의심스러운 행동 패턴
    return '비정상적인 데이터 접근 패턴 감지';
  }

  /**
   * 대응 방안 생성
   */
  private generateRemediation(leakedData: string[]): string[] {
    const remediation: string[] = [];

    if (leakedData.some(data => data.includes('password'))) {
      remediation.push('모든 사용자 비밀번호 강제 변경');
      remediation.push('2FA(이중 인증) 활성화 권장');
    }

    if (leakedData.some(data => data.includes('credit_card'))) {
      remediation.push('결제 정보 암호화 강화');
      remediation.push('PCI DSS 준수 확인');
      remediation.push('영향받은 사용자에게 통지');
    }

    if (leakedData.some(data => data.includes('email'))) {
      remediation.push('이메일 주소 암호화');
      remediation.push('스팸 필터 강화');
    }

    remediation.push('해당 IP 주소 차단');
    remediation.push('보안 로그 상세 분석');
    remediation.push('취약점 패치 적용');

    return remediation;
  }

  /**
   * 보안 로그 조회 (관리자 대시보드용)
   */
  async getSecurityLogs(filters?: {
    startDate?: Date;
    endDate?: Date;
    severity?: 'low' | 'medium' | 'high' | 'critical';
    threatType?: ThreatType;
    ip?: string;
    limit?: number;
  }): Promise<SecurityLog[]> {
    let logs = [...this.dataAccessLogs];

    if (filters?.startDate) {
      logs = logs.filter(log => log.timestamp >= filters.startDate!);
    }

    if (filters?.endDate) {
      logs = logs.filter(log => log.timestamp <= filters.endDate!);
    }

    if (filters?.severity) {
      logs = logs.filter(log => log.severity === filters.severity);
    }

    if (filters?.threatType) {
      logs = logs.filter(log => log.threatType === filters.threatType);
    }

    if (filters?.ip) {
      logs = logs.filter(log => log.ipAddress === filters.ip);
    }

    // 최신순 정렬
    logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // 제한
    if (filters?.limit) {
      logs = logs.slice(0, filters.limit);
    }

    return logs;
  }

  /**
   * 데이터 유출 보고서 조회
   */
  async getDataBreachReports(): Promise<DataBreachReport[]> {
    // 실제로는 데이터베이스에서 조회
    // 임시로 빈 배열 반환
    return [];
  }

  /**
   * IP 차단 해제
   */
  unblockIP(ip: string): void {
    this.blockedIPs.delete(ip);
    this.suspiciousIPs.delete(ip);
  }

  /**
   * 차단된 IP 목록 조회
   */
  getBlockedIPs(): string[] {
    return Array.from(this.blockedIPs);
  }
}

// 싱글톤 인스턴스
export const aiSecurityGuard = new AISecurityGuard();

