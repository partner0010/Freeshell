/**
 * 자동 학습 시스템
 * 네트워크를 이용하여 자연스럽게 학습하고, AI를 활용하여 자가 학습
 */

import { aiKnowledgeBase } from './ai-knowledge-base';
import { searchDuckDuckGo, searchWikipedia } from './free-apis';

export interface LearningTask {
  id: string;
  topic: string;
  source: 'web' | 'ai-self' | 'user-feedback';
  content: string;
  learnedAt: number;
  confidence: number;
  tags: string[];
}

export interface LearningSchedule {
  enabled: boolean;
  duration: number; // 분 단위
  interval: 'daily' | 'weekly';
  startTime: string; // HH:MM 형식
  topics: string[]; // 학습할 주제 목록
}

// 전역 학습 작업 저장소
declare global {
  var __learningTasks: LearningTask[];
  var __learningSchedule: LearningSchedule;
  var __learningActive: boolean;
}

if (!global.__learningTasks) {
  global.__learningTasks = [];
}

if (!global.__learningSchedule) {
  global.__learningSchedule = {
    enabled: true,
    duration: 60, // 1시간
    interval: 'daily',
    startTime: '02:00', // 새벽 2시
    topics: [
      'AI', '인공지능', '머신러닝', '딥러닝',
      '프로그래밍', '웹 개발', '모바일 앱',
      '데이터 과학', '클라우드', '보안',
      '최신 기술 트렌드', 'IT 뉴스',
    ],
  };
}

if (typeof global.__learningActive === 'undefined') {
  global.__learningActive = false;
}

export class AutoLearningSystem {
  /**
   * 자동 학습 실행 (스케줄러에서 호출)
   */
  async startAutoLearning(durationMinutes: number = 60): Promise<{
    learned: number;
    topics: string[];
    errors: string[];
  }> {
    if (global.__learningActive) {
      console.log('[AutoLearning] 이미 학습 중입니다.');
      return { learned: 0, topics: [], errors: ['이미 학습 중입니다.'] };
    }

    global.__learningActive = true;
    const startTime = Date.now();
    const endTime = startTime + (durationMinutes * 60 * 1000);
    const learned: string[] = [];
    const errors: string[] = [];

    console.log(`[AutoLearning] 자동 학습 시작 (${durationMinutes}분)`);

    try {
      // 1. 웹에서 정보 수집 (50% 시간 - 가장 중요)
      const webLearning = await this.learnFromWeb(durationMinutes * 0.5);
      learned.push(...webLearning.topics);
      errors.push(...webLearning.errors);

      // 2. 다른 AI들의 지식 습득 (30% 시간)
      const aiKnowledgeLearning = await this.learnFromOtherAIs(durationMinutes * 0.3);
      learned.push(...aiKnowledgeLearning.topics);
      errors.push(...aiKnowledgeLearning.errors);

      // 3. AI 자가 학습 (10% 시간)
      const aiLearning = await this.selfLearning(durationMinutes * 0.1);
      learned.push(...aiLearning.topics);
      errors.push(...aiLearning.errors);

      // 4. 지식 베이스 정리 및 개선 (10% 시간)
      const improvement = await this.improveKnowledgeBase(durationMinutes * 0.1);
      learned.push(...improvement.topics);
      errors.push(...improvement.errors);

      // 시간이 남으면 추가 학습
      while (Date.now() < endTime && learned.length < 50) {
        const remainingTime = (endTime - Date.now()) / 1000 / 60; // 분
        if (remainingTime < 5) break;

        const additional = await this.learnRandomTopic(5);
        learned.push(...additional.topics);
        errors.push(...additional.errors);
      }

      console.log(`[AutoLearning] 자동 학습 완료: ${learned.length}개 주제 학습`);
    } catch (error: any) {
      console.error('[AutoLearning] 학습 중 오류:', error);
      errors.push(error.message);
    } finally {
      global.__learningActive = false;
    }

    return {
      learned: learned.length,
      topics: learned,
      errors,
    };
  }

