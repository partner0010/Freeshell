'use client';

import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles, ArrowLeft, Download, Share2, Copy, Check, History } from 'lucide-react';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import CommentSystem from '@/components/CommentSystem';
import ShareLinkManager from '@/components/ShareLinkManager';
import AICopilot from '@/components/AICopilot';

export default function SparkPage() {
  const params = useParams();
  const [copied, setCopied] = useState(false);

  // 실제로는 API에서 데이터를 가져와야 함
  const sparkData = {
    id: params.id,
    title: '파리 여행 계획',
    content: `# 파리 여행 계획

## 개요
파리를 방문하는 여행객을 위한 종합적인 여행 계획입니다.

## 주요 관광지

### 1. 에펠탑
- 위치: 샹 드 마르스 공원
- 추천 시간: 오전 9시 (사람이 적음)
- 입장료: €29

### 2. 루브르 박물관
- 세계 최대의 미술관
- 추천 시간: 하루 종일
- 입장료: €17

### 3. 노트르담 대성당
- 고딕 건축의 걸작
- 무료 입장

## 식당 추천

1. **Le Comptoir du Relais** - 전통 프랑스 요리
2. **L'As du Fallafel** - 유명한 팔라펠
3. **Angelina** - 유명한 핫 초콜릿

## 숙소 추천

- **호텔**: Hôtel des Grands Boulevards
- **에어비앤비**: 마레 지역 추천
- **예산**: €100-200/박

## 교통

- **파리 비지트 패스**: 지하철 무제한 이용
- **우버/택시**: 편리하지만 비쌈
- **자전거**: 벨리브(Vélib) 공유 자전거

## 팁

- 프랑스어 기본 인사말 배우기
- 팁은 선택사항 (서비스비 포함)
- 카드 결제 선호
`,
    sources: [
      'https://example.com/paris-travel-guide',
      'https://example.com/france-tourism',
      'https://example.com/paris-restaurants',
    ],
    createdAt: '2024-01-15T10:30:00Z',
    model: 'GPT-4.1',
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: sparkData.title,
        text: sparkData.content.substring(0, 100),
        url: window.location.href,
      });
    } else {
      handleCopy();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Link
            href="/"
            className="inline-flex items-center text-primary hover:text-primary-dark mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            돌아가기
          </Link>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold mb-2">{sparkData.title}</h1>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>생성일: {new Date(sparkData.createdAt).toLocaleDateString('ko-KR')}</span>
                    <span>모델: {sparkData.model}</span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={handleCopy}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title="링크 복사"
                >
                  {copied ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
                <button
                  onClick={handleShare}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title="공유"
                >
                  <Share2 className="w-5 h-5" />
                </button>
                <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <Download className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="prose dark:prose-invert max-w-none mb-8">
              <ReactMarkdown>{sparkData.content}</ReactMarkdown>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-lg font-semibold mb-4">참고 출처</h3>
              <div className="space-y-2">
                {sparkData.sources.map((source, index) => (
                  <a
                    key={index}
                    href={source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-primary hover:underline"
                  >
                    {source}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-6">
            <ShareLinkManager itemId={params.id as string} itemType="spark" />
            <CommentSystem itemId={params.id as string} />
          </div>
          
          <AICopilot pageId={params.id as string} pageContent={sparkData.content} />

          <div className="mt-6">
            <Link
              href={`/spark/${params.id}/history`}
              className="inline-flex items-center text-primary hover:text-primary-dark"
            >
              <History className="w-4 h-4 mr-2" />
              버전 히스토리 보기
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

