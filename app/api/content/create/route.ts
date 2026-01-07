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

    // 환경 변수에서 API 키 로드
    const apiKey = typeof process !== 'undefined' && process.env ? process.env.GOOGLE_API_KEY : '';
    
    if (!apiKey || apiKey.trim() === '') {
      console.warn('[Content Create] GOOGLE_API_KEY가 설정되지 않았습니다.');
      return NextResponse.json(
        { error: 'GOOGLE_API_KEY가 설정되지 않았습니다. Netlify 환경 변수에서 설정하세요.' },
        { status: 500 }
      );
    }
    
    console.log('[Content Create] API 키 확인됨:', apiKey.substring(0, 10) + '...');

    // 콘텐츠 유형별 프롬프트 생성 (더 구체적이고 강력하게)
    let prompt = '';
    
    switch (type) {
      case 'youtube-script':
        prompt = `당신은 전문 유튜브 스크립트 작가입니다. 다음 주제로 ${length || '5분'} YouTube 영상 스크립트를 작성해주세요.

**주제**: ${topic}
**스타일**: ${style || '캐주얼하고 친근하게'}
**대상 시청자**: ${targetAudience || '일반 시청자'}
${additionalInfo ? `**추가 요구사항**: ${additionalInfo}` : ''}

**중요 지침**:
- 실제로 사용할 수 있는 완전한 스크립트를 작성하세요
- 구체적인 내용과 예시를 포함하세요
- 시청자의 관심을 끄는 매력적인 내용으로 작성하세요
- 단순히 요청을 반복하지 말고 실제 콘텐츠를 제공하세요

**필수 구성 요소**:
1. **도입부 (15초 이내)**
   - 강력한 훅 (시청자의 관심을 즉시 끄는 문구)
   - 영상의 핵심 내용 미리보기
   - 시청자에게 약속하는 가치

2. **본문 (3-5개 섹션)**
   각 섹션마다:
   - 명확한 제목
   - 상세한 설명과 예시
   - 실용적인 팁이나 조언
   - 시각적 요소 제안 (B-roll, 그래픽 등)
   - 전환 문구 (다음 섹션으로 자연스럽게 연결)

3. **마무리**
   - 핵심 내용 요약
   - 시청자 참여 유도 (좋아요, 구독, 댓글)
   - 다음 영상 예고 또는 관련 콘텐츠 제안

지금 바로 완전한 스크립트를 작성해주세요.`;
        break;

      case 'blog-post':
        prompt = `당신은 전문 블로그 작가이자 SEO 전문가입니다. 다음 주제로 SEO 최적화된 블로그 포스트를 작성해주세요.

**주제**: ${topic}
**스타일**: ${style || '전문적이고 읽기 쉽게'}
**대상 독자**: ${targetAudience || '일반 독자'}
${additionalInfo ? `**추가 요구사항**: ${additionalInfo}` : ''}

**중요 지침**:
- 실제로 게시할 수 있는 완전한 블로그 포스트를 작성하세요
- SEO 키워드를 자연스럽게 포함하세요
- 독자에게 실질적인 가치를 제공하세요
- 단순히 요청을 반복하지 말고 실제 콘텐츠를 제공하세요

**필수 구성 요소**:
1. **제목** (SEO 키워드 포함, 50자 이내, 클릭을 유도하는 문구)
2. **메타 설명** (150자 이내, 검색 결과에 표시될 설명)
3. **도입부** (200-300자)
   - 독자의 관심을 끄는 문구
   - 문제 제시 또는 질문
   - 글에서 다룰 내용 미리보기

4. **본문** (1000-2000자, H2, H3 제목 포함)
   - 각 섹션별 상세하고 구체적인 내용
   - 실용적인 팁, 예시, 사례 연구
   - 데이터나 통계 (가능한 경우)
   - 단계별 가이드 (해당되는 경우)
   - 이미지나 인포그래픽 제안

5. **결론** (200-300자)
   - 핵심 내용 요약
   - 독자에게 행동을 유도하는 CTA

지금 바로 완전한 블로그 포스트를 작성해주세요.`;
        break;

      case 'sns-post':
        prompt = `당신은 전문 SNS 마케터입니다. 다음 주제로 SNS 게시물을 작성해주세요.

**주제**: ${topic}
**스타일**: ${style || '간결하고 임팩트 있게'}
**대상**: ${targetAudience || 'SNS 사용자'}
${additionalInfo ? `**추가 요구사항**: ${additionalInfo}` : ''}

**중요 지침**:
- 실제로 게시할 수 있는 완전한 게시물을 작성하세요
- 첫 문장이 강력해야 합니다 (스크롤을 멈추게 함)
- 이모지를 적절히 활용하세요
- 단순히 요청을 반복하지 말고 실제 콘텐츠를 제공하세요

**필수 구성 요소**:
1. **메인 텍스트** (200-300자)
   - 강력한 첫 문장 (훅)
   - 핵심 메시지 전달
   - 스토리텔링 또는 인사이트
   - 이모지로 시각적 효과

2. **해시태그** (5-10개)
   - 관련성 높은 해시태그
   - 트렌딩 해시태그 (가능한 경우)
   - 브랜드 해시태그 (해당되는 경우)

3. **CTA** (참여 유도 문구)
   - 댓글, 공유, 좋아요 유도
   - 질문으로 참여 유도

지금 바로 완전한 SNS 게시물을 작성해주세요.`;
        break;

      case 'instagram-caption':
        prompt = `당신은 전문 Instagram 인플루언서입니다. 다음 주제로 Instagram 캡션을 작성해주세요.

**주제**: ${topic}
**스타일**: ${style || '트렌디하고 친근하게'}
**대상**: ${targetAudience || 'Instagram 사용자'}
${additionalInfo ? `**추가 요구사항**: ${additionalInfo}` : ''}

**중요 지침**:
- 실제로 게시할 수 있는 완전한 캡션을 작성하세요
- 첫 줄이 강력해야 합니다 (스토리를 열어야 함)
- 감성적이고 스토리텔링 방식으로 작성하세요
- 단순히 요청을 반복하지 말고 실제 콘텐츠를 제공하세요

**필수 구성 요소**:
1. **첫 줄** (강력한 훅, 이모지 활용)
   - 시선을 끄는 문구
   - 호기심을 자극하는 질문 또는 명언

2. **본문** (스토리텔링, 감성적)
   - 개인적인 경험이나 이야기
   - 감정을 자극하는 내용
   - 가치 있는 인사이트나 팁
   - 줄바꿈으로 가독성 향상

3. **해시태그** (10-20개)
   - 관련성 높은 해시태그
   - 트렌딩 해시태그
   - 니치 해시태그

4. **CTA**
   - 댓글이나 DM 유도
   - 저장 또는 공유 유도

지금 바로 완전한 Instagram 캡션을 작성해주세요.`;
        break;

      case 'twitter-thread':
        prompt = `당신은 전문 Twitter 콘텐츠 크리에이터입니다. 다음 주제로 Twitter 스레드를 작성해주세요.

**주제**: ${topic}
**스타일**: ${style || '간결하고 임팩트 있게'}
**대상**: ${targetAudience || 'Twitter 사용자'}
${additionalInfo ? `**추가 요구사항**: ${additionalInfo}` : ''}

**중요 지침**:
- 실제로 게시할 수 있는 완전한 스레드를 작성하세요
- 각 트윗은 280자 이내로 작성하세요
- 각 트윗은 독립적으로도 읽을 수 있어야 합니다
- 단순히 요청을 반복하지 말고 실제 콘텐츠를 제공하세요

**필수 구성 요소**:
1. **첫 트윗** (강력한 훅)
   - 시선을 끄는 문구
   - 스레드의 핵심 내용 미리보기
   - "🧵" 이모지로 스레드임을 표시

2. **본문 트윗들** (각 280자 이내, 5-10개)
   - 각 트윗마다 하나의 핵심 포인트
   - 번호를 매겨 순서대로 읽을 수 있게
   - 구체적인 예시나 데이터 포함
   - 전환 문구로 자연스럽게 연결

3. **마지막 트윗** (CTA, 참여 유도)
   - 핵심 내용 요약
   - 리트윗, 좋아요, 댓글 유도
   - 관련 스레드나 계정 팔로우 유도

지금 바로 완전한 Twitter 스레드를 작성해주세요.`;
        break;

      default:
        return NextResponse.json(
          { error: '지원하지 않는 콘텐츠 유형입니다.' },
          { status: 400 }
        );
    }

    // Gemini API 호출
    console.log('[Content Create] API 호출 시작:', {
      hasApiKey: !!apiKey,
      apiKeyPrefix: apiKey?.substring(0, 10) + '...',
      type,
      topic,
    });
    
    let content = await generateGeminiResponse(prompt, apiKey);
    
    // 응답 검증 및 개선
    // 단순히 요청을 반복하는 응답 필터링
    const isRepetitiveResponse = 
      content.includes('다음 주제로') && 
      content.includes('작성해주세요') &&
      content.length < 200;
    
    if (isRepetitiveResponse) {
      console.warn('[Content Create] 반복적인 응답 감지, 재시도');
      // 더 강력한 프롬프트로 재시도
      const enhancedPrompt = `${prompt}\n\n중요: 단순히 요청을 반복하지 말고, 실제로 사용할 수 있는 완전한 콘텐츠를 지금 바로 작성해주세요. 구체적인 내용, 예시, 팁을 포함하여 실제로 게시할 수 있는 수준의 콘텐츠를 제공해주세요.`;
      content = await generateGeminiResponse(enhancedPrompt, apiKey);
    }
    
    // 최소 길이 확인
    if (content.length < 100 && !content.includes('시뮬레이션')) {
      console.warn('[Content Create] 응답이 너무 짧음, 재시도');
      const enhancedPrompt = `${prompt}\n\n중요: 최소 500자 이상의 상세한 콘텐츠를 작성해주세요.`;
      const retryContent = await generateGeminiResponse(enhancedPrompt, apiKey);
      if (retryContent.length > content.length) {
        content = retryContent;
      }
    }
    
    console.log('[Content Create] API 호출 완료:', {
      contentLength: content.length,
      isSimulation: content.includes('시뮬레이션'),
      isRepetitive: isRepetitiveResponse,
    });

    return NextResponse.json({
      success: true,
      type,
      topic,
      content,
      timestamp: new Date().toISOString(),
      apiInfo: {
        isRealApiCall: !content.includes('시뮬레이션') && !content.includes('API 키를 설정'),
        hasApiKey: !!apiKey,
        message: content.includes('시뮬레이션') 
          ? '⚠️ 시뮬레이션된 응답입니다. GOOGLE_API_KEY를 설정하면 실제 AI 응답을 받을 수 있습니다.'
          : '✅ 실제 Google Gemini API를 사용하여 생성된 응답입니다.',
      },
    });
  } catch (error: any) {
    console.error('[Content Create] 콘텐츠 생성 오류:', {
      error: error.message,
      stack: error.stack,
      hasApiKey: !!process.env.GOOGLE_API_KEY,
    });
    
    return NextResponse.json(
      {
        error: '콘텐츠 생성 중 오류가 발생했습니다.',
        message: error.message || '알 수 없는 오류',
        details: 'Google Gemini API 호출이 실패했습니다. API 키가 유효한지 확인하세요.',
        apiInfo: {
          isRealApiCall: false,
          hasApiKey: !!process.env.GOOGLE_API_KEY,
          message: `❌ API 호출 실패: ${error.message}`,
        },
      },
      { status: 500 }
    );
  }
}

