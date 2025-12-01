import { logger } from '../../utils/logger'
import { TrendData } from '../trends/collector'

/**
 * 창의성 향상 시스템
 * 우주에서 가장 잘나가는 작가 수준의 창작 능력
 */
export class CreativityEnhancer {
  /**
   * 고급 프롬프트 생성
   * 트렌드, 감정, 스타일을 결합하여 최고 수준의 프롬프트 생성
   */
  generateMasterPrompt(
    topic: string,
    contentType: string,
    trends: TrendData[],
    targetAudience: string = 'universal',
    style: string = 'engaging'
  ): string {
    // 트렌드에서 인기 키워드 추출
    const trendingKeywords = this.extractTrendingKeywords(trends)
    const trendingTopics = this.extractTrendingTopics(trends)

    // 감정 분석
    const sentiment = this.analyzeOverallSentiment(trends)

    // 스타일 가이드
    const styleGuide = this.getStyleGuide(style, targetAudience)

    return `당신은 우주에서 가장 뛰어난 작가입니다. 당신의 작품은:
- 전 세계 모든 문화와 언어를 이해하고 존중합니다
- 독자의 마음을 깊이 이해하고 감동시킵니다
- 독창적이면서도 보편적인 가치를 담고 있습니다
- 모든 연령대와 배경의 사람들이 즐길 수 있습니다
- 문학적 가치와 대중적 매력을 동시에 갖춥니다

주제: ${topic}
콘텐츠 유형: ${contentType}

현재 트렌드:
${trendingTopics.map(t => `- ${t}`).join('\n')}

인기 키워드: ${trendingKeywords.join(', ')}

대상 독자: ${targetAudience}
스타일: ${styleGuide}

요구사항:
1. 독창적이고 신선한 관점
2. 감정적으로 깊이 있는 내용
3. 보편적이면서도 개성 있는 스토리텔링
4. 다양한 문화적 배경을 고려한 접근
5. 독자가 몰입할 수 있는 매력적인 구성
6. 문학적 완성도와 대중적 접근성의 완벽한 균형
7. 긍정적이면서도 현실적인 메시지
8. 독자의 마음을 움직이는 감동적인 결말

${this.getAdvancedWritingTechniques()}

이제 이 주제로 우주 최고 수준의 작품을 창작해주세요.`
  }

  /**
   * 트렌드에서 인기 키워드 추출
   */
  private extractTrendingKeywords(trends: TrendData[]): string[] {
    const keywordCount: Record<string, number> = {}

    trends.forEach(trend => {
      trend.keywords.forEach(keyword => {
        keywordCount[keyword] = (keywordCount[keyword] || 0) + trend.popularity
      })
    })

    return Object.entries(keywordCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([keyword]) => keyword)
  }

