/**
 * 코드 자동완성 컴포넌트
 * IntelliSense 스타일 자동완성
 */
'use client';

import { useState, useEffect, useRef } from 'react';
import { Code, Sparkles } from 'lucide-react';

interface Suggestion {
  text: string;
  type: 'keyword' | 'function' | 'variable' | 'property' | 'tag';
  description?: string;
}

interface CodeAutocompleteProps {
  language: 'html' | 'css' | 'javascript';
  value: string;
  cursorPosition: number;
  onSelect: (suggestion: string) => void;
}

const HTML_TAGS = [
  'div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'a', 'img', 'button', 'input', 'form', 'label', 'select', 'textarea',
  'ul', 'ol', 'li', 'table', 'tr', 'td', 'th', 'thead', 'tbody',
  'section', 'article', 'header', 'footer', 'nav', 'aside', 'main',
];

const CSS_PROPERTIES = [
  'color', 'background', 'margin', 'padding', 'border', 'width', 'height',
  'display', 'flex', 'grid', 'position', 'top', 'left', 'right', 'bottom',
  'font-size', 'font-weight', 'text-align', 'line-height', 'opacity',
  'transform', 'transition', 'animation', 'box-shadow', 'border-radius',
];

const JS_KEYWORDS = [
  'const', 'let', 'var', 'function', 'if', 'else', 'for', 'while', 'return',
  'class', 'extends', 'import', 'export', 'async', 'await', 'try', 'catch',
  'document', 'window', 'console', 'Array', 'Object', 'String', 'Number',
];

const JS_FUNCTIONS = [
  'querySelector', 'getElementById', 'addEventListener', 'fetch', 'JSON.parse',
  'setTimeout', 'setInterval', 'map', 'filter', 'reduce', 'forEach',
];

export default function CodeAutocomplete({
  language,
  value,
  cursorPosition,
  onSelect,
}: CodeAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const textBeforeCursor = value.substring(0, cursorPosition);
    const wordMatch = textBeforeCursor.match(/\b(\w+)$/);
    
    if (!wordMatch) {
      setShowSuggestions(false);
      return;
    }

    const currentWord = wordMatch[1].toLowerCase();
    let filtered: Suggestion[] = [];

    if (language === 'html') {
      filtered = HTML_TAGS
        .filter(tag => tag.startsWith(currentWord))
        .map(tag => ({
          text: tag,
          type: 'tag' as const,
          description: `HTML <${tag}> 태그`,
        }));
    } else if (language === 'css') {
      filtered = CSS_PROPERTIES
        .filter(prop => prop.startsWith(currentWord))
        .map(prop => ({
          text: prop,
          type: 'property' as const,
          description: `CSS 속성: ${prop}`,
        }));
    } else if (language === 'javascript') {
      const keywords = JS_KEYWORDS
        .filter(kw => kw.startsWith(currentWord))
        .map(kw => ({
          text: kw,
          type: 'keyword' as const,
        }));
      
      const functions = JS_FUNCTIONS
        .filter(fn => fn.startsWith(currentWord))
        .map(fn => ({
          text: fn,
          type: 'function' as const,
          description: `함수: ${fn}()`,
        }));

      filtered = [...keywords, ...functions];
    }

    if (filtered.length > 0) {
      setSuggestions(filtered.slice(0, 10));
      setShowSuggestions(true);
      setSelectedIndex(0);
    } else {
      setShowSuggestions(false);
    }
  }, [value, cursorPosition, language]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showSuggestions) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % suggestions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        if (suggestions[selectedIndex]) {
          onSelect(suggestions[selectedIndex].text);
          setShowSuggestions(false);
        }
      } else if (e.key === 'Escape') {
        setShowSuggestions(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showSuggestions, suggestions, selectedIndex, onSelect]);

  if (!showSuggestions || suggestions.length === 0) {
    return null;
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'function':
        return <Code className="w-4 h-4 text-blue-500" />;
      case 'keyword':
        return <Sparkles className="w-4 h-4 text-purple-500" />;
      default:
        return <Code className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div
      ref={containerRef}
      className="absolute z-50 bg-white border-2 border-purple-200 rounded-lg shadow-xl max-h-64 overflow-y-auto"
      style={{
        top: '100%',
        left: 0,
        minWidth: '200px',
      }}
    >
      {suggestions.map((suggestion, index) => (
        <div
          key={index}
          onClick={() => {
            onSelect(suggestion.text);
            setShowSuggestions(false);
          }}
          className={`px-4 py-2 cursor-pointer flex items-center gap-2 transition-colors ${
            index === selectedIndex
              ? 'bg-purple-100 text-purple-900'
              : 'hover:bg-gray-100'
          }`}
        >
          {getTypeIcon(suggestion.type)}
          <div className="flex-1">
            <div className="font-medium">{suggestion.text}</div>
            {suggestion.description && (
              <div className="text-xs text-gray-500">{suggestion.description}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
