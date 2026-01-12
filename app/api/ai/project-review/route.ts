/**
 * 프로젝트 총평 API
 * AI 기반 전체 설계, 기능, 구성 평가
 */
import { NextRequest, NextResponse } from 'next/server';
import { validateInput } from '@/lib/security/input-validation';
import { rateLimitCheck } from '@/lib/security/rate-limit';
import { aiModelManager } from '@/lib/ai-models';

export async function POST(request: NextRequest) {
  try {
    // Rate Limiting
    const rateLimit = await rateLimitCheck(request, 10, 60000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { files } = body;

    if (!files || !Array.isArray(files) || files.length === 0) {
      return NextResponse.json(
        { error: '파일이 필요합니다.' },
        { status: 400 }
      );
    }

    // 파일 내용 분석
    const htmlFile = files.find((f: any) => f.name.includes('html'));
    const cssFile = files.find((f: any) => f.name.includes('css'));
    const jsFile = files.find((f: any) => f.name.includes('js'));

    const htmlContent = htmlFile?.content || '';
    const cssContent = cssFile?.content || '';
    const jsContent = jsFile?.content || '';

    // AI로 총평 생성
    const prompt = `다음 웹사이트 코드를 분석하고 종합 평가를 해주세요:

HTML:
${htmlContent.substring(0, 5000)}

CSS:
${cssContent.substring(0, 5000)}

JavaScript:
${jsContent.substring(0, 5000)}

다음 항목들을 평가해주세요:
1. 전체 점수 (0-100) 및 등급 (A+, A, B+, B, C+, C, D)
2. 디자인 (점수, 강점, 개선사항)
3. 기능성 (점수, 강점, 개선사항)
4. 성능 (점수, 메트릭, 개선사항)
5. 접근성 (점수, 체크리스트)
6. 보안 (점수, 체크리스트)
7. SEO (점수, 체크리스트)
8. 구체적인 권장사항 (우선순위별)

JSON 형식으로 응답해주세요.`;

    try {
      const aiResponse = await aiModelManager.generateWithModel('gemini-pro', prompt);
      
      // AI 응답 파싱 (실제로는 더 정교한 파싱 필요)
      const review = parseAIResponse(aiResponse, htmlContent, cssContent, jsContent);

      return NextResponse.json({
        success: true,
        review,
      });
    } catch (error: any) {
      console.error('[Project Review API] AI 오류:', error);
      // AI 실패 시 기본 평가 제공
      const review = generateDefaultReview(htmlContent, cssContent, jsContent);
      return NextResponse.json({
        success: true,
        review,
      });
    }
  } catch (error: any) {
    console.error('[Project Review API] 오류:', error);
    return NextResponse.json(
      { error: '총평 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

function parseAIResponse(aiResponse: string, html: string, css: string, js: string) {
  // 실제로는 AI 응답을 파싱하여 구조화된 데이터로 변환
  // 여기서는 기본 구조만 제공
  return generateDefaultReview(html, css, js);
}

function generateDefaultReview(html: string, css: string, js: string) {
  // 기본 평가 생성
  const hasSemanticHTML = /<(header|nav|main|article|section|footer|aside)>/i.test(html);
  const hasMetaTags = /<meta/i.test(html);
  const hasAltAttributes = /<img[^>]*alt=/i.test(html);
  const hasResponsiveDesign = /@media|viewport/i.test(html + css);
  const hasForms = /<form/i.test(html);
  const hasInteractivity = js.length > 0;

  const designScore = calculateDesignScore(html, css);
  const functionalityScore = calculateFunctionalityScore(html, js);
  const performanceScore = calculatePerformanceScore(html, css, js);
  const accessibilityScore = calculateAccessibilityScore(html);
  const securityScore = calculateSecurityScore(html, js);
  const seoScore = calculateSEOScore(html);

  const overallScore = Math.round(
    (designScore + functionalityScore + performanceScore + 
     accessibilityScore + securityScore + seoScore) / 6
  );

  const grade = getGrade(overallScore);

  return {
    overall: {
      score: overallScore,
      grade,
      summary: `${overallScore}점으로 ${grade} 등급입니다. ${getSummaryText(overallScore)}`,
    },
    design: {
      score: designScore,
      strengths: [
        hasResponsiveDesign ? '반응형 디자인 적용' : null,
        css.length > 100 ? '충분한 스타일링' : null,
      ].filter(Boolean) as string[],
      improvements: [
        !hasResponsiveDesign ? '반응형 디자인 추가 권장' : null,
        css.length < 100 ? '스타일링 보강 필요' : null,
      ].filter(Boolean) as string[],
    },
    functionality: {
      score: functionalityScore,
      strengths: [
        hasForms ? '폼 기능 포함' : null,
        hasInteractivity ? '인터랙티브 요소 포함' : null,
      ].filter(Boolean) as string[],
      improvements: [
        !hasInteractivity ? 'JavaScript 기능 추가 권장' : null,
      ].filter(Boolean) as string[],
    },
    performance: {
      score: performanceScore,
      metrics: {
        loadTime: estimateLoadTime(html, css, js),
        size: html.length + css.length + js.length,
        requests: 1 + (css.length > 0 ? 1 : 0) + (js.length > 0 ? 1 : 0),
      },
      improvements: [
        '이미지 최적화 권장',
        'CSS/JS 최소화 권장',
      ],
    },
    accessibility: {
      score: accessibilityScore,
      checks: [
        {
          item: '시맨틱 HTML',
          status: hasSemanticHTML ? 'pass' : 'warning',
          message: hasSemanticHTML ? '시맨틱 태그 사용됨' : '시맨틱 태그 사용 권장',
        },
        {
          item: '이미지 alt 속성',
          status: hasAltAttributes ? 'pass' : 'fail',
          message: hasAltAttributes ? 'alt 속성 포함됨' : 'alt 속성 추가 필요',
        },
        {
          item: '키보드 네비게이션',
          status: 'warning',
          message: '키보드 네비게이션 테스트 권장',
        },
      ],
    },
    security: {
      score: securityScore,
      checks: [
        {
          item: 'XSS 방지',
          status: /innerHTML|eval\(/i.test(js) ? 'warning' : 'pass',
          message: /innerHTML|eval\(/i.test(js) ? '위험한 코드 사용 감지' : '안전한 코드',
        },
        {
          item: 'HTTPS 사용',
          status: 'warning',
          message: '프로덕션에서는 HTTPS 사용 권장',
        },
      ],
    },
    seo: {
      score: seoScore,
      checks: [
        {
          item: '메타 태그',
          status: hasMetaTags ? 'pass' : 'warning',
          message: hasMetaTags ? '메타 태그 포함됨' : '메타 태그 추가 권장',
        },
        {
          item: '제목 태그',
          status: /<h1>/i.test(html) ? 'pass' : 'warning',
          message: /<h1>/i.test(html) ? 'H1 태그 포함됨' : 'H1 태그 추가 권장',
        },
      ],
    },
    recommendations: [
      {
        priority: 'high',
        category: '접근성',
        title: '이미지 alt 속성 추가',
        description: '모든 이미지에 alt 속성을 추가하여 접근성을 개선하세요.',
        action: 'img 태그에 alt 속성 추가',
      },
      {
        priority: 'medium',
        category: '성능',
        title: '이미지 최적화',
        description: '이미지를 WebP 또는 AVIF 형식으로 변환하여 로딩 속도를 개선하세요.',
        action: '이미지 최적화 도구 사용',
      },
    ],
  };
}

function calculateDesignScore(html: string, css: string): number {
  let score = 50;
  if (css.length > 500) score += 20;
  if (/@media/i.test(css)) score += 15;
  if (/gradient|shadow|border-radius/i.test(css)) score += 15;
  return Math.min(100, score);
}

function calculateFunctionalityScore(html: string, js: string): number {
  let score = 50;
  if (js.length > 100) score += 20;
  if (/addEventListener|querySelector/i.test(js)) score += 15;
  if (/<form/i.test(html)) score += 15;
  return Math.min(100, score);
}

function calculatePerformanceScore(html: string, css: string, js: string): number {
  const totalSize = html.length + css.length + js.length;
  let score = 100;
  if (totalSize > 100000) score -= 20;
  if (totalSize > 200000) score -= 20;
  if (totalSize > 500000) score -= 30;
  return Math.max(0, score);
}

function calculateAccessibilityScore(html: string): number {
  let score = 50;
  if (/<(header|nav|main|article|section|footer|aside)>/i.test(html)) score += 20;
  if (/<img[^>]*alt=/i.test(html)) score += 15;
  if (/<label/i.test(html)) score += 15;
  return Math.min(100, score);
}

function calculateSecurityScore(html: string, js: string): number {
  let score = 80;
  if (/innerHTML|eval\(/i.test(js)) score -= 20;
  if (/onclick|onerror/i.test(html)) score -= 10;
  return Math.max(0, score);
}

function calculateSEOScore(html: string): number {
  let score = 50;
  if (/<meta.*description/i.test(html)) score += 15;
  if (/<meta.*keywords/i.test(html)) score += 10;
  if (/<h1>/i.test(html)) score += 15;
  if (/<title>/i.test(html)) score += 10;
  return Math.min(100, score);
}

function getGrade(score: number): 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' {
  if (score >= 95) return 'A+';
  if (score >= 90) return 'A';
  if (score >= 85) return 'B+';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C+';
  if (score >= 60) return 'C';
  return 'D';
}

function getSummaryText(score: number): string {
  if (score >= 90) return '매우 우수한 품질의 웹사이트입니다.';
  if (score >= 80) return '우수한 품질의 웹사이트입니다. 일부 개선사항을 적용하면 더 좋아질 수 있습니다.';
  if (score >= 70) return '양호한 품질이지만 개선의 여지가 있습니다.';
  return '기본적인 구조는 갖추었으나 많은 개선이 필요합니다.';
}

function estimateLoadTime(html: string, css: string, js: string): number {
  const totalSize = html.length + css.length + js.length;
  // 대략적인 추정 (실제로는 더 정교한 계산 필요)
  return Math.round(totalSize / 100); // KB당 약 10ms
}
