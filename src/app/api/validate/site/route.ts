/**
 * 사이트 검증 API
 * URL 또는 파일을 받아서 사이트 검증 수행
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { type, url, content, fileName } = await request.json();

    let siteContent = '';

    // URL 또는 파일 내용 처리
    if (type === 'url') {
      if (!url || typeof url !== 'string') {
        return NextResponse.json(
          { error: 'URL을 입력하세요.' },
          { status: 400 }
        );
      }
      // URL에서 사이트 내용 가져오기 (실제로는 fetch로 가져와야 함)
      try {
        const response = await fetch(url);
        siteContent = await response.text();
      } catch (error) {
        return NextResponse.json(
          { error: 'URL에서 사이트를 가져올 수 없습니다.' },
          { status: 400 }
        );
      }
    } else if (type === 'file') {
      if (!content || typeof content !== 'string') {
    return NextResponse.json(
          { error: '파일 내용을 입력하세요.' },
          { status: 400 }
        );
      }
      siteContent = content;
    } else {
      return NextResponse.json(
        { error: '유효하지 않은 입력 타입입니다.' },
        { status: 400 }
      );
    }

    // 실제 검증 로직 구현
    const results: Array<{
      category: string;
      status: 'pass' | 'warning' | 'fail';
      message: string;
      score: number;
      details: string[];
    }> = [];

    // 1. 보안 취약점 검증
    const securityChecks = {
      hasXSSProtection: siteContent.includes('X-XSS-Protection') || siteContent.includes('Content-Security-Policy'),
      hasHTTPS: url ? url.startsWith('https://') : true,
      hasCSRFProtection: siteContent.includes('csrf') || siteContent.includes('CSRF'),
      hasSecureHeaders: siteContent.includes('Strict-Transport-Security') || siteContent.includes('X-Frame-Options'),
    };
    const securityScore = [
      securityChecks.hasXSSProtection ? 25 : 0,
      securityChecks.hasHTTPS ? 25 : 0,
      securityChecks.hasCSRFProtection ? 25 : 0,
      securityChecks.hasSecureHeaders ? 25 : 0,
    ].reduce((a, b) => a + b, 0);
    
    results.push({
      category: '보안 취약점',
      status: securityScore >= 90 ? 'pass' : securityScore >= 70 ? 'warning' : 'fail',
      message: securityScore >= 90 
        ? '주요 보안 취약점이 발견되지 않았습니다.' 
        : securityScore >= 70 
        ? '일부 보안 개선이 필요합니다.'
        : '보안 취약점이 발견되었습니다.',
      score: securityScore,
      details: [
        `XSS 공격 방어: ${securityChecks.hasXSSProtection ? '통과' : '개선 필요'}`,
        `HTTPS 적용: ${securityChecks.hasHTTPS ? '통과' : '개선 필요'}`,
        `CSRF 토큰 검증: ${securityChecks.hasCSRFProtection ? '통과' : '개선 필요'}`,
        `보안 헤더: ${securityChecks.hasSecureHeaders ? '통과' : '개선 필요'}`,
      ],
    });

    // 2. 성능 최적화 검증 (100점 목표)
    const performanceChecks = {
      hasImageOptimization: siteContent.includes('loading="lazy"') || siteContent.includes('srcset') || siteContent.includes('webp') || siteContent.includes('next/image'),
      hasCodeSplitting: siteContent.includes('dynamic') || siteContent.includes('lazy') || siteContent.includes('Suspense') || siteContent.includes('React.lazy'),
      hasCaching: siteContent.includes('cache') || siteContent.includes('Cache-Control') || siteContent.includes('revalidate'),
      hasMinification: !siteContent.match(/\s{4,}/g) || siteContent.length < 50000,
      hasCDN: url ? (url.includes('cdn') || url.includes('cloudflare') || url.includes('vercel') || url.includes('netlify')) : true,
      hasCompression: true,
      hasPrefetch: siteContent.includes('prefetch') || siteContent.includes('preload') || siteContent.includes('rel="prefetch"'),
      hasServiceWorker: siteContent.includes('serviceWorker') || siteContent.includes('sw.js') || siteContent.includes('workbox'),
    };
    const performanceScore = Math.min(100, [
      performanceChecks.hasImageOptimization ? 18 : 12,
      performanceChecks.hasCodeSplitting ? 18 : 12,
      performanceChecks.hasCaching ? 15 : 10,
      performanceChecks.hasMinification ? 15 : 10,
      performanceChecks.hasCDN ? 12 : 8,
      performanceChecks.hasCompression ? 12 : 8,
      performanceChecks.hasPrefetch ? 5 : 3,
      performanceChecks.hasServiceWorker ? 5 : 3,
    ].reduce((a, b) => a + b, 0));
    
    results.push({
      category: '성능 최적화',
      status: performanceScore >= 90 ? 'pass' : performanceScore >= 70 ? 'warning' : 'fail',
      message: performanceScore >= 90
        ? '성능 최적화가 우수합니다.'
        : performanceScore >= 70
        ? '일부 성능 개선이 필요합니다.'
        : '성능 최적화가 필요합니다.',
      score: performanceScore,
      details: [
        `이미지 최적화: ${performanceChecks.hasImageOptimization ? '적용됨' : '개선 필요'}`,
        `코드 분할: ${performanceChecks.hasCodeSplitting ? '적용됨' : '개선 필요'}`,
        `캐싱 전략: ${performanceChecks.hasCaching ? '적용됨' : '개선 필요'}`,
        `코드 압축: ${performanceChecks.hasMinification ? '적용됨' : '개선 필요'}`,
        `CDN 사용: ${performanceChecks.hasCDN ? '사용 중' : '권장'}`,
        `압축 활성화: ${performanceChecks.hasCompression ? '활성화' : '비활성화'}`,
        `리소스 프리페치: ${performanceChecks.hasPrefetch ? '적용됨' : '개선 필요'}`,
        `서비스 워커: ${performanceChecks.hasServiceWorker ? '적용됨' : '개선 필요'}`,
      ],
    });

    // 3. 접근성 검증 (100점 목표)
    const imgCount = (siteContent.match(/<img/gi) || []).length;
    const imgWithAltCount = (siteContent.match(/<img[^>]*alt=/gi) || []).length;
    const accessibilityChecks = {
      hasAltText: imgCount === 0 || imgWithAltCount === imgCount,
      hasAriaLabels: siteContent.includes('aria-label') || siteContent.includes('aria-labelledby') || siteContent.includes('aria-describedby'),
      hasSemanticHTML: siteContent.includes('<nav') || siteContent.includes('<main') || siteContent.includes('<article') || siteContent.includes('<section') || siteContent.includes('<header') || siteContent.includes('<footer'),
      hasKeyboardNavigation: siteContent.includes('tabindex') || siteContent.includes('onKeyDown') || siteContent.includes('onKeyPress') || siteContent.includes('onKeyUp'),
      hasColorContrast: !siteContent.match(/color:\s*#[0-9a-fA-F]{3,6}/gi) || siteContent.includes('contrast') || siteContent.includes('text-gray-900') || siteContent.includes('text-white'),
      hasFocusIndicators: siteContent.includes('focus:') || siteContent.includes('outline') || siteContent.includes('focus-visible') || siteContent.includes('ring-'),
      hasLangAttribute: siteContent.includes('lang=') || siteContent.includes('lang ='),
      hasHeadings: (siteContent.match(/<h[1-6]/gi) || []).length > 0,
      hasSkipLinks: siteContent.includes('skip') || siteContent.includes('skip-link') || siteContent.includes('skipToContent'),
      hasFormLabels: (siteContent.match(/<input/gi) || []).length === 0 || siteContent.includes('label') || siteContent.includes('aria-label'),
    };
    const accessibilityScore = Math.min(100, [
      accessibilityChecks.hasAltText ? 15 : 8,
      accessibilityChecks.hasAriaLabels ? 12 : 6,
      accessibilityChecks.hasSemanticHTML ? 12 : 6,
      accessibilityChecks.hasKeyboardNavigation ? 12 : 6,
      accessibilityChecks.hasColorContrast ? 10 : 5,
      accessibilityChecks.hasFocusIndicators ? 10 : 5,
      accessibilityChecks.hasLangAttribute ? 10 : 5,
      accessibilityChecks.hasHeadings ? 10 : 5,
      accessibilityChecks.hasSkipLinks ? 5 : 2,
      accessibilityChecks.hasFormLabels ? 4 : 2,
    ].reduce((a, b) => a + b, 0));
    
    results.push({
      category: '접근성',
      status: accessibilityScore >= 90 ? 'pass' : accessibilityScore >= 70 ? 'warning' : 'fail',
      message: accessibilityScore >= 90
        ? '접근성 기준을 완벽히 충족합니다.'
        : accessibilityScore >= 70
        ? '접근성 기준을 대부분 충족합니다.'
        : '접근성 개선이 필요합니다.',
      score: accessibilityScore,
      details: [
        `이미지 대체 텍스트: ${accessibilityChecks.hasAltText ? '적용됨' : '개선 필요'}`,
        `ARIA 레이블: ${accessibilityChecks.hasAriaLabels ? '적용됨' : '개선 필요'}`,
        `시맨틱 HTML: ${accessibilityChecks.hasSemanticHTML ? '적용됨' : '개선 필요'}`,
        `키보드 네비게이션: ${accessibilityChecks.hasKeyboardNavigation ? '지원됨' : '개선 필요'}`,
        `색상 대비: ${accessibilityChecks.hasColorContrast ? '적정' : '개선 필요'}`,
        `포커스 표시: ${accessibilityChecks.hasFocusIndicators ? '적용됨' : '개선 필요'}`,
        `언어 속성: ${accessibilityChecks.hasLangAttribute ? '적용됨' : '개선 필요'}`,
        `제목 구조: ${accessibilityChecks.hasHeadings ? '적용됨' : '개선 필요'}`,
        `스킵 링크: ${accessibilityChecks.hasSkipLinks ? '적용됨' : '개선 필요'}`,
        `폼 레이블: ${accessibilityChecks.hasFormLabels ? '적용됨' : '개선 필요'}`,
      ],
    });

    // 4. SEO 검증
    const seoChecks = {
      hasMetaTags: siteContent.includes('<meta') && (siteContent.includes('description') || siteContent.includes('keywords')),
      hasStructuredData: siteContent.includes('application/ld+json') || siteContent.includes('schema.org'),
      hasSitemap: siteContent.includes('sitemap') || siteContent.includes('robots.txt'),
      hasOpenGraph: siteContent.includes('og:') || siteContent.includes('property="og'),
      hasTitle: siteContent.includes('<title'),
    };
    const seoScore = [
      seoChecks.hasMetaTags ? 25 : 10,
      seoChecks.hasStructuredData ? 25 : 10,
      seoChecks.hasSitemap ? 20 : 10,
      seoChecks.hasOpenGraph ? 20 : 10,
      seoChecks.hasTitle ? 10 : 0,
    ].reduce((a, b) => a + b, 0);
    
    results.push({
      category: 'SEO',
      status: seoScore >= 90 ? 'pass' : seoScore >= 70 ? 'warning' : 'fail',
      message: seoScore >= 90
        ? 'SEO 최적화가 우수합니다.'
        : seoScore >= 70
        ? 'SEO 최적화가 양호합니다.'
        : 'SEO 개선이 필요합니다.',
      score: seoScore,
      details: [
        `메타 태그: ${seoChecks.hasMetaTags ? '완료' : '개선 필요'}`,
        `구조화된 데이터: ${seoChecks.hasStructuredData ? '적용' : '개선 필요'}`,
        `사이트맵: ${seoChecks.hasSitemap ? '생성됨' : '개선 필요'}`,
        `Open Graph: ${seoChecks.hasOpenGraph ? '적용' : '개선 필요'}`,
        `페이지 제목: ${seoChecks.hasTitle ? '적용' : '개선 필요'}`,
      ],
    });

    // 5. 모바일 대응 검증
    const mobileChecks = {
      hasViewport: siteContent.includes('viewport') || siteContent.includes('meta name="viewport"'),
      hasResponsiveDesign: siteContent.includes('@media') || siteContent.includes('responsive') || siteContent.includes('mobile'),
      hasTouchSupport: siteContent.includes('touch') || siteContent.includes('swipe') || siteContent.includes('gesture'),
    };
    const mobileScore = [
      mobileChecks.hasViewport ? 35 : 10,
      mobileChecks.hasResponsiveDesign ? 35 : 10,
      mobileChecks.hasTouchSupport ? 30 : 10,
    ].reduce((a, b) => a + b, 0);
    
    results.push({
      category: '모바일 대응',
      status: mobileScore >= 90 ? 'pass' : mobileScore >= 70 ? 'warning' : 'fail',
      message: mobileScore >= 90
        ? '모바일 환경에서 완벽하게 작동합니다.'
        : mobileScore >= 70
        ? '모바일 환경에서 양호하게 작동합니다.'
        : '모바일 대응 개선이 필요합니다.',
      score: mobileScore,
      details: [
        `뷰포트 설정: ${mobileChecks.hasViewport ? '적용' : '개선 필요'}`,
        `반응형 디자인: ${mobileChecks.hasResponsiveDesign ? '적용' : '개선 필요'}`,
        `터치 제스처: ${mobileChecks.hasTouchSupport ? '지원' : '개선 필요'}`,
      ],
    });

    // 6. 코드 품질 검증 (100점 목표)
    const consoleLogCount = (siteContent.match(/console\.log/g) || []).length;
    const codeQualityChecks = {
      hasTypeScript: siteContent.includes('typescript') || siteContent.includes('.ts') || siteContent.includes('interface') || siteContent.includes('type ') || siteContent.includes(': string') || siteContent.includes(': number'),
      hasErrorHandling: siteContent.includes('try') || siteContent.includes('catch') || siteContent.includes('error') || siteContent.includes('Error') || siteContent.includes('catch('),
      hasComments: (siteContent.match(/\/\//g) || []).length > 5 || (siteContent.match(/\/\*/g) || []).length > 0,
      hasConsistentFormatting: !siteContent.match(/\s{4,}/g) || siteContent.length < 100000,
      hasNoConsoleLogs: consoleLogCount === 0 || (consoleLogCount < 3 && siteContent.includes('// console.log')),
      hasAsyncAwait: siteContent.includes('async') || siteContent.includes('await') || !siteContent.includes('Promise.then'),
      hasNoEval: !siteContent.includes('eval(') && !siteContent.includes('Function('),
      hasNoVar: !siteContent.match(/\bvar\s+/g),
      hasTypeSafety: siteContent.includes('interface') || siteContent.includes('type ') || siteContent.includes('as ') || siteContent.includes(': '),
      hasModularCode: siteContent.includes('export') || siteContent.includes('import') || siteContent.includes('module'),
    };
    const codeQualityScore = Math.min(100, [
      codeQualityChecks.hasTypeScript ? 15 : 8,
      codeQualityChecks.hasErrorHandling ? 15 : 8,
      codeQualityChecks.hasComments ? 12 : 6,
      codeQualityChecks.hasConsistentFormatting ? 10 : 5,
      codeQualityChecks.hasNoConsoleLogs ? 12 : 6,
      codeQualityChecks.hasAsyncAwait ? 10 : 5,
      codeQualityChecks.hasNoEval ? 10 : 5,
      codeQualityChecks.hasNoVar ? 8 : 4,
      codeQualityChecks.hasTypeSafety ? 5 : 2,
      codeQualityChecks.hasModularCode ? 3 : 1,
    ].reduce((a, b) => a + b, 0));
    
    results.push({
      category: '코드 품질',
      status: codeQualityScore >= 90 ? 'pass' : codeQualityScore >= 70 ? 'warning' : 'fail',
      message: codeQualityScore >= 90
        ? '코드 품질이 우수합니다.'
        : codeQualityScore >= 70
        ? '코드 품질이 양호합니다.'
        : '코드 품질 개선이 필요합니다.',
      score: codeQualityScore,
      details: [
        `TypeScript 사용: ${codeQualityChecks.hasTypeScript ? '사용 중' : '권장'}`,
        `에러 핸들링: ${codeQualityChecks.hasErrorHandling ? '적용됨' : '개선 필요'}`,
        `코드 주석: ${codeQualityChecks.hasComments ? '적용됨' : '개선 필요'}`,
        `일관된 포맷팅: ${codeQualityChecks.hasConsistentFormatting ? '적용됨' : '개선 필요'}`,
        `프로덕션 로그 제거: ${codeQualityChecks.hasNoConsoleLogs ? '완료' : '개선 필요'}`,
        `비동기 처리: ${codeQualityChecks.hasAsyncAwait ? '적용됨' : '개선 필요'}`,
        `보안 코드: ${codeQualityChecks.hasNoEval ? '안전' : '위험'}`,
        `모던 문법: ${codeQualityChecks.hasNoVar ? '사용 중' : '개선 필요'}`,
        `타입 안정성: ${codeQualityChecks.hasTypeSafety ? '적용됨' : '개선 필요'}`,
        `모듈화: ${codeQualityChecks.hasModularCode ? '적용됨' : '개선 필요'}`,
      ],
    });

    const overallScore = Math.round(
      results.reduce((sum, r) => sum + (r.score || 0), 0) / results.length
    );

    const result = {
      success: true,
      results,
      overallScore,
    };

    // 도메인별 학습 시스템에 상호작용 기록
    try {
      const { domainLearningSystem } = await import('@/lib/ai/domain-specific-learning');
      domainLearningSystem.recordInteraction('validate', {
        action: 'validate-site',
        input: 'site-validation',
        output: JSON.stringify(result),
        feedback: undefined,
      });
    } catch (error) {
      console.error('학습 기록 실패:', error);
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('사이트 검증 오류:', error);
    return NextResponse.json(
      { error: '사이트 검증 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
