import { NextRequest, NextResponse } from 'next/server';
import { aiModelManager } from '@/lib/ai-models';

/**
 * 디버그 및 코드 분석 API
 * 코드를 분석하여 버그, 성능 문제, 최적화 기회를 찾음
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, type } = body; // type: 'code' | 'url'

    if (!code && !type) {
      return NextResponse.json(
        { error: '분석할 코드 또는 URL이 필요합니다.' },
        { status: 400 }
      );
    }

    let analysisResult: any = {
      timestamp: new Date().toISOString(),
      type: type || 'code',
      issues: [],
      optimizations: [],
      suggestions: [],
      codeQuality: {
        score: 100,
        maintainability: 'good',
        complexity: 'low',
        readability: 'good',
      },
    };

    // 코드 분석
    if (code) {
      // 1. 일반적인 버그 패턴 검사
      const bugPatterns = [
        {
          pattern: /console\.log\(/gi,
          type: 'debug_code',
          severity: 'low',
          description: '프로덕션 코드에 console.log가 남아있습니다.',
          fix: 'console.log를 제거하거나 로깅 라이브러리로 교체하세요.',
        },
        {
          pattern: /TODO|FIXME|HACK|XXX/gi,
          type: 'todo_comment',
          severity: 'medium',
          description: 'TODO 또는 FIXME 주석이 발견되었습니다.',
          fix: '주석에 명시된 작업을 완료하세요.',
        },
        {
          pattern: /var\s+\w+/g,
          type: 'var_usage',
          severity: 'low',
          description: 'var 키워드 사용 (let/const 권장)',
          fix: 'var를 let 또는 const로 변경하세요.',
        },
        {
          pattern: /==\s*[^=]|[^=]\s*==/g,
          type: 'loose_equality',
          severity: 'medium',
          description: '느슨한 동등 연산자(==) 사용',
          fix: '엄격한 동등 연산자(===)를 사용하세요.',
        },
        {
          pattern: /eval\(/gi,
          type: 'eval_usage',
          severity: 'high',
          description: 'eval() 사용은 보안 위험이 있습니다.',
          fix: 'eval() 사용을 피하고 대안을 찾으세요.',
        },
        {
          pattern: /document\.write\(/gi,
          type: 'document_write',
          severity: 'medium',
          description: 'document.write() 사용은 성능 문제를 일으킬 수 있습니다.',
          fix: 'DOM 조작 메서드를 사용하세요.',
        },
      ];

      bugPatterns.forEach(({ pattern, type, severity, description, fix }) => {
        const matches = code.match(pattern);
        if (matches) {
          analysisResult.issues.push({
            type,
            severity,
            description,
            fix,
            occurrences: matches.length,
          });
          if (severity === 'high') analysisResult.codeQuality.score -= 10;
          else if (severity === 'medium') analysisResult.codeQuality.score -= 5;
          else analysisResult.codeQuality.score -= 2;
        }
      });

      // 2. 성능 최적화 기회
      const performancePatterns = [
        {
          pattern: /for\s*\(\s*var\s+\w+\s*=\s*0[^)]*\.length/gi,
          type: 'loop_optimization',
          description: '반복문에서 length를 매번 계산하고 있습니다.',
          fix: 'length를 변수에 저장하여 재사용하세요.',
          impact: 'medium',
        },
        {
          pattern: /\.innerHTML\s*\+=/g,
          type: 'innerhtml_concatenation',
          description: 'innerHTML을 반복적으로 연결하고 있습니다.',
          fix: '배열에 모아서 한 번에 할당하거나 DocumentFragment를 사용하세요.',
          impact: 'high',
        },
        {
          pattern: /querySelectorAll\([^)]+\)\[/g,
          type: 'queryselector_optimization',
          description: 'querySelectorAll 결과를 인덱스로 접근하고 있습니다.',
          fix: 'querySelector를 사용하거나 결과를 배열로 변환하세요.',
          impact: 'low',
        },
      ];

      performancePatterns.forEach(({ pattern, type, description, fix, impact }) => {
        if (pattern.test(code)) {
          analysisResult.optimizations.push({
            type,
            description,
            fix,
            impact,
          });
        }
      });

      // 3. AI를 통한 심층 분석
      const analysisPrompt = `다음 코드를 분석하여 버그, 성능 문제, 코드 품질, 최적화 기회를 찾아주세요:

\`\`\`
${code.substring(0, 5000)} // 최대 5000자
\`\`\`

다음 항목을 분석해주세요:
1. 버그 및 잠재적 오류
2. 성능 최적화 기회
3. 코드 품질 개선 사항
4. 보안 취약점
5. 모범 사례 준수 여부

JSON 형식으로 반환해주세요:
{
  "bugs": [
    {
      "type": "버그 유형",
      "severity": "high|medium|low",
      "description": "설명",
      "line": "대략적인 위치",
      "fix": "수정 방법"
    }
  ],
  "optimizations": [
    {
      "type": "최적화 유형",
      "description": "설명",
      "impact": "high|medium|low",
      "fix": "개선 방법"
    }
  ],
  "codeQuality": {
    "score": 0-100,
    "maintainability": "excellent|good|fair|poor",
    "complexity": "low|medium|high",
    "readability": "excellent|good|fair|poor"
  },
  "suggestions": [
    {
      "type": "제안 유형",
      "description": "설명"
    }
  ]
}`;

      try {
        const aiAnalysis = await aiModelManager.generateWithModel('gemini-pro', analysisPrompt);
        const jsonMatch = aiAnalysis.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            const parsed = JSON.parse(jsonMatch[0]);
            if (parsed.bugs && Array.isArray(parsed.bugs)) {
              analysisResult.issues.push(...parsed.bugs);
            }
            if (parsed.optimizations && Array.isArray(parsed.optimizations)) {
              analysisResult.optimizations.push(...parsed.optimizations);
            }
            if (parsed.codeQuality && typeof parsed.codeQuality === 'object') {
              analysisResult.codeQuality = {
                ...analysisResult.codeQuality,
                ...parsed.codeQuality,
              };
            }
            if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
              analysisResult.suggestions.push(...parsed.suggestions);
            }
          } catch (parseError) {
            console.error('[Debug Analyze] JSON 파싱 오류:', parseError);
            // JSON 파싱 실패 시에도 AI 응답을 제안으로 추가
            analysisResult.suggestions.push({
              type: 'ai_analysis',
              description: 'AI 분석 결과 (구조화되지 않음)',
              content: aiAnalysis.substring(0, 500),
            });
          }
        } else {
          // JSON이 없으면 전체 응답을 제안으로 추가
          analysisResult.suggestions.push({
            type: 'ai_analysis',
            description: 'AI 분석 결과',
            content: aiAnalysis.substring(0, 1000),
          });
        }
      } catch (aiError: any) {
        console.error('[Debug Analyze] AI 분석 오류:', {
          error: aiError.message,
          hasApiKey: !!process.env.GOOGLE_API_KEY,
        });
        // AI 분석 실패해도 기본 분석 결과는 반환
      }
    }

    // 최종 점수 계산
    analysisResult.codeQuality.score = Math.max(0, Math.min(100, analysisResult.codeQuality.score));

    return NextResponse.json(analysisResult);
  } catch (error: any) {
    return NextResponse.json(
      { error: '분석 중 오류가 발생했습니다.', message: error.message },
      { status: 500 }
    );
  }
}

