'use client';

import { useState } from 'react';
import InfiniteAI from '@/components/InfiniteAI';
import RevolutionaryAI from '@/components/RevolutionaryAI';
import RealAI from '@/components/RealAI';
import AIComparison from '@/components/AIComparison';
import AIBenchmark from '@/components/AIBenchmark';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Infinity, Sparkles, Cpu, GitCompare, Trophy } from 'lucide-react';

export default function TestAIPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">AI 테스트 센터</h1>
          <p className="text-gray-600">구현된 모든 AI 시스템을 테스트할 수 있습니다</p>
        </div>

        <Tabs defaultValue="benchmark" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="benchmark" className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              벤치마크
            </TabsTrigger>
            <TabsTrigger value="comparison" className="flex items-center gap-2">
              <GitCompare className="w-4 h-4" />
              AI 비교
            </TabsTrigger>
            <TabsTrigger value="infinite" className="flex items-center gap-2">
              <Infinity className="w-4 h-4" />
              무한 AI
            </TabsTrigger>
            <TabsTrigger value="revolutionary" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              독보적 AI
            </TabsTrigger>
            <TabsTrigger value="real" className="flex items-center gap-2">
              <Cpu className="w-4 h-4" />
              실제 AI
            </TabsTrigger>
          </TabsList>

          <TabsContent value="benchmark">
            <AIBenchmark />
          </TabsContent>

          <TabsContent value="comparison">
            <AIComparison />
          </TabsContent>

          <TabsContent value="infinite">
            <InfiniteAI />
          </TabsContent>

          <TabsContent value="revolutionary">
            <RevolutionaryAI />
          </TabsContent>

          <TabsContent value="real">
            <RealAI />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

