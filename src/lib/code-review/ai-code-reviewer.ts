/**
 * AI 코드 리뷰어
 * AI Code Reviewer
 * 자기 학습 시스템 통합: 리뷰 결과에서 학습하여 정확도 향상
 */

import { selfLearningSystem } from '@/lib/ai/self-learning';
import { selfMonitoringSystem } from '@/lib/ai/self-monitoring';
import { selfImprovementSystem } from '@/lib/ai/self-improvement';

export type ReviewSeverity = 'error' | 'warning' | 'info' | 'suggestion';

export interface CodeIssue {
  line: number;
  column?: number;
  severity: ReviewSeverity;
  message: string;
  rule: string;
  suggestion?: string;
}

export interface CodeReview {
  file: string;
  issues: CodeIssue[];
  score: number; // 0-100
  summary: string;
  suggestions: string[];
}

// AI 코드 리뷰어
export class AICodeReviewer {
  // 코드 리뷰 실행
  async reviewCode(code: string, language: string = 'typescript'): Promise<CodeReview> {
    // 실제로는 AI API 호출
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const issues: CodeIssue[] = [];

    // 기본 검사 (시뮬레이션)
    const lines = code.split('\n');
    lines.forEach((line, index) => {
      // console.log 검사
      if (line.includes('console.log') && !line.includes('//')) {
        issues.push({
          line: index + 1,
          severity: 'warning',
          message: 'console.log는 프로덕션에서 제거해야 합니다',
          rule: 'no-console',
          suggestion: '로거를 사용하거나 개발 환경에서만 사용하세요',
        });
      }

      // TODO/FIXME 검사
      if (line.includes('TODO') || line.includes('FIXME')) {
        issues.push({
          line: index + 1,
          severity: 'info',
          message: `미완성 코드 발견: ${line.trim()}`,
          rule: 'no-todo',
          suggestion: 'TODO 항목을 완료하거나 제거하세요',
        });
      }

      // 에러 핸들링 검사
      if (line.includes('catch') && !line.includes('Error')) {
        issues.push({
          line: index + 1,
          severity: 'warning',
          message: '에러 객체를 명시적으로 처리해야 합니다',
          rule: 'error-handling',
          suggestion: 'catch (error: Error) 형태로 수정하세요',
        });
      }
    });

    const score = Math.max(0, 100 - issues.length * 5);
    const summary = this.generateSummary(issues, score);
    const suggestions = this.generateSuggestions(issues);

    const review: CodeReview = {
      file: 'reviewed-file.ts',
      issues,
      score,
      summary,
      suggestions,
    };

    // 자기 학습: 리뷰 결과에서 학습
    selfLearningSystem.learnFromExperience({
      task: 'code_review',
      input: { codeLength: code.length, language },
      output: review,
      success: score >= 70,
      performance: score / 100,
      patterns: issues.map(i => i.rule),
      improvements: suggestions,
    }).catch(err => console.error('코드 리뷰 학습 오류:', err));

    // 자기 모니터링: 성능 추적
    selfMonitoringSystem.recordPerformance({
      task: 'code_review',
      performance: score / 100,
      timestamp: new Date(),
    }).catch(err => console.error('성능 모니터링 오류:', err));

    // 성능이 낮으면 자기 개선 트리거
    if (score < 70) {
      selfImprovementSystem.triggerImprovement({
        issue: `코드 리뷰 점수가 낮습니다 (${score}/100)`,
        context: {
          issuesCount: issues.length,
          errorCount: issues.filter(i => i.severity === 'error').length,
        },
      }).catch(err => console.error('자기 개선 트리거 오류:', err));
    }

    return review;
  }

  // 요약 생성
  private generateSummary(issues: CodeIssue[], score: number): string {
    const errorCount = issues.filter((i) => i.severity === 'error').length;
    const warningCount = issues.filter((i) => i.severity === 'warning').length;

    if (score >= 90) {
      return `우수한 코드입니다! ${errorCount}개의 오류와 ${warningCount}개의 경고가 발견되었습니다.`;
    } else if (score >= 70) {
      return `양호한 코드입니다. ${errorCount}개의 오류와 ${warningCount}개의 경고를 수정하면 더 좋아질 것입니다.`;
    } else {
      return `개선이 필요합니다. ${errorCount}개의 오류와 ${warningCount}개의 경고를 확인해주세요.`;
    }
  }

  // 제안 생성
  private generateSuggestions(issues: CodeIssue[]): string[] {
    const suggestions: string[] = [];

    const hasConsoleLog = issues.some((i) => i.rule === 'no-console');
    if (hasConsoleLog) {
      suggestions.push('console.log를 로거로 대체하는 것을 권장합니다');
    }

    const hasErrorHandling = issues.some((i) => i.rule === 'error-handling');
    if (hasErrorHandling) {
      suggestions.push('에러 핸들링을 개선하여 안정성을 높이세요');
    }

    return suggestions;
  }

  // 여러 파일 리뷰
  async reviewFiles(files: { path: string; code: string }[]): Promise<CodeReview[]> {
    const reviews = await Promise.all(
      files.map((file) => this.reviewCode(file.code))
    );
    return reviews.map((review, index) => ({
      ...review,
      file: files[index].path,
    }));
  }
}

export const aiCodeReviewer = new AICodeReviewer();

