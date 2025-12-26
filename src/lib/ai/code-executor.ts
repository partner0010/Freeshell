/**
 * 자동 코드 생성 및 실행 시스템
 * 자기 학습 시스템 통합: 실행 결과에서 학습하여 코드 생성 품질 향상
 */

import { selfLearningSystem } from './self-learning';
import { selfMonitoringSystem } from './self-monitoring';
import { selfImprovementSystem } from './self-improvement';

export interface CodeExecution {
  id: string;
  language: string;
  code: string;
  result?: any;
  error?: string;
  executionTime?: number;
  createdAt: Date;
}

class CodeExecutor {
  /**
   * Python 코드 실행 (서버 사이드)
   */
  async executePython(code: string): Promise<CodeExecution> {
    const id = `exec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const startTime = Date.now();

    try {
      // 실제로는 Python 서버나 Docker 컨테이너에서 실행
      // 여기서는 시뮬레이션
      const result = await this.safeExecutePython(code);
      
      const execution: CodeExecution = {
        id,
        language: 'python',
        code,
        result,
        executionTime: Date.now() - startTime,
        createdAt: new Date(),
      };

      // 자기 학습: 실행 성공에서 학습
      selfLearningSystem.learnFromExperience({
        task: 'python_execution',
        input: { code: code.substring(0, 200) }, // 긴 코드는 일부만
        output: execution,
        success: true,
        performance: 0.9,
        patterns: ['python_code_execution'],
        improvements: [],
      }).catch(err => console.error('코드 실행 학습 오류:', err));

      return execution;
    } catch (error: any) {
      const execution: CodeExecution = {
        id,
        language: 'python',
        code,
        error: error.message,
        executionTime: Date.now() - startTime,
        createdAt: new Date(),
      };

      // 자기 학습: 실행 실패에서 학습
      selfLearningSystem.learnFromExperience({
        task: 'python_execution',
        input: { code: code.substring(0, 200) },
        output: execution,
        success: false,
        performance: 0.2,
        patterns: ['python_execution_error'],
        improvements: [error.message],
      }).catch(err => console.error('코드 실행 학습 오류:', err));

      return execution;
    }
  }

  /**
   * 안전한 Python 실행
   */
  private async safeExecutePython(code: string): Promise<any> {
    // 위험한 코드 차단
    const dangerousPatterns = [
      /import\s+os/,
      /import\s+subprocess/,
      /__import__/,
      /eval\(/,
      /exec\(/,
      /open\(/,
      /file\(/,
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(code)) {
        throw new Error('안전하지 않은 코드가 감지되었습니다.');
      }
    }

    // 실제 실행은 Python 서버에서 수행
    // 여기서는 간단한 수학 계산만 시뮬레이션
    if (code.match(/print\(|return\s+/)) {
      return { output: '코드 실행 완료 (시뮬레이션 모드)' };
    }

    throw new Error('지원하지 않는 코드입니다.');
  }

  /**
   * JavaScript 코드 실행 (브라우저 환경)
   */
  async executeJavaScript(code: string): Promise<CodeExecution> {
    const id = `exec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const startTime = Date.now();

    try {
      // 안전한 JavaScript 실행
      const result = await this.safeExecuteJavaScript(code);
      
      const execution: CodeExecution = {
        id,
        language: 'javascript',
        code,
        result,
        executionTime: Date.now() - startTime,
        createdAt: new Date(),
      };

      // 자기 학습: 실행 성공에서 학습
      selfLearningSystem.learnFromExperience({
        task: 'javascript_execution',
        input: { code: code.substring(0, 200) },
        output: execution,
        success: true,
        performance: 0.9,
        patterns: ['javascript_code_execution'],
        improvements: [],
      }).catch(err => console.error('코드 실행 학습 오류:', err));

      return execution;
    } catch (error: any) {
      const execution: CodeExecution = {
        id,
        language: 'javascript',
        code,
        error: error.message,
        executionTime: Date.now() - startTime,
        createdAt: new Date(),
      };

      // 자기 학습: 실행 실패에서 학습
      selfLearningSystem.learnFromExperience({
        task: 'javascript_execution',
        input: { code: code.substring(0, 200) },
        output: execution,
        success: false,
        performance: 0.2,
        patterns: ['javascript_execution_error'],
        improvements: [error.message],
      }).catch(err => console.error('코드 실행 학습 오류:', err));

      return execution;
    }
  }

