'use client';

import { useState } from 'react';
import AIProcessViewer from '@/components/AIProcessViewer';
import AIComparison from '@/components/AIComparison';
import AIBenchmark from '@/components/AIBenchmark';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, GitCompare, Trophy, Search } from 'lucide-react';
import SearchEngine from '@/components/SearchEngine';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function TestAIPage() {
  const [processId, setProcessId] = useState<string | undefined>();
  const [query, setQuery] = useState('');

  const handleSearchComplete = (result: any) => {
    if (result.processId) {
      setProcessId(result.processId);
      setQuery(result.title || '');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Navbar />
      <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">AI 처리 과정 추적 센터</h1>
            <p className="text-gray-600">
              AI가 어떻게 생각하고, 데이터를 수집하고, 분석하는지 단계별로 확인할 수 있습니다
            </p>
          </div>

          <Tabs defaultValue="process" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="process" className="flex items-center gap-2">
                <Brain className="w-4 h-4" />
                AI 처리 과정
              </TabsTrigger>
              <TabsTrigger value="benchmark" className="flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                벤치마크
              </TabsTrigger>
              <TabsTrigger value="comparison" className="flex items-center gap-2">
                <GitCompare className="w-4 h-4" />
                AI 비교
              </TabsTrigger>
            </TabsList>

          <TabsContent value="process">
            <div className="space-y-6">
              {/* 검색 영역 */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  질문 입력
                </h2>
                <SearchEngine onComplete={handleSearchComplete} />
              </div>

              {/* 처리 과정 뷰어 */}
              {processId && (
                <AIProcessViewer processId={processId} query={query} />
              )}

              {!processId && (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                  <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    위에서 질문을 입력하고 검색하면 AI의 처리 과정을 단계별로 확인할 수 있습니다.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="benchmark">
            <AIBenchmark />
          </TabsContent>

          <TabsContent value="comparison">
            <AIComparison />
          </TabsContent>
        </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}

