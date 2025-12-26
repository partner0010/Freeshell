/**
 * AI 도구 사용 시스템 (Tool Use)
 * AI가 외부 API, 함수, 도구를 사용할 수 있도록
 * 자기 학습 시스템 통합: 도구 사용 결과에서 학습하여 효율성 향상
 */

import { selfLearningSystem } from './self-learning';
import { selfMonitoringSystem } from './self-monitoring';

export interface Tool {
  id: string;
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, {
      type: string;
      description: string;
      required?: boolean;
    }>;
    required?: string[];
  };
  execute: (params: any) => Promise<any>;
}

export interface ToolCall {
  id: string;
  tool: string;
  parameters: any;
  result?: any;
  error?: string;
}

class ToolSystem {
  private tools: Map<string, Tool> = new Map();

  constructor() {
    this.registerDefaultTools();
  }

  /**
   * 기본 도구 등록
   */
  private registerDefaultTools() {
    // 웹 검색 도구
    this.registerTool({
      id: 'web_search',
      name: '웹 검색',
      description: '인터넷에서 정보를 검색합니다. 최신 정보, 뉴스, 데이터 등을 찾을 때 사용합니다.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: '검색할 키워드 또는 질문',
            required: true,
          },
          maxResults: {
            type: 'number',
            description: '최대 결과 수 (기본값: 10)',
          },
        },
        required: ['query'],
      },
      execute: async (params: any) => {
        const { webSearchManager } = await import('./web-search');
        return await webSearchManager.search(params.query, { maxResults: params.maxResults || 10 });
      },
    });

    // 계산기 도구
    this.registerTool({
      id: 'calculator',
      name: '계산기',
      description: '수학 계산을 수행합니다. 복잡한 수식, 통계, 변환 등을 계산할 수 있습니다.',
      parameters: {
        type: 'object',
        properties: {
          expression: {
            type: 'string',
            description: '계산할 수식 (예: "2 + 2", "sqrt(16)", "10 * 5")',
            required: true,
          },
        },
        required: ['expression'],
      },
      execute: async (params: any) => {
        try {
          // 안전한 계산 (eval 대신 수학 라이브러리 사용 권장)
          const result = Function(`"use strict"; return (${params.expression})`)();
          return { result, expression: params.expression };
        } catch (error: any) {
          return { error: error.message };
        }
      },
    });

    // 날짜/시간 도구
    this.registerTool({
      id: 'datetime',
      name: '날짜/시간',
      description: '현재 날짜, 시간, 날짜 계산 등을 수행합니다.',
      parameters: {
        type: 'object',
        properties: {
          action: {
            type: 'string',
            description: '수행할 작업: "now" (현재 시간), "format" (날짜 포맷), "calculate" (날짜 계산)',
            required: true,
          },
          format: {
            type: 'string',
            description: '날짜 포맷 (action이 format일 때)',
          },
          days: {
            type: 'number',
            description: '더하거나 빼는 일수 (action이 calculate일 때)',
          },
        },
        required: ['action'],
      },
      execute: async (params: any) => {
        const now = new Date();
        switch (params.action) {
          case 'now':
            return { datetime: now.toISOString(), formatted: now.toLocaleString('ko-KR') };
          case 'format':
            return { formatted: now.toLocaleString('ko-KR', { dateStyle: 'full', timeStyle: 'medium' }) };
          case 'calculate':
            const result = new Date(now);
            result.setDate(result.getDate() + (params.days || 0));
            return { datetime: result.toISOString(), formatted: result.toLocaleString('ko-KR') };
          default:
            return { error: '알 수 없는 작업' };
        }
      },
    });

    // 파일 읽기 도구 (서버 사이드)
    this.registerTool({
      id: 'read_file',
      name: '파일 읽기',
      description: '파일의 내용을 읽습니다. 텍스트 파일, JSON, CSV 등을 읽을 수 있습니다.',
      parameters: {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            description: '읽을 파일 경로',
            required: true,
          },
        },
        required: ['path'],
      },
      execute: async (params: any) => {
        try {
          const fs = await import('fs/promises');
          const content = await fs.readFile(params.path, 'utf-8');
          return { content, path: params.path };
        } catch (error: any) {
          return { error: error.message };
        }
      },
    });

    // API 호출 도구
    this.registerTool({
      id: 'api_call',
      name: 'API 호출',
      description: '외부 API를 호출하여 데이터를 가져옵니다.',
      parameters: {
        type: 'object',
        properties: {
          url: {
            type: 'string',
            description: 'API 엔드포인트 URL',
            required: true,
          },
          method: {
            type: 'string',
            description: 'HTTP 메서드 (GET, POST, PUT, DELETE)',
          },
          headers: {
            type: 'object',
            description: 'HTTP 헤더',
          },
          body: {
            type: 'object',
            description: '요청 본문 (POST, PUT일 때)',
          },
        },
        required: ['url'],
      },
      execute: async (params: any) => {
        try {
          const response = await fetch(params.url, {
            method: params.method || 'GET',
            headers: params.headers || { 'Content-Type': 'application/json' },
            body: params.body ? JSON.stringify(params.body) : undefined,
          });
          const data = await response.json();
          return { status: response.status, data };
        } catch (error: any) {
          return { error: error.message };
        }
      },
    });
  }

  /**
   * 도구 등록
   */
  registerTool(tool: Tool) {
    this.tools.set(tool.id, tool);
  }

  /**
   * 도구 조회
   */
  getTool(toolId: string): Tool | undefined {
    return this.tools.get(toolId);
  }

  /**
   * 모든 도구 조회
   */
  getAllTools(): Tool[] {
    return Array.from(this.tools.values());
  }

  /**
   * 도구 사용 가능 여부 확인
   */
  canUseTool(toolId: string): boolean {
    return this.tools.has(toolId);
  }

  /**
   * 도구 실행
   */
  async executeTool(toolId: string, parameters: any): Promise<any> {
    const tool = this.tools.get(toolId);
    if (!tool) {
      throw new Error(`도구를 찾을 수 없습니다: ${toolId}`);
    }

    try {
      const result = await tool.execute(parameters);
      const executionResult = { success: true, result };

      // 자기 학습: 도구 실행 성공에서 학습
      selfLearningSystem.learnFromExperience({
        task: 'tool_execution',
        input: { toolId, parameters },
        output: executionResult,
        success: true,
        performance: 0.9,
        patterns: ['tool_use', toolId],
        improvements: [],
      }).catch(err => console.error('도구 실행 학습 오류:', err));

      return executionResult;
    } catch (error: any) {
      const executionResult = { success: false, error: error.message };

      // 자기 학습: 도구 실행 실패에서 학습
      selfLearningSystem.learnFromExperience({
        task: 'tool_execution',
        input: { toolId, parameters },
        output: executionResult,
        success: false,
        performance: 0.2,
        patterns: ['tool_execution_error', toolId],
        improvements: [error.message],
      }).catch(err => console.error('도구 실행 학습 오류:', err));

      return executionResult;
    }
  }

  /**
   * OpenAI Function Calling 형식으로 도구 목록 변환
   */
  toOpenAIFunctions(): any[] {
    return Array.from(this.tools.values()).map(tool => ({
      type: 'function',
      function: {
        name: tool.id,
        description: tool.description,
        parameters: tool.parameters,
      },
    }));
  }
}

export const toolSystem = new ToolSystem();