  /**
   * 트렌드에서 인기 주제 추출
   */
  private extractTrendingTopics(trends: TrendData[]): string[] {
    return trends
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, 5)
      .map(trend => trend.title)
  }

  /**
   * 전체 감정 분석
   */
  private analyzeOverallSentiment(trends: TrendData[]): 'positive' | 'negative' | 'neutral' {
    const sentimentCount = {
      positive: trends.filter(t => t.sentiment === 'positive').length,
      negative: trends.filter(t => t.sentiment === 'negative').length,
      neutral: trends.filter(t => t.sentiment === 'neutral').length
    }

    if (sentimentCount.positive > sentimentCount.negative) return 'positive'
    if (sentimentCount.negative > sentimentCount.positive) return 'negative'
    return 'neutral'
  }

  /**
   * 스타일 가이드 생성
   */
  private getStyleGuide(style: string, audience: string): string {
    const guides: Record<string, string> = {
      engaging: '매력적이고 몰입도 높은 스토리텔링, 독자의 관심을 즉시 사로잡는 시작, 예측 불가능한 전개',
      emotional: '감정적 깊이가 있는 내용, 독자의 마음을 움직이는 감동적인 스토리, 공감대 형성',
      informative: '유용하고 실용적인 정보 제공, 전문적이면서도 이해하기 쉬운 설명',
      entertaining: '재미있고 즐거운 내용, 유머와 위트가 있는 스토리, 독자를 즐겁게 만드는 구성',
      inspiring: '영감을 주는 메시지, 긍정적이고 동기부여가 되는 내용, 독자에게 힘을 주는 스토리'
    }

    const audienceGuides: Record<string, string> = {
      universal: '모든 연령대와 배경의 사람들이 즐길 수 있도록, 보편적 가치와 개별적 경험의 균형',
      young: '젊은 세대의 관심사와 언어를 반영, 트렌디하고 현대적인 접근',
      professional: '전문적이고 신뢰할 수 있는 내용, 깊이 있는 분석과 통찰',
      creative: '창의적이고 독창적인 접근, 예술적 가치와 혁신적 아이디어'
    }

    return `${guides[style] || guides.engaging}\n${audienceGuides[audience] || audienceGuides.universal}`
  }

  /**
   * 고급 작문 기법
   */
  private getAdvancedWritingTechniques(): string {
    return `
고급 작문 기법:
1. 호기심 유발: 독자가 계속 읽고 싶게 만드는 질문과 미스터리
2. 감정적 리듬: 긴장과 완화의 반복으로 독자의 감정을 조절
3. 구체적 묘사: 추상적 개념을 구체적 이미지로 표현
4. 대화와 행동: 직접적인 설명 대신 대화와 행동으로 스토리 전개
5. 상징과 은유: 깊이 있는 의미를 담은 상징적 표현
6. 반전과 전환: 예상치 못한 전개로 독자를 놀라게 함
7. 감정적 공감: 독자의 경험과 연결되는 보편적 감정
8. 시각적 묘사: 독자가 머릿속에 그림을 그릴 수 있는 생생한 묘사
9. 리듬감 있는 문장: 짧은 문장과 긴 문장의 조화로 리듬감 조성
10. 강렬한 결말: 독자에게 오래 기억에 남을 강렬한 인상을 남김`
  }

  /**
   * 다양한 장르별 프롬프트 생성
   */
  generateGenrePrompt(
    topic: string,
    genre: string,
    trends: TrendData[]
  ): string {
    const genreGuides: Record<string, string> = {
      drama: '드라마틱한 갈등과 감정적 깊이, 인물의 내적 갈등과 성장, 현실적이면서도 감동적인 스토리',
      comedy: '유머와 위트, 예상치 못한 상황과 반전, 독자를 즐겁게 만드는 재미있는 구성',
      thriller: '긴장감과 서스펜스, 예측 불가능한 전개, 독자를 끝까지 몰입시키는 스토리',
      romance: '감정적 깊이와 로맨틱한 요소, 인물 간의 관계 발전, 따뜻하고 감동적인 스토리',
      fantasy: '상상력과 창의성, 독특한 세계관과 설정, 독자를 다른 세계로 데려가는 매력',
      sciFi: '과학적 상상력과 미래적 비전, 기술과 인문학의 조화, 사고를 자극하는 내용',
      mystery: '미스터리와 추리 요소, 단서와 힌트의 배치, 독자가 함께 추리할 수 있는 구성',
      horror: '공포와 긴장감, 심리적 공포와 물리적 공포의 조화, 독자의 상상력을 자극',
      sliceOfLife: '일상의 아름다움과 의미, 소소한 감동과 공감, 현실적이면서도 따뜻한 스토리',
      adventure: '모험과 탐험, 새로운 경험과 도전, 독자에게 용기를 주는 스토리'
    }

    return `${this.generateMasterPrompt(topic, genre, trends)}

장르 특성:
${genreGuides[genre] || genreGuides.drama}

이 장르의 특성을 살려 우주 최고 수준의 작품을 창작해주세요.`
  }

  /**
   * 문화적 다양성 반영
   */
  generateCulturalPrompt(
    topic: string,
    cultures: string[],
    trends: TrendData[]
  ): string {
    return `${this.generateMasterPrompt(topic, 'universal', trends)}

문화적 다양성:
다음 문화들의 관점과 가치를 존중하고 반영해주세요:
${cultures.map(c => `- ${c}`).join('\n')}

각 문화의 독특한 특성과 보편적 가치를 조화롭게 결합하여,
모든 문화권의 사람들이 공감하고 즐길 수 있는 작품을 만들어주세요.`
  }
}