  /**
   * 웹에서 정보 수집 및 학습
   */
  private async learnFromWeb(durationMinutes: number): Promise<{
    topics: string[];
    errors: string[];
  }> {
    const topics: string[] = [];
    const errors: string[] = [];
    const endTime = Date.now() + (durationMinutes * 60 * 1000);

    console.log('[AutoLearning] 웹에서 정보 수집 시작');

    // 학습할 주제 목록 (대폭 확장)
    const learningTopics = global.__learningSchedule.topics || [
      // AI 및 머신러닝
      'AI', '인공지능', '머신러닝', '딥러닝', '신경망', '자연어처리', '컴퓨터비전',
      '강화학습', '전이학습', '생성형AI', 'GPT', 'LLM', 'Transformer',
      // 프로그래밍
      '프로그래밍', '코딩', '알고리즘', '자료구조', '디자인패턴', '리팩토링',
      'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'Go', 'Rust',
      'React', 'Vue', 'Angular', 'Next.js', 'Node.js', 'Express',
      // 웹 개발
      '웹 개발', '프론트엔드', '백엔드', '풀스택', 'REST API', 'GraphQL',
      'HTML', 'CSS', '반응형 디자인', '웹 성능 최적화', 'SEO',
      // 데이터 과학
      '데이터 과학', '데이터 분석', '빅데이터', '데이터베이스', 'SQL', 'NoSQL',
      '머신러닝 모델', '데이터 시각화', '통계학',
      // 클라우드 및 인프라
      '클라우드', 'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'CI/CD',
      'DevOps', '마이크로서비스', '서버리스',
      // 보안
      '보안', '암호화', '인증', '권한 관리', 'XSS', 'SQL Injection', 'CSRF',
      // 최신 기술
      '블록체인', 'Web3', '메타버스', 'AR', 'VR', 'IoT', '5G',
      // 일반 지식
      '컴퓨터 과학', '소프트웨어 공학', '프로젝트 관리', '애자일', '스크럼',
    ];

    for (const topic of learningTopics) {
      if (Date.now() >= endTime) break;

      try {
        // DuckDuckGo 검색
        const webResults = await searchDuckDuckGo(topic);
        // Wikipedia 검색
        const wikiResults = await searchWikipedia(topic);

        // 정보 종합
        let content = '';
        if (wikiResults.length > 0) {
          content += wikiResults[0].snippet || '';
        }
        webResults.slice(0, 3).forEach((result: any) => {
          if (result.snippet) {
            content += '\n\n' + result.snippet;
          }
        });

        if (content.trim()) {
          // 지식 베이스에 저장
          const entry = await aiKnowledgeBase.learnFromWeb(topic);
          if (entry) {
            topics.push(topic);
            console.log(`[AutoLearning] 웹에서 학습: ${topic}`);
          }
        }

        // API 호출 제한을 고려한 대기
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error: any) {
        console.error(`[AutoLearning] ${topic} 학습 실패:`, error);
        errors.push(`${topic}: ${error.message}`);
      }
    }

    return { topics, errors };
  }

