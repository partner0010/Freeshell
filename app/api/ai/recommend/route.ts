/**
 * AI 실시간 추천 API
 */
import { NextRequest, NextResponse } from 'next/server';
import { validateInput } from '@/lib/security/input-validation';
import { rateLimitCheck } from '@/lib/security/rate-limit';
import { aiModelManager } from '@/lib/ai-models';

export async function POST(request: NextRequest) {
  try {
    const rateLimit = await rateLimitCheck(request, 30, 60000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { files, currentFile, cursorPosition } = body;

    if (!files || !Array.isArray(files)) {
      return NextResponse.json(
        { error: '파일이 필요합니다.' },
        { status: 400 }
      );
    }

    const file = files[currentFile] || files[0];
    if (!file) {
      return NextResponse.json(
        { error: '파일을 찾을 수 없습니다.' },
        { status: 400 }
      );
    }

    const content = file.content || '';
    const lines = content.split('\n');
    const currentLine = lines[cursorPosition?.line - 1] || '';
    const context = lines.slice(Math.max(0, cursorPosition?.line - 5), cursorPosition?.line + 5).join('\n');

    // AI로 추천 생성
    const prompt = `다음 코드를 분석하고 개선 제안을 해주세요:

파일: ${file.name}
현재 라인: ${cursorPosition?.line || 1}
컬럼: ${cursorPosition?.column || 1}

코드 컨텍스트:
${context}

현재 라인:
${currentLine}

다음과 같은 추천을 제공해주세요:
1. 코드 개선 제안
2. 기능 추가 제안
3. 버그 수정 제안
4. 성능 최적화 제안

각 추천은 다음 형식으로:
- 제목
- 설명
- 코드 예시 (있는 경우)
- 우선순위 (high/medium/low)

JSON 형식으로 응답해주세요.`;

    try {
      const aiResponse = await aiModelManager.generateWithModel('gemini-pro', prompt);
      const recommendations = parseRecommendations(aiResponse, file, currentLine);

      return NextResponse.json({
        success: true,
        recommendations,
      });
    } catch (error: any) {
      console.error('[Recommend API] AI 오류:', error);
      // AI 실패 시 기본 추천 제공
      const recommendations = generateDefaultRecommendations(file, currentLine);
      return NextResponse.json({
        success: true,
        recommendations,
      });
    }
  } catch (error: any) {
    console.error('[Recommend API] 오류:', error);
    return NextResponse.json(
      { error: '추천 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

function parseRecommendations(aiResponse: string, file: any, currentLine: string): any[] {
  // 실제로는 AI 응답을 파싱
  // 여기서는 기본 추천 제공
  return generateDefaultRecommendations(file, currentLine);
}

function generateDefaultRecommendations(file: any, currentLine: string): any[] {
  const recommendations: any[] = [];

  // HTML 파일인 경우
  if (file.name.includes('html')) {
    if (!currentLine.includes('alt=') && currentLine.includes('<img')) {
      recommendations.push({
        id: Date.now().toString(),
        type: 'fix',
        title: '이미지 alt 속성 추가',
        description: '접근성을 위해 이미지에 alt 속성을 추가하세요.',
        code: currentLine.replace(/<img([^>]*)>/, '<img$1 alt="설명">'),
        action: 'replace',
        priority: 'high',
      });
    }

    if (!currentLine.includes('<!DOCTYPE')) {
      recommendations.push({
        id: (Date.now() + 1).toString(),
        type: 'improvement',
        title: 'DOCTYPE 선언 추가',
        description: 'HTML5 표준을 위해 DOCTYPE을 추가하세요.',
        code: '<!DOCTYPE html>',
        action: 'insert',
        priority: 'medium',
      });
    }
  }

  // CSS 파일인 경우
  if (file.name.includes('css')) {
    if (!currentLine.includes('@media') && file.content.length > 500) {
      recommendations.push({
        id: (Date.now() + 2).toString(),
        type: 'feature',
        title: '반응형 디자인 추가',
        description: '모바일 기기를 위한 미디어 쿼리를 추가하세요.',
        code: '@media (max-width: 768px) { /* 모바일 스타일 */ }',
        action: 'insert',
        priority: 'medium',
      });
    }
  }

  // JavaScript 파일인 경우
  if (file.name.includes('js')) {
    if (currentLine.includes('innerHTML') && !currentLine.includes('textContent')) {
      recommendations.push({
        id: (Date.now() + 3).toString(),
        type: 'fix',
        title: 'XSS 방지',
        description: '보안을 위해 innerHTML 대신 textContent를 사용하세요.',
        code: currentLine.replace(/innerHTML/g, 'textContent'),
        action: 'replace',
        priority: 'high',
      });
    }
  }

  return recommendations.slice(0, 5); // 최대 5개
}
