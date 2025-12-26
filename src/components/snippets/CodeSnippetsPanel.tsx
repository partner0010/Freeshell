'use client';

import React, { useState, useEffect } from 'react';
import { Code, Search, Download, Copy, Star, Filter } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Dropdown } from '@/components/ui/Dropdown';
import { Badge } from '@/components/ui/Badge';
import { codeSnippetsLibrary, type CodeSnippet } from '@/lib/snippets/code-snippets-library';
import { useToast } from '@/components/ui/Toast';

export function CodeSnippetsPanel() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [language, setLanguage] = useState<string>('all');
  const [snippets, setSnippets] = useState<CodeSnippet[]>([]);
  const [selectedSnippet, setSelectedSnippet] = useState<CodeSnippet | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    loadSnippets();
  }, [query, category, language]);

  const loadSnippets = () => {
    const results = codeSnippetsLibrary.searchSnippets(
      query,
      category === 'all' ? undefined : category,
      language === 'all' ? undefined : language
    );
    setSnippets(results);
  };

  const categories = [
    { value: 'all', label: '전체' },
    { value: 'component', label: '컴포넌트' },
    { value: 'utility', label: '유틸리티' },
    { value: 'hook', label: 'Hook' },
    { value: 'api', label: 'API' },
    { value: 'style', label: '스타일' },
    { value: 'animation', label: '애니메이션' },
  ];

  const languages = [
    { value: 'all', label: '전체 언어' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'javascript', label: 'JavaScript' },
    { value: 'css', label: 'CSS' },
    { value: 'html', label: 'HTML' },
  ];

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    showToast({ type: 'success', message: '코드가 복사되었습니다' });
  };

  const handleDownload = (snippet: CodeSnippet) => {
    codeSnippetsLibrary.downloadSnippet(snippet.id);
    showToast({ type: 'success', message: '스니펫이 다운로드되었습니다' });
  };

  const getLanguageColor = (lang: string) => {
    const colors: Record<string, string> = {
      typescript: 'bg-blue-100 text-blue-700',
      javascript: 'bg-yellow-100 text-yellow-700',
      css: 'bg-purple-100 text-purple-700',
      html: 'bg-orange-100 text-orange-700',
    };
    return colors[lang] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-6 border-b">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <Code className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">코드 스니펫 라이브러리</h2>
            <p className="text-sm text-gray-500">재사용 가능한 코드 스니펫 검색 및 공유</p>
          </div>
        </div>

        {/* 검색 및 필터 */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="스니펫 검색..."
              className="pl-10"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Dropdown
              options={categories}
              value={category}
              onChange={setCategory}
              placeholder="카테고리"
            />
            <Dropdown
              options={languages}
              value={language}
              onChange={setLanguage}
              placeholder="언어"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* 스니펫 목록 */}
          <div className="space-y-3">
            {snippets.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                검색 결과가 없습니다
              </div>
            ) : (
              snippets.map((snippet) => (
                <Card
                  key={snippet.id}
                  hover
                  className={`cursor-pointer ${
                    selectedSnippet?.id === snippet.id ? 'ring-2 ring-primary-500' : ''
                  }`}
                  onClick={() => setSelectedSnippet(snippet)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 mb-1">{snippet.title}</h4>
                        <p className="text-xs text-gray-500 line-clamp-2">{snippet.description}</p>
                      </div>
                      <Badge variant="outline" size="sm" className={getLanguageColor(snippet.language)}>
                        {snippet.language}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <div className="flex items-center gap-1">
                        <Download size={12} />
                        {snippet.downloads}
                      </div>
                      <div className="flex items-center gap-1">
                        <Star size={12} className="text-yellow-500 fill-current" />
                        {snippet.rating}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* 선택된 스니펫 상세 */}
          <div>
            {selectedSnippet ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{selectedSnippet.title}</CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopy(selectedSnippet.code)}
                      >
                        <Copy size={14} className="mr-1" />
                        복사
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(selectedSnippet)}
                      >
                        <Download size={14} className="mr-1" />
                        다운로드
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-3">
                    <p className="text-sm text-gray-600 mb-2">{selectedSnippet.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedSnippet.tags.map((tag) => (
                        <Badge key={tag} variant="outline" size="sm">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto text-sm">
                    <code>{selectedSnippet.code}</code>
                  </pre>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 text-center text-gray-400">
                  스니펫을 선택하세요
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

