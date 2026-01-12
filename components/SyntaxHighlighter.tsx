/**
 * 간단한 코드 하이라이팅 컴포넌트
 * 코드를 색상으로 구분하여 표시
 */
'use client';

import { useMemo } from 'react';

interface SyntaxHighlighterProps {
  code: string;
  language: 'html' | 'css' | 'javascript';
}

export default function SyntaxHighlighter({ code, language }: SyntaxHighlighterProps) {
  const highlightedCode = useMemo(() => {
    if (language === 'html') {
      return highlightHTML(code);
    } else if (language === 'css') {
      return highlightCSS(code);
    } else if (language === 'javascript') {
      return highlightJS(code);
    }
    return code;
  }, [code, language]);

  return (
    <pre className="syntax-highlighted">
      <code dangerouslySetInnerHTML={{ __html: highlightedCode }} />
    </pre>
  );
}

function highlightHTML(code: string): string {
  return code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/(&lt;\/?)([\w]+)(.*?)(&gt;)/g, (match, open, tag, attrs, close) => {
      return `${open}<span class="html-tag">${tag}</span>${attrs}${close}`;
    })
    .replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="html-comment">$1</span>')
    .replace(/(&quot;[^&quot;]*&quot;)/g, '<span class="html-string">$1</span>');
}

function highlightCSS(code: string): string {
  return code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/([\w-]+)(\s*\{)/g, '<span class="css-selector">$1</span>$2')
    .replace(/([\w-]+)(\s*:)/g, '<span class="css-property">$1</span>$2')
    .replace(/(:\s*)([^;]+)(;)/g, '$1<span class="css-value">$2</span>$3')
    .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="css-comment">$1</span>');
}

function highlightJS(code: string): string {
  const keywords = ['function', 'const', 'let', 'var', 'if', 'else', 'for', 'while', 'return', 'async', 'await', 'class', 'export', 'import', 'default'];
  const builtins = ['document', 'window', 'console', 'Array', 'Object', 'String', 'Number', 'Boolean', 'Date', 'Math'];
  
  let highlighted = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // 키워드 하이라이팅
  keywords.forEach(keyword => {
    const regex = new RegExp(`\\b(${keyword})\\b`, 'g');
    highlighted = highlighted.replace(regex, '<span class="js-keyword">$1</span>');
  });

  // 내장 함수 하이라이팅
  builtins.forEach(builtin => {
    const regex = new RegExp(`\\b(${builtin})\\b`, 'g');
    highlighted = highlighted.replace(regex, '<span class="js-builtin">$1</span>');
  });

  // 문자열 하이라이팅
  highlighted = highlighted.replace(/(['"`])((?:\\.|(?!\1)[^\\])*?)(\1)/g, '<span class="js-string">$1$2$3</span>');
  
  // 숫자 하이라이팅
  highlighted = highlighted.replace(/\b(\d+\.?\d*)\b/g, '<span class="js-number">$1</span>');
  
  // 주석 하이라이팅
  highlighted = highlighted.replace(/(\/\/.*$)/gm, '<span class="js-comment">$1</span>');
  highlighted = highlighted.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="js-comment">$1</span>');

  return highlighted;
}