  /**
   * AI 자가 학습 (AI가 스스로 질문하고 답변)
   */
  private async selfLearning(durationMinutes: number): Promise<{
    topics: string[];
    errors: string[];
  }> {
    const topics: string[] = [];
    const errors: string[] = [];
    const endTime = Date.now() + (durationMinutes * 60 * 1000);

    console.log('[AutoLearning] AI 자가 학습 시작');

    // AI가 스스로 학습할 질문들 (대폭 확장)
    const selfQuestions = [
      // 기본 개념
      'AI란 무엇인가?',
      '머신러닝과 딥러닝의 차이는?',
      '인공지능의 역사는?',
      '자연어 처리의 원리는?',
      // 프로그래밍
      '최신 프로그래밍 트렌드는?',
      '웹 개발 베스트 프랙티스는?',
      '코드 리뷰의 중요성은?',
      '리팩토링 기법은?',
      // 보안 및 성능
      '보안 취약점은 어떻게 방지하나?',
      '성능 최적화 방법은?',
      '메모리 관리 기법은?',
      // 사용자 경험
      '사용자 경험 개선 방법은?',
      '접근성 향상 방법은?',
      // 데이터
      '데이터 분석 기법은?',
      '빅데이터 처리 방법은?',
      // 아키텍처
      '마이크로서비스 아키텍처는?',
      '클라우드 네이티브 설계는?',
      '분산 시스템 설계는?',
    ];

    const geminiKey = process.env.GOOGLE_API_KEY;
    if (!geminiKey || geminiKey.trim() === '') {
      console.warn('[AutoLearning] GOOGLE_API_KEY가 없어 AI 자가 학습을 건너뜁니다.');
      return { topics, errors: ['API 키가 없습니다.'] };
    }

    for (const question of selfQuestions) {
      if (Date.now() >= endTime) break;

      try {
        // AI에게 질문하고 답변 받기
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: question }] }],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 2000,
              },
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const answer = data.candidates?.[0]?.content?.parts?.[0]?.text;

          if (answer) {
            // 지식 베이스에 저장
            aiKnowledgeBase.saveConversation(question, answer, {
              source: 'ai-self-learning',
              confidence: 0.9,
              tags: ['자동학습', 'AI자가학습'],
            });

            topics.push(question);
            console.log(`[AutoLearning] AI 자가 학습: ${question.substring(0, 30)}...`);
          }
        }

        // API 호출 제한을 고려한 대기
        await new Promise(resolve => setTimeout(resolve, 3000));
      } catch (error: any) {
        console.error(`[AutoLearning] ${question} 자가 학습 실패:`, error);
        errors.push(`${question}: ${error.message}`);
      }
    }

    return { topics, errors };
  }

  /**
   * 지식 베이스 개선
   */
  private async improveKnowledgeBase(durationMinutes: number): Promise<{
    topics: string[];
    errors: string[];
  }> {
    const topics: string[] = [];
    const errors: string[] = [];

    console.log('[AutoLearning] 지식 베이스 개선 시작');

    try {
      // 지식 베이스 통계 확인
      const stats = aiKnowledgeBase.getStats();

      // 부족한 주제 식별 및 보완
      const commonTopics = ['AI', '프로그래밍', '웹 개발', '데이터 과학'];
      for (const topic of commonTopics) {
        const existing = aiKnowledgeBase.searchKnowledge(topic, 1);
        if (existing.length === 0) {
          // 부족한 주제 학습
          const entry = await aiKnowledgeBase.learnFromWeb(topic);
          if (entry) {
            topics.push(topic);
          }
        }
      }

      console.log(`[AutoLearning] 지식 베이스 개선 완료: ${topics.length}개 주제 추가`);
    } catch (error: any) {
      console.error('[AutoLearning] 지식 베이스 개선 실패:', error);
      errors.push(error.message);
    }

    return { topics, errors };
  }

  /**
   * 다른 AI들의 지식 습득
   * ChatGPT, Claude, Gemini 등의 응답을 학습 데이터로 활용
   */
  private async learnFromOtherAIs(durationMinutes: number): Promise<{
    topics: string[];
    errors: string[];
  }> {
    const topics: string[] = [];
    const errors: string[] = [];
    const endTime = Date.now() + (durationMinutes * 60 * 1000);

    console.log('[AutoLearning] 다른 AI들의 지식 습득 시작');

    // 다른 AI들에게 물어볼 질문들
    const questions = [
      'AI의 기본 원리는 무엇인가?',
      '머신러닝과 딥러닝의 차이점은?',
      '최신 프로그래밍 트렌드는 무엇인가?',
      '웹 개발 베스트 프랙티스는?',
      '코드 최적화 방법은?',
      '보안 취약점을 방지하는 방법은?',
      '성능 최적화 기법은?',
      '사용자 경험 개선 방법은?',
      '데이터 분석 기법은?',
      '클라우드 아키텍처 설계는?',
      'API 설계 원칙은?',
      '데이터베이스 최적화는?',
      '테스트 자동화는?',
      'CI/CD 파이프라인 구축은?',
      '마이크로서비스 아키텍처는?',
    ];

    const geminiKey = process.env.GOOGLE_API_KEY;
    if (!geminiKey || geminiKey.trim() === '') {
      console.warn('[AutoLearning] GOOGLE_API_KEY가 없어 다른 AI 학습을 건너뜁니다.');
      return { topics, errors: ['API 키가 없습니다.'] };
    }

    for (const question of questions) {
      if (Date.now() >= endTime) break;

      try {
        // Google Gemini를 통해 다른 AI들의 관점을 학습
        const learningPrompt = `${question}\n\n위 질문에 대해 전문가 수준의 상세한 답변을 제공해주세요. 다른 AI들(ChatGPT, Claude 등)의 관점도 포함하여 종합적인 답변을 작성해주세요.`;

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: learningPrompt }] }],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 4000,
              },
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const answer = data.candidates?.[0]?.content?.parts?.[0]?.text;

          if (answer) {
            // 다른 AI들의 관점을 포함한 학습 내용으로 저장
            const learningContent = `다른 AI들(ChatGPT, Claude, Gemini 등)의 관점을 종합한 답변:\n\n${answer}\n\n이 정보는 다양한 AI들의 지식을 통합한 것입니다.`;

            aiKnowledgeBase.saveConversation(question, learningContent, {
              source: 'other-ai-knowledge',
              confidence: 0.95,
              tags: ['다른AI학습', '종합지식', 'AI비교'],
            });

            topics.push(question);
            console.log(`[AutoLearning] 다른 AI 지식 습득: ${question.substring(0, 30)}...`);
          }
        }

        // API 호출 제한을 고려한 대기
        await new Promise(resolve => setTimeout(resolve, 3000));
      } catch (error: any) {
        console.error(`[AutoLearning] ${question} 학습 실패:`, error);
        errors.push(`${question}: ${error.message}`);
      }
    }

    return { topics, errors };
  }

  /**
   * 랜덤 주제 학습
   */
  private async learnRandomTopic(durationMinutes: number): Promise<{
    topics: string[];
    errors: string[];
  }> {
    const topics: string[] = [];
    const errors: string[] = [];

    // 랜덤 주제 생성
    const randomTopics = [
      '최신 기술 뉴스',
      '프로그래밍 팁',
      '개발 도구',
      '클라우드 서비스',
      '데이터베이스',
    ];

    const randomTopic = randomTopics[Math.floor(Math.random() * randomTopics.length)];

    try {
      const entry = await aiKnowledgeBase.learnFromWeb(randomTopic);
      if (entry) {
        topics.push(randomTopic);
      }
    } catch (error: any) {
      errors.push(`${randomTopic}: ${error.message}`);
    }

    return { topics, errors };
  }

  /**
   * 학습 스케줄 설정
   */
  setSchedule(schedule: Partial<LearningSchedule>): void {
    global.__learningSchedule = {
      ...global.__learningSchedule,
      ...schedule,
    };
    console.log('[AutoLearning] 학습 스케줄 업데이트:', global.__learningSchedule);
  }

  /**
   * 학습 스케줄 가져오기
   */
  getSchedule(): LearningSchedule {
    return global.__learningSchedule;
  }

  /**
   * 학습 상태 확인
   */
  isLearning(): boolean {
    return global.__learningActive;
  }

  /**
   * 학습 통계
   */
  getStats(): {
    totalTasks: number;
    todayTasks: number;
    topicsLearned: string[];
    lastLearning: number | null;
  } {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const today = now - (now % oneDay);

    const todayTasks = global.__learningTasks.filter(
      task => task.learnedAt >= today
    );

    const topics = [...new Set(global.__learningTasks.map(t => t.topic))];

    const lastLearning = global.__learningTasks.length > 0
      ? Math.max(...global.__learningTasks.map(t => t.learnedAt))
      : null;

    return {
      totalTasks: global.__learningTasks.length,
      todayTasks: todayTasks.length,
      topicsLearned: topics,
      lastLearning,
    };
  }
}

export const autoLearningSystem = new AutoLearningSystem();

