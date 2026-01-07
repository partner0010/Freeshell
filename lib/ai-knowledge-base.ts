/**
 * AI 지식 베이스 및 학습 시스템
 * 네트워크를 통해 정보를 습득하고 학습하여 저장
 */

export interface KnowledgeEntry {
  id: string;
  topic: string;
  content: string;
  sources: string[];
  learnedAt: number;
  accessCount: number;
  lastAccessed: number;
  tags: string[];
  confidence: number;
}

// 전역 지식 베이스 저장소
declare global {
  var __aiKnowledgeBase: Map<string, KnowledgeEntry>;
}

if (!global.__aiKnowledgeBase) {
  global.__aiKnowledgeBase = new Map<string, KnowledgeEntry>();
}

export class AIKnowledgeBase {
  /**
   * 웹 검색을 통해 정보 습득
   */
  async learnFromWeb(query: string): Promise<KnowledgeEntry | null> {
    try {
      // 서버 사이드에서 직접 웹 검색 함수 호출
      const { searchDuckDuckGo, searchWikipedia } = await import('./free-apis');
      
      // 병렬로 검색 실행
      const [webResults, wikiResults] = await Promise.all([
        searchDuckDuckGo(query),
        searchWikipedia(query),
      ]);

      let content = '';
      const sources: string[] = [];
      
      // Wikipedia 결과 우선 사용
      if (wikiResults && Array.isArray(wikiResults) && wikiResults.length > 0) {
        content += wikiResults[0].snippet || '';
        if (wikiResults[0].url) {
          sources.push(wikiResults[0].url);
        }
      }
      
      // DuckDuckGo 결과 추가
      if (webResults && Array.isArray(webResults) && webResults.length > 0) {
        webResults.slice(0, 3).forEach((result: any) => {
          if (result.snippet) {
            content += '\n\n' + result.snippet;
            if (result.url) {
              sources.push(result.url);
            }
          }
        });
      }

      if (!content.trim()) {
        return null;
      }

      // 지식 베이스에 저장
      const entry: KnowledgeEntry = {
        id: `knowledge-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        topic: query,
        content: content.trim(),
        sources: sources.filter(Boolean),
        learnedAt: Date.now(),
        accessCount: 0,
        lastAccessed: Date.now(),
        tags: this.extractTags(query),
        confidence: 0.8,
      };

      global.__aiKnowledgeBase.set(entry.id, entry);
      
      console.log('[AIKnowledgeBase] 새로운 지식 습득:', {
        topic: entry.topic,
        contentLength: entry.content.length,
        sourcesCount: entry.sources.length,
      });

      return entry;
    } catch (error) {
      console.error('[AIKnowledgeBase] 웹 검색 실패:', error);
      return null;
    }
  }

  /**
   * 저장된 지식 검색
   */
  searchKnowledge(query: string, limit: number = 5): KnowledgeEntry[] {
    const queryLower = query.toLowerCase();
    const results: KnowledgeEntry[] = [];

    for (const entry of global.__aiKnowledgeBase.values()) {
      const topicMatch = entry.topic.toLowerCase().includes(queryLower);
      const contentMatch = entry.content.toLowerCase().includes(queryLower);
      const tagMatch = entry.tags.some(tag => tag.toLowerCase().includes(queryLower));

      if (topicMatch || contentMatch || tagMatch) {
        entry.accessCount++;
        entry.lastAccessed = Date.now();
        results.push(entry);
      }
    }

    // 관련도 순으로 정렬
    results.sort((a, b) => {
      const aScore = a.accessCount + (a.confidence * 10);
      const bScore = b.accessCount + (b.confidence * 10);
      return bScore - aScore;
    });

    return results.slice(0, limit);
  }

  /**
   * 대화 내용 저장 (학습)
   */
  saveConversation(prompt: string, response: string, metadata?: {
    source?: string;
    confidence?: number;
    tags?: string[];
  }): void {
    const entry: KnowledgeEntry = {
      id: `conversation-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      topic: prompt.substring(0, 100),
      content: response,
      sources: [],
      learnedAt: Date.now(),
      accessCount: 0,
      lastAccessed: Date.now(),
      tags: metadata?.tags || this.extractTags(prompt),
      confidence: metadata?.confidence || 0.7,
    };

    global.__aiKnowledgeBase.set(entry.id, entry);
    
    console.log('[AIKnowledgeBase] 대화 내용 저장:', {
      topic: entry.topic,
      contentLength: entry.content.length,
    });
  }

  /**
   * 태그 추출
   */
  private extractTags(text: string): string[] {
    const tags: string[] = [];
    const lower = text.toLowerCase();
    
    // 기술 관련 태그
    if (lower.includes('코드') || lower.includes('프로그래밍') || lower.includes('개발')) {
      tags.push('개발');
    }
    if (lower.includes('ai') || lower.includes('인공지능')) {
      tags.push('AI');
    }
    if (lower.includes('학습') || lower.includes('교육')) {
      tags.push('교육');
    }
    if (lower.includes('설명') || lower.includes('이해')) {
      tags.push('설명');
    }
    
    return tags;
  }

  /**
   * 다른 AI들의 응답을 학습 데이터로 저장
   * AI 비교 분석에서 사용
   */
  learnFromAIComparison(
    prompt: string,
    otherAIResponses: Array<{ aiName: string; response: string }>,
    ourResponse?: string
  ): void {
    // 다른 AI들의 답변을 종합하여 학습 내용 구성
    const learningContent = `다른 AI들은 "${prompt}" 질문에 대해 다음과 같이 생각했습니다:\n\n${otherAIResponses.map(r => `${r.aiName}:\n${r.response}`).join('\n\n---\n\n')}${ourResponse ? `\n\n우리 AI의 답변:\n${ourResponse}` : ''}\n\n이 정보를 참고하여 더 나은 답변을 제공할 수 있습니다.`;

    this.saveConversation(prompt, learningContent, {
      source: 'ai-comparison-learning',
      confidence: 0.9,
      tags: ['AI비교', '다른AI학습', '종합지식', ...otherAIResponses.map(r => r.aiName)],
    });

    console.log('[AIKnowledgeBase] AI 비교 학습 저장:', {
      prompt: prompt.substring(0, 50),
      otherAICount: otherAIResponses.length,
    });
  }

  /**
   * 대량의 초기 학습 데이터 로드
   * 네트워크를 통해 풍부한 학습 데이터 확보
   */
  async loadInitialLearningData(): Promise<number> {
    const initialTopics = [
      'AI 기본 개념', '머신러닝 기초', '딥러닝 원리',
      '프로그래밍 기초', '웹 개발 가이드', '데이터베이스 설계',
      'API 설계 원칙', '보안 베스트 프랙티스', '성능 최적화',
      '코드 품질 향상', '테스트 자동화', 'DevOps 기초',
    ];

    let loaded = 0;
    for (const topic of initialTopics) {
      try {
        const entry = await this.learnFromWeb(topic);
        if (entry) {
          loaded++;
          console.log(`[AIKnowledgeBase] 초기 학습 데이터 로드: ${topic}`);
        }
        // API 제한을 고려한 대기
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`[AIKnowledgeBase] ${topic} 로드 실패:`, error);
      }
    }

    return loaded;
  }

  /**
   * 지식 베이스 통계
   */
  getStats(): {
    totalEntries: number;
    totalAccess: number;
    topics: string[];
    sources: Record<string, number>;
  } {
    let totalAccess = 0;
    const topics: string[] = [];
    const sources: Record<string, number> = {};

    for (const entry of global.__aiKnowledgeBase.values()) {
      totalAccess += entry.accessCount;
      topics.push(entry.topic);
      
      // 소스별 통계
      const source = entry.tags.find(t => t.includes('학습') || t.includes('AI')) || '기타';
      sources[source] = (sources[source] || 0) + 1;
    }

    return {
      totalEntries: global.__aiKnowledgeBase.size,
      totalAccess,
      topics: [...new Set(topics)],
      sources,
    };
  }
}

export const aiKnowledgeBase = new AIKnowledgeBase();

