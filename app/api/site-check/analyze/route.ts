import { NextRequest, NextResponse } from 'next/server';
import { aiModelManager } from '@/lib/ai-models';

/**
 * 사이트 검사 및 모의해킹 API
 * URL을 분석하여 사이트 구성, 모듈, 보안 취약점을 검사
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json(
        { error: 'URL이 필요합니다.' },
        { status: 400 }
      );
    }

    let analysisResult: any = {
      timestamp: new Date().toISOString(),
      url,
      checks: [],
      vulnerabilities: [],
      modules: [],
      structure: {},
      performance: {},
      securityScore: 100,
    };

    try {
      // 1. 기본 접근성 확인
      const response = await fetch(url, {
        method: 'HEAD',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; SecurityScanner/1.0)',
        },
      });

      analysisResult.checks.push({
        name: '사이트 접근성',
        status: response.ok ? 'success' : 'error',
        message: response.ok ? '사이트에 접근 가능합니다' : `HTTP ${response.status}: 접근 불가`,
      });

      if (!response.ok) {
        analysisResult.securityScore -= 20;
      }

      // 2. HTTPS 확인
      const isHttps = url.startsWith('https://');
      analysisResult.checks.push({
        name: 'HTTPS 사용',
        status: isHttps ? 'success' : 'warning',
        message: isHttps ? 'HTTPS를 사용하고 있습니다' : 'HTTPS를 사용하지 않습니다 (보안 위험)',
      });
      if (!isHttps) {
        analysisResult.securityScore -= 15;
        analysisResult.vulnerabilities.push({
          severity: 'high',
          type: 'no_https',
          description: 'HTTPS를 사용하지 않아 데이터가 암호화되지 않습니다.',
          recommendation: 'SSL/TLS 인증서를 설치하고 HTTPS를 활성화하세요.',
        });
      }

      // 3. 보안 헤더 확인
      const securityHeaders = {
        'X-Frame-Options': response.headers.get('X-Frame-Options'),
        'X-Content-Type-Options': response.headers.get('X-Content-Type-Options'),
        'Strict-Transport-Security': response.headers.get('Strict-Transport-Security'),
        'Content-Security-Policy': response.headers.get('Content-Security-Policy'),
        'X-XSS-Protection': response.headers.get('X-XSS-Protection'),
      };

      Object.entries(securityHeaders).forEach(([header, value]) => {
        analysisResult.checks.push({
          name: `보안 헤더: ${header}`,
          status: value ? 'success' : 'warning',
          message: value ? `${header} 설정됨` : `${header} 미설정`,
        });
        if (!value) {
          analysisResult.securityScore -= 3;
        }
      });

      // 4. HTML 소스 가져오기 (구조 분석용)
      try {
        const htmlResponse = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; SecurityScanner/1.0)',
          },
        });
        const html = await htmlResponse.text();

        // 모듈 및 라이브러리 감지
        const modulePatterns = [
          { name: 'React', pattern: /react|react-dom/gi },
          { name: 'Vue.js', pattern: /vue\.js|vue@/gi },
          { name: 'Angular', pattern: /angular|@angular/gi },
          { name: 'jQuery', pattern: /jquery/gi },
          { name: 'Bootstrap', pattern: /bootstrap/gi },
          { name: 'Tailwind CSS', pattern: /tailwindcss/gi },
        ];

        modulePatterns.forEach(({ name, pattern }) => {
          if (pattern.test(html)) {
            analysisResult.modules.push({
              name,
              detected: true,
            });
          }
        });

        // API 키 패턴 검사
        const apiKeyPatterns = [
          /AIza[0-9A-Za-z-_]{35}/g, // Google API Key
          /sk-[0-9A-Za-z]{32,}/g, // OpenAI API Key
          /pk_[0-9A-Za-z]{32,}/g, // Stripe
        ];

        apiKeyPatterns.forEach((pattern) => {
          const matches = html.match(pattern);
          if (matches) {
            analysisResult.vulnerabilities.push({
              severity: 'high',
              type: 'api_key_exposure',
              description: 'API 키가 클라이언트 코드에 노출되어 있습니다.',
              recommendation: 'API 키를 서버 사이드로 이동하고 환경 변수로 관리하세요.',
            });
            analysisResult.securityScore -= 20;
          }
        });

        // 5. AI를 통한 심층 분석
        const analysisPrompt = `다음 웹사이트 URL에 대한 종합적인 보안 및 구조 분석을 수행해주세요: ${url}

다음 항목들을 분석해주세요:
1. 사이트 구조 및 아키텍처
2. 사용된 프레임워크 및 라이브러리
3. 보안 취약점 (XSS, CSRF, SQL Injection 등)
4. 모의해킹 시나리오
5. 성능 최적화 기회
6. SEO 최적화 상태

JSON 형식으로 반환해주세요:
{
  "structure": {
    "framework": "감지된 프레임워크",
    "architecture": "아키텍처 유형",
    "technologies": ["기술 스택"]
  },
  "vulnerabilities": [
    {
      "severity": "high|medium|low",
      "type": "취약점 유형",
      "description": "상세 설명",
      "exploitation": "모의해킹 방법",
      "recommendation": "해결 방법"
    }
  ],
  "performance": {
    "score": 0-100,
    "issues": ["성능 문제"],
    "optimizations": ["최적화 제안"]
  },
  "securityScore": 0-100
}`;

        try {
          const aiAnalysis = await aiModelManager.generateWithModel('gemini-pro', analysisPrompt);
          const jsonMatch = aiAnalysis.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            if (parsed.structure) {
              analysisResult.structure = parsed.structure;
            }
            if (parsed.vulnerabilities) {
              analysisResult.vulnerabilities.push(...parsed.vulnerabilities);
            }
            if (parsed.performance) {
              analysisResult.performance = parsed.performance;
            }
            if (parsed.securityScore) {
              analysisResult.securityScore = Math.min(analysisResult.securityScore, parsed.securityScore);
            }
          }
        } catch (aiError) {
          console.error('AI 분석 오류:', aiError);
        }

      } catch (htmlError) {
        console.error('HTML 가져오기 오류:', htmlError);
      }

    } catch (error: any) {
      analysisResult.checks.push({
        name: '분석 오류',
        status: 'error',
        message: `분석 중 오류 발생: ${error.message}`,
      });
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

