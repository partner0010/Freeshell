/**
 * 코드 분석 API
 * URL 또는 파일 내용을 받아서 디버깅 수행
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { type, url, content, fileName } = await request.json();

    let code = '';

    // URL 또는 파일 내용 처리
    if (type === 'url') {
      if (!url || typeof url !== 'string') {
        return NextResponse.json(
          { error: 'URL을 입력하세요.' },
          { status: 400 }
        );
      }
      // URL에서 코드 가져오기 (실제로는 fetch로 가져와야 함)
      try {
        const response = await fetch(url);
        code = await response.text();
      } catch (error) {
        return NextResponse.json(
          { error: 'URL에서 코드를 가져올 수 없습니다.' },
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
      code = content;
    } else {
      return NextResponse.json(
        { error: '유효하지 않은 입력 타입입니다.' },
        { status: 400 }
      );
    }

    if (!code.trim()) {
      return NextResponse.json(
        { error: '분석할 코드가 없습니다.' },
        { status: 400 }
      );
    }

    // 코드 분석
    const results: Array<{
      type: 'error' | 'warning' | 'info' | 'success';
      message: string;
      location?: string;
      suggestion?: string;
    }> = [];

    // 기본 검사 (개발 환경에서는 console.log 허용)
    const consoleLogCount = (code.match(/console\.log/g) || []).length;
    const isDevelopmentCode = code.includes('NODE_ENV') || code.includes('development') || code.includes('process.env');
    
    if (consoleLogCount > 0 && !isDevelopmentCode && consoleLogCount > 5) {
      results.push({
        type: 'warning',
        message: `프로덕션 코드에서 console.log가 ${consoleLogCount}개 발견되었습니다.`,
        location: fileName || '코드',
        suggestion: '프로덕션 빌드에서 자동 제거되도록 설정하거나, 개발 환경에서만 사용하도록 조건부로 처리하세요.',
      });
    }

    if (code.includes('eval(')) {
      results.push({
        type: 'error',
        message: 'eval() 사용은 보안 위험이 있습니다.',
        location: fileName || '코드',
        suggestion: 'eval() 대신 JSON.parse() 또는 다른 안전한 방법을 사용하세요.',
      });
    }

    if (code.includes('var ')) {
      results.push({
        type: 'info',
        message: 'var 대신 const 또는 let을 사용하는 것을 권장합니다.',
        location: fileName || '코드',
        suggestion: 'var를 const 또는 let으로 변경하여 스코프 문제를 방지하세요.',
      });
    }

    if (!code.includes('try') && code.includes('await')) {
      results.push({
        type: 'warning',
        message: '비동기 코드에 에러 핸들링이 없습니다.',
        location: fileName || '코드',
        suggestion: 'try-catch 블록을 추가하여 에러를 처리하세요.',
      });
    }

    // 구문 오류 검사 (간단한 예시)
    const openBraces = (code.match(/{/g) || []).length;
    const closeBraces = (code.match(/}/g) || []).length;
    if (openBraces !== closeBraces) {
      results.push({
        type: 'error',
        message: '중괄호가 일치하지 않습니다.',
        location: fileName || '코드',
        suggestion: '모든 중괄호가 올바르게 닫혔는지 확인하세요.',
      });
    }

    // 성공 메시지
    if (results.length === 0) {
      results.push({
        type: 'success',
        message: '코드에 명백한 오류가 발견되지 않았습니다.',
        location: fileName || '코드',
      });
    }

    const result = {
      success: true,
      results,
    };

    // 도메인별 학습 시스템에 상호작용 기록
    try {
      const { domainLearningSystem } = await import('@/lib/ai/domain-specific-learning');
      domainLearningSystem.recordInteraction('debug', {
        action: 'analyze-code',
        input: code,
        output: JSON.stringify(result),
        feedback: undefined,
      });
    } catch (error) {
      console.error('학습 기록 실패:', error);
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('코드 분석 오류:', error);
    return NextResponse.json(
      { error: '코드 분석 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

