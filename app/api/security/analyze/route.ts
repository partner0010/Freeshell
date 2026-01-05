import { NextRequest, NextResponse } from 'next/server';
import { aiModelManager } from '@/lib/ai-models';

/**
 * 보안 분석 API
 * URL 또는 코드를 분석하여 보안 취약점, API 키 노출, 코드 품질 등을 검사
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, target, code } = body; // type: 'url' | 'code', target: URL, code: 코드 내용

    if (!type || (!target && !code)) {
      return NextResponse.json(
        { error: '분석 타입과 대상이 필요합니다.' },
        { status: 400 }
      );
    }

    let analysisResult: any = {
      timestamp: new Date().toISOString(),
      type,
      target: target || '코드 분석',
      checks: [],
      vulnerabilities: [],
      recommendations: [],
      securityScore: 100,
    };

    // URL 분석
    if (type === 'url') {
      try {
        // 1. URL 접근성 확인
        const urlResponse = await fetch(target, {
          method: 'HEAD',
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; SecurityScanner/1.0)',
          },
        });
        
        analysisResult.checks.push({
          name: 'URL 접근성',
          status: urlResponse.ok ? 'success' : 'error',
          message: urlResponse.ok ? '사이트에 접근 가능합니다' : '사이트에 접근할 수 없습니다',
        });

        // 2. HTTPS 확인
        const isHttps = target.startsWith('https://');
        analysisResult.checks.push({
          name: 'HTTPS 사용',
          status: isHttps ? 'success' : 'warning',
          message: isHttps ? 'HTTPS를 사용하고 있습니다' : 'HTTPS를 사용하지 않습니다 (보안 위험)',
        });

        // 3. 보안 헤더 확인
        const securityHeaders = {
          'X-Frame-Options': urlResponse.headers.get('X-Frame-Options'),
          'X-Content-Type-Options': urlResponse.headers.get('X-Content-Type-Options'),
          'Strict-Transport-Security': urlResponse.headers.get('Strict-Transport-Security'),
          'Content-Security-Policy': urlResponse.headers.get('Content-Security-Policy'),
        };

        Object.entries(securityHeaders).forEach(([header, value]) => {
          analysisResult.checks.push({
            name: `보안 헤더: ${header}`,
            status: value ? 'success' : 'warning',
            message: value ? `${header} 설정됨` : `${header} 미설정 (보안 권장)`,
          });
          if (!value) {
            analysisResult.securityScore -= 5;
            analysisResult.vulnerabilities.push({
              severity: 'medium',
              type: 'missing_security_header',
              header,
              description: `${header} 보안 헤더가 설정되지 않았습니다.`,
            });
          }
        });

        // 4. AI를 통한 심층 분석
        const analysisPrompt = `다음 웹사이트 URL에 대한 보안 분석을 수행해주세요: ${target}

다음 항목들을 분석해주세요:
1. 일반적인 보안 취약점 (XSS, SQL Injection, CSRF 등)
2. API 키 노출 가능성
3. 민감한 정보 노출
4. 인증/인가 취약점
5. 데이터 암호화 상태
6. 최적화 제안

JSON 형식으로 반환해주세요:
{
  "vulnerabilities": [
    {
      "severity": "high|medium|low",
      "type": "취약점 유형",
      "description": "상세 설명",
      "recommendation": "해결 방법"
    }
  ],
  "optimizations": [
    {
      "type": "최적화 유형",
      "description": "설명",
      "impact": "high|medium|low"
    }
  ],
  "securityScore": 0-100
}`;

        try {
          const aiAnalysis = await aiModelManager.generateWithModel('gemini-pro', analysisPrompt);
          
          // AI 응답에서 JSON 추출 시도
          const jsonMatch = aiAnalysis.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            if (parsed.vulnerabilities) {
              analysisResult.vulnerabilities.push(...parsed.vulnerabilities);
            }
            if (parsed.optimizations) {
              analysisResult.recommendations.push(...parsed.optimizations);
            }
            if (parsed.securityScore) {
              analysisResult.securityScore = Math.min(analysisResult.securityScore, parsed.securityScore);
            }
          }
        } catch (aiError) {
          console.error('AI 분석 오류:', aiError);
        }

      } catch (error: any) {
        analysisResult.checks.push({
          name: 'URL 분석',
          status: 'error',
          message: `분석 중 오류: ${error.message}`,
        });
      }
    }

    // 코드 분석
    if (type === 'code' && code) {
      // 1. API 키 패턴 검사
      const apiKeyPatterns = [
        /api[_-]?key\s*[=:]\s*['"]([^'"]+)['"]/gi,
        /apikey\s*[=:]\s*['"]([^'"]+)['"]/gi,
        /secret[_-]?key\s*[=:]\s*['"]([^'"]+)['"]/gi,
        /password\s*[=:]\s*['"]([^'"]+)['"]/gi,
        /token\s*[=:]\s*['"]([^'"]+)['"]/gi,
        /AIza[0-9A-Za-z-_]{35}/g, // Google API Key
        /sk-[0-9A-Za-z]{32,}/g, // OpenAI API Key
      ];

      apiKeyPatterns.forEach((pattern, index) => {
        const matches = code.match(pattern);
        if (matches) {
          analysisResult.vulnerabilities.push({
            severity: 'high',
            type: 'api_key_exposure',
            description: `API 키 또는 비밀번호가 코드에 노출되어 있습니다.`,
            matches: matches.length,
            recommendation: '환경 변수로 이동하거나 보안 저장소를 사용하세요.',
          });
          analysisResult.securityScore -= 20;
        }
      });

      // 2. SQL Injection 취약점 검사
      const sqlInjectionPatterns = [
        /\$\{[^}]*\}.*SELECT/i,
        /\+.*SELECT/i,
        /query\([^)]*\+/i,
      ];

      sqlInjectionPatterns.forEach((pattern) => {
        if (pattern.test(code)) {
          analysisResult.vulnerabilities.push({
            severity: 'high',
            type: 'sql_injection',
            description: 'SQL Injection 취약점이 의심됩니다.',
            recommendation: 'Prepared Statement 또는 ORM을 사용하세요.',
          });
          analysisResult.securityScore -= 15;
        }
      });

      // 3. XSS 취약점 검사
      const xssPatterns = [
        /innerHTML\s*=\s*[^;]+/i,
        /document\.write\([^)]+\)/i,
        /eval\([^)]+\)/i,
      ];

      xssPatterns.forEach((pattern) => {
        if (pattern.test(code)) {
          analysisResult.vulnerabilities.push({
            severity: 'medium',
            type: 'xss',
            description: 'XSS 취약점이 의심됩니다.',
            recommendation: '입력값 검증 및 이스케이프 처리를 수행하세요.',
          });
          analysisResult.securityScore -= 10;
        }
      });

      // 4. AI를 통한 코드 품질 분석
      const codeAnalysisPrompt = `다음 코드를 분석하여 보안 취약점, 코드 품질, 최적화 기회를 찾아주세요:

\`\`\`
${code.substring(0, 5000)} // 최대 5000자
\`\`\`

다음 항목을 분석해주세요:
1. 보안 취약점 (API 키 노출, SQL Injection, XSS, CSRF 등)
2. 코드 품질 문제
3. 성능 최적화 기회
4. 모범 사례 준수 여부

JSON 형식으로 반환해주세요:
{
  "vulnerabilities": [...],
  "codeQuality": [...],
  "optimizations": [...],
  "bestPractices": [...]
}`;

      try {
        const aiCodeAnalysis = await aiModelManager.generateWithModel('gemini-pro', codeAnalysisPrompt);
        const jsonMatch = aiCodeAnalysis.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.vulnerabilities) {
            analysisResult.vulnerabilities.push(...parsed.vulnerabilities);
          }
          if (parsed.optimizations) {
            analysisResult.recommendations.push(...parsed.optimizations);
          }
        }
      } catch (aiError) {
        console.error('AI 코드 분석 오류:', aiError);
      }
    }

    // 최종 보안 점수 계산
    analysisResult.securityScore = Math.max(0, Math.min(100, analysisResult.securityScore));

    return NextResponse.json(analysisResult);
  } catch (error: any) {
    return NextResponse.json(
      { error: '분석 중 오류가 발생했습니다.', message: error.message },
      { status: 500 }
    );
  }
}

