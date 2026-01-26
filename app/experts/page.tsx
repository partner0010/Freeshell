'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Star, MessageCircle, Award, TrendingUp, Users } from 'lucide-react';

interface Expert {
  id: string;
  name: string;
  title: string;
  avatar?: string;
  rating: number;
  reviews: number;
  specialties: string[];
  bio: string;
  verified: boolean;
}

export default function ExpertsPage() {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadExperts();
  }, [selectedCategory]);

  const loadExperts = async () => {
    setIsLoading(true);
    try {
      // 전문가 데이터 로드 (실제 API 연결 필요)
      // 임시로 샘플 데이터 사용
      const sampleExperts: Expert[] = [
        {
          id: '1',
          name: 'AI 콘텐츠 전문가',
          title: '콘텐츠 크리에이터',
          rating: 4.9,
          reviews: 127,
          specialties: ['유튜브', '블로그', 'SNS'],
          bio: '10년 이상의 경력을 가진 콘텐츠 크리에이터입니다.',
          verified: true,
        },
        {
          id: '2',
          name: '웹 개발 전문가',
          title: '풀스택 개발자',
          rating: 4.8,
          reviews: 89,
          specialties: ['웹 개발', '앱 개발', '디자인'],
          bio: '다양한 웹사이트와 앱을 제작한 경험이 있습니다.',
          verified: true,
        },
      ];
      setExperts(sampleExperts);
    } catch (error) {
      console.error('전문가 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const categories = [
    { id: 'all', name: '전체' },
    { id: 'content', name: '콘텐츠' },
    { id: 'development', name: '개발' },
    { id: 'design', name: '디자인' },
    { id: 'marketing', name: '마케팅' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-24">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">전문가</h1>
          <p className="text-gray-600">검증된 전문가들과 협업하세요</p>
        </div>

        {/* 카테고리 필터 */}
        <div className="mb-8">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* 전문가 목록 */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">전문가 목록을 불러오는 중...</p>
          </div>
        ) : experts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-300">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">전문가가 없습니다</h3>
            <p className="text-gray-600">곧 전문가들이 등록될 예정입니다</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {experts.map((expert) => (
              <div
                key={expert.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                {/* 전문가 정보 */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                    {expert.avatar ? (
                      <img src={expert.avatar} alt={expert.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      expert.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-900 truncate">{expert.name}</h3>
                      {expert.verified && (
                        <Award className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{expert.title}</p>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-semibold text-gray-900">{expert.rating}</span>
                      <span className="text-sm text-gray-500">({expert.reviews}개 리뷰)</span>
                    </div>
                  </div>
                </div>

                {/* 전문 분야 */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {expert.specialties.map((specialty, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 소개 */}
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{expert.bio}</p>

                {/* 액션 버튼 */}
                <button className="w-full py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                  상담하기
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
