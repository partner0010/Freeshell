import { NextRequest, NextResponse } from 'next/server';
import { generateGeminiResponse } from '@/lib/gemini';

/**
 * 실전 AI 콘텐츠 제작 API
 * 유튜브, 블로그, SNS 콘텐츠를 실제로 생성
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, topic, style, length, targetAudience, additionalInfo } = body;

    if (!type || !topic) {
      return NextResponse.json(
        { error: '콘텐츠 유형과 주제는 필수입니다.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GOOGLE_API_KEY가 설정되지 않았습니다. Netlify 환경 변수에서 설정하세요.' },
        { status: 500 }
      );
    }

    // 콘텐츠 유형별 프롬프트 생성
    let prompt = '';
    
    switch (type) {
      case 'youtube-script':
        prompt = `다음 주제로 ${length || '5분'} YouTube 영상 스크립트를 작성해주세요.

주제: ${topic}
스타일: ${style || '캐주얼하고 친근하게'}
대상: ${targetAudience || '일반 시청자'}
${additionalInfo ? `추가 요구사항: ${additionalInfo}` : ''}

다음 형식으로 작성해주세요:
1. 도입부 (15초 이내, 핵심 내용 전달)
2. 본문 (3-5개 섹션으로 구성)
   - 각 섹션별 제목
   - 주요 내용
   - 시각적 요소 제안
3. 마무리 (시청자 참여 유도)

실제로 사용할 수 있는 구체적이고 실용적인 내용으로 작성해주세요.`;
        break;

      case 'blog-post':
        prompt = `다음 주제로 SEO 최적화된 블로그 포스트를 작성해주세요.

주제: ${topic}
스타일: ${style || '전문적이고 읽기 쉽게'}
대상: ${targetAudience || '일반 독자'}
${additionalInfo ? `추가 요구사항: ${additionalInfo}` : ''}

다음 형식으로 작성해주세요:
1. 제목 (SEO 키워드 포함)
2. 메타 설명 (150자 이내)
3. 도입부 (독자의 관심을 끄는 내용)
4. 본문 (H2, H3 제목 포함, 1000-2000자)
   - 각 섹션별 상세 내용
   - 실용적인 팁과 예시
5. 결론 및 CTA (Call to Action)

실제로 게시할 수 있는 완성도 높은 내용으로 작성해주세요.`;
        break;

      case 'sns-post':
        prompt = `다음 주제로 SNS 게시물을 작성해주세요.

주제: ${topic}
스타일: ${style || '간결하고 임팩트 있게'}
대상: ${targetAudience || 'SNS 사용자'}
${additionalInfo ? `추가 요구사항: ${additionalInfo}` : ''}

다음 형식으로 작성해주세요:
1. 메인 텍스트 (200-300자, 이모지 활용)
2. 해시태그 (5-10개, 관련성 높은 것)
3. 인용구 또는 명언 (선택)
4. CTA (참여 유도 문구)

실제로 게시할 수 있는 매력적인 내용으로 작성해주세요.`;
        break;

      case 'instagram-caption':
        prompt = `다음 주제로 Instagram 캡션을 작성해주세요.

주제: ${topic}
스타일: ${style || '트렌디하고 친근하게'}
대상: ${targetAudience || 'Instagram 사용자'}
${additionalInfo ? `추가 요구사항: ${additionalInfo}` : ''}

다음 형식으로 작성해주세요:
1. 첫 줄 (강력한 훅, 이모지 활용)
2. 본문 (스토리텔링, 감성적)
3. 해시태그 (10-20개)
4. CTA

실제로 게시할 수 있는 매력적인 내용으로 작성해주세요.`;
        break;

      case 'twitter-thread':
        prompt = `다음 주제로 Twitter 스레드를 작성해주세요.

주제: ${topic}
스타일: ${style || '간결하고 임팩트 있게'}
대상: ${targetAudience || 'Twitter 사용자'}
${additionalInfo ? `추가 요구사항: ${additionalInfo}` : ''}

다음 형식으로 작성해주세요:
1. 첫 트윗 (강력한 훅)
2. 본문 트윗들 (각 280자 이내, 5-10개)
3. 마지막 트윗 (CTA, 참여 유도)

실제로 게시할 수 있는 매력적인 내용으로 작성해주세요.`;
        break;

      default:
        return NextResponse.json(
          { error: '지원하지 않는 콘텐츠 유형입니다.' },
          { status: 400 }
        );
    }

    // Gemini API 호출
    const content = await generateGeminiResponse(prompt, apiKey);

    return NextResponse.json({
      success: true,
      type,
      topic,
      content,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Content creation error:', error);
    return NextResponse.json(
      {
        error: '콘텐츠 생성 중 오류가 발생했습니다.',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

