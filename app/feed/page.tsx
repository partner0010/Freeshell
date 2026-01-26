'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Heart, MessageCircle, Share2, TrendingUp, Clock } from 'lucide-react';

interface FeedItem {
  id: string;
  title: string;
  author: string;
  avatar?: string;
  content: string;
  image?: string;
  likes: number;
  comments: number;
  shares: number;
  timestamp: string;
  category: string;
}

export default function FeedPage() {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 피드 데이터 로드
    loadFeed();
  }, []);

  const loadFeed = async () => {
    try {
      const response = await fetch('/api/recommendation/feed?limit=20');
      if (response.ok) {
        const data = await response.json();
        // API 응답 형식에 맞게 변환
        setFeedItems(data.items || []);
      }
    } catch (error) {
      console.error('피드 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-24">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">피드</h1>
          <p className="text-gray-600">커뮤니티의 최신 콘텐츠를 확인하세요</p>
        </div>

        {/* 피드 목록 */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">피드를 불러오는 중...</p>
          </div>
        ) : feedItems.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-300">
            <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">아직 피드가 없습니다</h3>
            <p className="text-gray-600 mb-6">콘텐츠를 생성하고 공유하면 피드에 표시됩니다</p>
            <a
              href="/allinone-studio/create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              콘텐츠 생성하기
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {feedItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                {/* 작성자 정보 */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                    {item.avatar ? (
                      <img src={item.avatar} alt={item.author} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      item.author.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{item.author}</div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>{item.timestamp}</span>
                      {item.category && (
                        <>
                          <span>•</span>
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
                            {item.category}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* 콘텐츠 */}
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-700 leading-relaxed">{item.content}</p>
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full rounded-lg mt-4 object-cover max-h-96"
                    />
                  )}
                </div>

                {/* 액션 버튼 */}
                <div className="flex items-center gap-6 pt-4 border-t border-gray-200">
                  <button className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors">
                    <Heart className="w-5 h-5" />
                    <span>{item.likes}</span>
                  </button>
                  <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
                    <MessageCircle className="w-5 h-5" />
                    <span>{item.comments}</span>
                  </button>
                  <button className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors">
                    <Share2 className="w-5 h-5" />
                    <span>{item.shares}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
