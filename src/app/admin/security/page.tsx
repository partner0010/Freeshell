'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Globe,
  Server,
  Code,
  FileWarning,
  Activity,
  Clock,
  Download,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Info,
  AlertOctagon,
} from 'lucide-react';
import { VulnerabilityScanner, VulnerabilityReport } from '@/lib/security/vulnerability-scanner';
import { PenetrationTester, PenTestResult } from '@/lib/security/penetration-test';

export default function SecurityPage() {
  const [scanning, setScanning] = useState(false);
  const [penTesting, setPenTesting] = useState(false);
  const [report, setReport] = useState<VulnerabilityReport | null>(null);
  const [penTestReport, setPenTestReport] = useState<PenTestResult | null>(null);
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [expandedVuln, setExpandedVuln] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'vulnerability' | 'pentest'>('vulnerability');
  
  // 보안 상태 통계
  const [securityStats, setSecurityStats] = useState({
    totalScans: 0,
    lastScanTime: null as number | null,
    averageScore: 0,
    blockedAttacks: 0,
    activeThreats: 0,
  });
  
  // 실시간 보안 이벤트
  const [securityEvents, setSecurityEvents] = useState<Array<{
    id: string;
    type: string;
    message: string;
    timestamp: number;
    severity: 'info' | 'warning' | 'error';
  }>>([]);

  // 스캔 실행
  const runSecurityScan = async () => {
    setScanning(true);
    
    try {
      const scanner = new VulnerabilityScanner();
      const result = await scanner.runFullScan();
      setReport(result);
      
      // 통계 업데이트
      setSecurityStats((prev) => ({
        ...prev,
        totalScans: prev.totalScans + 1,
        lastScanTime: Date.now(),
        averageScore: Math.round((prev.averageScore * prev.totalScans + result.summary.score) / (prev.totalScans + 1)),
      }));
      
      // 이벤트 추가
      setSecurityEvents((prev) => [
        {
          id: `event-${Date.now()}`,
          type: 'scan_complete',
          message: `보안 스캔 완료 - 점수: ${result.summary.score}/100`,
          timestamp: Date.now(),
          severity: (result.summary.score >= 80 ? 'info' : result.summary.score >= 50 ? 'warning' : 'error') as 'info' | 'warning' | 'error',
        },
        ...prev,
      ].slice(0, 50));
    } catch (error) {
      console.error('스캔 오류:', error);
    } finally {
      setScanning(false);
    }
  };
  
  // 모의해킹 실행
  const runPenetrationTest = async () => {
    setPenTesting(true);
    
    try {
      const tester = new PenetrationTester();
      const result = await tester.runFullPenTest();
      setPenTestReport(result);
      
      // 이벤트 추가
      setSecurityEvents((prev) => [
        {
          id: `event-${Date.now()}`,
          type: 'pentest_complete',
          message: `모의해킹 완료 - 점수: ${result.summary.score}/100`,
          timestamp: Date.now(),
          severity: (result.summary.score >= 80 ? 'info' : result.summary.score >= 50 ? 'warning' : 'error') as 'info' | 'warning' | 'error',
        },
        ...prev,
      ].slice(0, 50));
    } catch (error) {
      console.error('모의해킹 오류:', error);
    } finally {
      setPenTesting(false);
    }
  };
  
  // 시뮬레이션된 실시간 이벤트
  useEffect(() => {
    const events = [
      { type: 'rate_limit', message: 'Rate Limit 발동 - IP: 203.xxx.xxx.xxx', severity: 'warning' as const },
      { type: 'login_attempt', message: '로그인 시도 감지 - admin@example.com', severity: 'info' as const },
      { type: 'bot_blocked', message: '악성 봇 차단됨 - User-Agent: Scrapy', severity: 'warning' as const },
      { type: 'csrf_check', message: 'CSRF 토큰 검증 통과', severity: 'info' as const },
      { type: 'xss_blocked', message: 'XSS 공격 시도 차단됨', severity: 'error' as const },
    ];
    
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const event = events[Math.floor(Math.random() * events.length)];
        setSecurityEvents((prev) => [
          {
            id: `event-${Date.now()}`,
            ...event,
            timestamp: Date.now(),
          },
          ...prev,
        ].slice(0, 50));
        
        if (event.severity === 'error') {
          setSecurityStats((prev) => ({
            ...prev,
            blockedAttacks: prev.blockedAttacks + 1,
          }));
        }
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  // 취약점 필터링
  const filteredVulnerabilities = report?.vulnerabilities.filter((v) =>
    selectedSeverity === 'all' ? true : v.severity === selectedSeverity
  ) || [];
  
  // 심각도 색상
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      case 'high': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
      case 'low': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
      case 'info': return 'text-gray-600 bg-gray-100 dark:bg-gray-700/30';
      default: return 'text-gray-600 bg-gray-100';
    }
  };
  
  // 점수 색상
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Shield className="w-8 h-8 text-primary-500" />
            보안 센터
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            실시간 보안 모니터링 및 취약점 분석
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={runSecurityScan}
            disabled={scanning || penTesting}
            className="flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-5 h-5 ${scanning ? 'animate-spin' : ''}`} />
            {scanning ? '스캔 중...' : '취약점 스캔'}
          </button>
          
          <button
            onClick={runPenetrationTest}
            disabled={scanning || penTesting}
            className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 disabled:opacity-50 transition-colors"
          >
            <Shield className={`w-5 h-5 ${penTesting ? 'animate-pulse' : ''}`} />
            {penTesting ? '테스트 중...' : '모의해킹'}
          </button>
        </div>
      </div>
      
      {/* 보안 개요 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-soft"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">보안 점수</p>
              <p className={`text-3xl font-bold ${getScoreColor(report?.summary.score || 0)}`}>
                {report?.summary.score || '-'}/100
              </p>
            </div>
            <Shield className="w-12 h-12 text-primary-200" />
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-soft"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">총 스캔</p>
              <p className="text-3xl font-bold text-gray-800 dark:text-white">
                {securityStats.totalScans}
              </p>
            </div>
            <Search className="w-12 h-12 text-blue-200" />
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-soft"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">차단된 공격</p>
              <p className="text-3xl font-bold text-red-500">
                {securityStats.blockedAttacks}
              </p>
            </div>
            <AlertOctagon className="w-12 h-12 text-red-200" />
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-soft"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">발견된 취약점</p>
              <p className="text-3xl font-bold text-orange-500">
                {report?.summary.total || 0}
              </p>
            </div>
            <AlertTriangle className="w-12 h-12 text-orange-200" />
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-soft"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">마지막 스캔</p>
              <p className="text-lg font-bold text-gray-800 dark:text-white">
                {securityStats.lastScanTime
                  ? new Date(securityStats.lastScanTime).toLocaleTimeString()
                  : '-'}
              </p>
            </div>
            <Clock className="w-12 h-12 text-green-200" />
          </div>
        </motion.div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 취약점 목록 */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-soft overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                취약점 분석 결과
              </h2>
              
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={selectedSeverity}
                  onChange={(e) => setSelectedSeverity(e.target.value)}
                  className="text-sm border rounded-lg px-3 py-1.5 dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="all">모든 심각도</option>
                  <option value="critical">심각</option>
                  <option value="high">높음</option>
                  <option value="medium">중간</option>
                  <option value="low">낮음</option>
                  <option value="info">정보</option>
                </select>
              </div>
            </div>
            
            {/* 심각도 요약 */}
            {report && (
              <div className="flex gap-2 mt-4">
                <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-600 dark:bg-red-900/30">
                  심각: {report.summary.critical}
                </span>
                <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-600 dark:bg-orange-900/30">
                  높음: {report.summary.high}
                </span>
                <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30">
                  중간: {report.summary.medium}
                </span>
                <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30">
                  낮음: {report.summary.low}
                </span>
                <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700">
                  정보: {report.summary.info}
                </span>
              </div>
            )}
          </div>
          
          <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-[500px] overflow-y-auto">
            {filteredVulnerabilities.length > 0 ? (
              filteredVulnerabilities.map((vuln) => (
                <motion.div
                  key={vuln.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div
                    className="flex items-start justify-between cursor-pointer"
                    onClick={() => setExpandedVuln(expandedVuln === vuln.id ? null : vuln.id)}
                  >
                    <div className="flex items-start gap-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(vuln.severity)}`}>
                        {vuln.severity.toUpperCase()}
                      </span>
                      <div>
                        <h3 className="font-medium text-gray-800 dark:text-white">
                          {vuln.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {vuln.description}
                        </p>
                      </div>
                    </div>
                    
                    {expandedVuln === vuln.id ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  
                  <AnimatePresence>
                    {expandedVuln === vuln.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-4 pl-12 space-y-3"
                      >
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">해결 방법</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{vuln.remediation}</p>
                        </div>
                        
                        {vuln.cwe && (
                          <div className="flex gap-4 text-xs">
                            <span className="text-gray-500">CWE: {vuln.cwe}</span>
                            {vuln.owasp && <span className="text-gray-500">OWASP: {vuln.owasp}</span>}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))
            ) : (
              <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                {report ? '해당 심각도의 취약점이 없습니다.' : '보안 스캔을 실행하여 취약점을 분석하세요.'}
              </div>
            )}
          </div>
        </div>
        
        {/* 실시간 이벤트 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-500" />
              실시간 보안 이벤트
            </h2>
          </div>
          
          <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-[500px] overflow-y-auto">
            {securityEvents.map((event) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-4"
              >
                <div className="flex items-start gap-3">
                  {event.severity === 'error' ? (
                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  ) : event.severity === 'warning' ? (
                    <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 dark:text-white">
                      {event.message}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {securityEvents.length === 0 && (
              <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                보안 이벤트가 없습니다.
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* 보안 권장사항 */}
      {report && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-primary-50 to-pastel-lavender dark:from-primary-900/20 dark:to-primary-800/20 rounded-2xl p-6"
        >
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <Info className="w-5 h-5 text-primary-500" />
            보안 권장사항
          </h2>
          
          <ul className="space-y-2">
            {report.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}
      
      {/* 보안 기능 상태 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { name: 'XSS 방어', icon: Code, status: 'active', description: 'HTML 살균 및 CSP 적용' },
          { name: 'CSRF 보호', icon: Lock, status: 'active', description: 'CSRF 토큰 검증' },
          { name: 'Rate Limiting', icon: Activity, status: 'active', description: '분당 100회 제한' },
          { name: 'SQL Injection 방어', icon: Server, status: 'active', description: '입력 검증 및 이스케이프' },
          { name: 'DDoS 방어', icon: Globe, status: 'active', description: 'IP 기반 트래픽 제한' },
          { name: 'HTTPS', icon: Lock, status: 'dev', description: '개발 환경 (프로덕션에서 필수)' },
          { name: '2단계 인증', icon: Shield, status: 'ready', description: '구현 완료, 활성화 필요' },
          { name: '세션 보안', icon: Eye, status: 'active', description: '만료 및 비활성 타임아웃' },
        ].map((feature, index) => (
          <motion.div
            key={feature.name}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-soft"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <feature.icon className="w-5 h-5 text-primary-500" />
                <span className="font-medium text-gray-800 dark:text-white">{feature.name}</span>
              </div>
              
              <span
                className={`px-2 py-0.5 text-xs rounded-full ${
                  feature.status === 'active'
                    ? 'bg-green-100 text-green-600 dark:bg-green-900/30'
                    : feature.status === 'ready'
                    ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700'
                }`}
              >
                {feature.status === 'active' ? '활성' : feature.status === 'ready' ? '준비됨' : '개발'}
              </span>
            </div>
            
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