  /**
   * 안전한 JavaScript 실행
   */
  private async safeExecuteJavaScript(code: string): Promise<any> {
    // 위험한 코드 차단
    const dangerousPatterns = [
      /eval\(/,
      /Function\(/,
      /document\./,
      /window\./,
      /localStorage/,
      /sessionStorage/,
      /XMLHttpRequest/,
      /fetch\(/,
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(code)) {
        throw new Error('안전하지 않은 코드가 감지되었습니다.');
      }
    }

    // 간단한 계산만 허용
    try {
      // 실제로는 VM이나 sandbox에서 실행
      return { output: 'JavaScript 코드 실행 완료 (제한된 모드)' };
    } catch (error: any) {
      throw new Error(`실행 오류: ${error.message}`);
    }
  }

  /**
   * AI로 코드 생성
   */
  async generateCode(description: string, language: string = 'python'): Promise<string> {
    const { multiModelManager } = await import('./multi-model-manager');
    
    const prompt = `다음 작업을 수행하는 ${language} 코드를 생성하세요:

${description}

요구사항:
1. 코드는 완전하고 실행 가능해야 합니다
2. 주석을 포함하세요
3. 에러 처리를 포함하세요
4. 안전한 코드만 생성하세요 (파일 시스템 접근, 네트워크 요청 등 제한)

코드만 반환하세요 (설명 없이):`;

    const response = await multiModelManager.request(
      prompt,
      '당신은 전문 프로그래머입니다. 안전하고 효율적인 코드를 작성하세요.',
      { primaryModel: 'gpt-4-turbo' }
    );

    // 코드 추출
    const code = response.content
      .replace(/```python\n?/g, '')
      .replace(/```javascript\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    // 자기 학습: 코드 생성 결과에서 학습
    selfLearningSystem.learnFromExperience({
      task: 'code_generation',
      input: { description, language },
      output: { code },
      success: true,
      performance: 0.85,
      patterns: ['ai_code_generation', language],
      improvements: [],
    }).catch(err => console.error('코드 생성 학습 오류:', err));

    return code;
  }

  /**
   * 코드 생성 및 실행
   */
  async generateAndExecute(description: string, language: string = 'python'): Promise<CodeExecution> {
    const code = await this.generateCode(description, language);
    
    if (language === 'python') {
      return await this.executePython(code);
    } else if (language === 'javascript') {
      return await this.executeJavaScript(code);
    } else {
      throw new Error(`지원하지 않는 언어: ${language}`);
    }
  }

  /**
   * 코드 리뷰 및 개선
   */
  async reviewCode(code: string, language: string): Promise<{ review: string; improved: string }> {
    const { multiModelManager } = await import('./multi-model-manager');
    
    const prompt = `다음 ${language} 코드를 리뷰하고 개선하세요:

\`\`\`${language}
${code}
\`\`\`

다음 형식으로 응답하세요:
{
  "review": "코드 리뷰 내용",
  "improved": "개선된 코드"
}`;

    const response = await multiModelManager.request(
      prompt,
      '당신은 코드 리뷰 전문가입니다. 코드의 품질, 성능, 보안을 평가하고 개선하세요.',
      { primaryModel: 'gpt-4-turbo' }
    );

    try {
      return JSON.parse(response.content);
    } catch {
      return {
        review: response.content,
        improved: code,
      };
    }
  }
}

export const codeExecutor = new CodeExecutor();

