/**
 * Diff 기반 코드 수정 제안 시스템
 * AI가 코드를 망가뜨리지 않도록 diff 형식으로만 수정 제안
 */

export interface CodeDiff {
  type: 'add' | 'remove' | 'modify' | 'context';
  line: number;
  oldCode?: string;
  newCode?: string;
  description: string;
}

export interface DiffSuggestion {
  file: string;
  diffs: CodeDiff[];
  summary: string;
  reason: string;
}

/**
 * 코드 diff 생성
 */
export function createDiff(
  oldCode: string,
  newCode: string,
  context?: { file?: string; startLine?: number }
): CodeDiff[] {
  const oldLines = oldCode.split('\n');
  const newLines = newCode.split('\n');
  const diffs: CodeDiff[] = [];
  
  // 간단한 diff 알고리즘 (실제로는 더 정교한 알고리즘 사용 권장)
  const maxLength = Math.max(oldLines.length, newLines.length);
  
  for (let i = 0; i < maxLength; i++) {
    const oldLine = oldLines[i];
    const newLine = newLines[i];
    
    if (oldLine === undefined) {
      // 새 라인 추가
      diffs.push({
        type: 'add',
        line: (context?.startLine || 0) + i + 1,
        newCode: newLine,
        description: `라인 ${(context?.startLine || 0) + i + 1}에 추가`,
      });
    } else if (newLine === undefined) {
      // 라인 제거
      diffs.push({
        type: 'remove',
        line: (context?.startLine || 0) + i + 1,
        oldCode: oldLine,
        description: `라인 ${(context?.startLine || 0) + i + 1} 제거`,
      });
    } else if (oldLine !== newLine) {
      // 라인 수정
      diffs.push({
        type: 'modify',
        line: (context?.startLine || 0) + i + 1,
        oldCode: oldLine,
        newCode: newLine,
        description: `라인 ${(context?.startLine || 0) + i + 1} 수정`,
      });
    } else {
      // 컨텍스트 (변경 없음)
      diffs.push({
        type: 'context',
        line: (context?.startLine || 0) + i + 1,
        oldCode: oldLine,
        description: `라인 ${(context?.startLine || 0) + i + 1} (변경 없음)`,
      });
    }
  }
  
  return diffs;
}

/**
 * Diff를 코드에 적용
 */
export function applyDiff(
  originalCode: string,
  diffs: CodeDiff[],
  options?: { contextLines?: number }
): string {
  const lines = originalCode.split('\n');
  const contextLines = options?.contextLines || 0;
  
  // diff를 라인 번호 순으로 정렬
  const sortedDiffs = [...diffs].sort((a, b) => a.line - b.line);
  
  // 역순으로 적용 (라인 번호가 변경되지 않도록)
  for (let i = sortedDiffs.length - 1; i >= 0; i--) {
    const diff = sortedDiffs[i];
    const lineIndex = diff.line - 1;
    
    switch (diff.type) {
      case 'add':
        if (diff.newCode !== undefined) {
          lines.splice(lineIndex, 0, diff.newCode);
        }
        break;
      case 'remove':
        lines.splice(lineIndex, 1);
        break;
      case 'modify':
        if (diff.newCode !== undefined) {
          lines[lineIndex] = diff.newCode;
        }
        break;
      case 'context':
        // 변경 없음
        break;
    }
  }
  
  return lines.join('\n');
}

/**
 * Diff를 마크다운 형식으로 변환
 */
export function diffToMarkdown(diffs: CodeDiff[]): string {
  let markdown = '```diff\n';
  
  for (const diff of diffs) {
    switch (diff.type) {
      case 'add':
        if (diff.newCode !== undefined) {
          markdown += `+ ${diff.newCode}\n`;
        }
        break;
      case 'remove':
        if (diff.oldCode !== undefined) {
          markdown += `- ${diff.oldCode}\n`;
        }
        break;
      case 'modify':
        if (diff.oldCode !== undefined) {
          markdown += `- ${diff.oldCode}\n`;
        }
        if (diff.newCode !== undefined) {
          markdown += `+ ${diff.newCode}\n`;
        }
        break;
      case 'context':
        if (diff.oldCode !== undefined) {
          markdown += `  ${diff.oldCode}\n`;
        }
        break;
    }
  }
  
  markdown += '```';
  return markdown;
}

/**
 * AI 응답에서 diff 추출
 */
export function extractDiffFromAIResponse(response: string): CodeDiff[] | null {
  // 마크다운 diff 블록 찾기
  const diffMatch = response.match(/```diff\n([\s\S]*?)```/);
  if (!diffMatch) return null;
  
  const diffContent = diffMatch[1];
  const lines = diffContent.split('\n');
  const diffs: CodeDiff[] = [];
  let lineNumber = 1;
  
  for (const line of lines) {
    if (line.startsWith('+ ')) {
      diffs.push({
        type: 'add',
        line: lineNumber++,
        newCode: line.substring(2),
        description: `라인 ${lineNumber - 1} 추가`,
      });
    } else if (line.startsWith('- ')) {
      diffs.push({
        type: 'remove',
        line: lineNumber++,
        oldCode: line.substring(2),
        description: `라인 ${lineNumber - 1} 제거`,
      });
    } else if (line.startsWith('  ')) {
      diffs.push({
        type: 'context',
        line: lineNumber++,
        oldCode: line.substring(2),
        description: `라인 ${lineNumber - 1} (변경 없음)`,
      });
    } else {
      lineNumber++;
    }
  }
  
  return diffs.length > 0 ? diffs : null;
}

/**
 * Diff 검증 (안전성 체크)
 */
export function validateDiff(
  originalCode: string,
  diffs: CodeDiff[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const lines = originalCode.split('\n');
  
  for (const diff of diffs) {
    const lineIndex = diff.line - 1;
    
    if (lineIndex < 0 || lineIndex >= lines.length) {
      if (diff.type !== 'add') {
        errors.push(`라인 ${diff.line}이 존재하지 않습니다.`);
      }
    }
    
    if (diff.type === 'modify' || diff.type === 'remove') {
      if (lineIndex >= 0 && lineIndex < lines.length) {
        if (diff.oldCode && lines[lineIndex] !== diff.oldCode) {
          errors.push(`라인 ${diff.line}의 기존 코드가 일치하지 않습니다.`);
        }
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}
