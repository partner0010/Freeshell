/**
 * 에디터 도움말 및 가이드 패널
 */
'use client';

import { useState } from 'react';
import { 
  HelpCircle, 
  BookOpen, 
  Lightbulb, 
  Code, 
  Search,
  Video,
  FileText,
  Zap,
  CheckCircle,
  ArrowRight,
  X
} from 'lucide-react';
import ScrollAnimation from './ScrollAnimation';
import EnhancedCard from './EnhancedCard';

interface HelpSection {
  id: string;
  title: string;
  icon: any;
  content: {
    title: string;
    description: string;
    examples?: string[];
    tips?: string[];
  }[];
}

const helpSections: HelpSection[] = [
  {
    id: 'getting-started',
    title: '시작하기',
    icon: Zap,
    content: [
      {
        title: '에디터 기본 사용법',
        description: '코드 편집과 시각적 편집 모드를 전환하여 웹사이트를 만들 수 있습니다.',
        examples: [
          '코드 편집 모드: HTML, CSS, JavaScript를 직접 작성',
          '시각적 편집 모드: WYSIWYG 방식으로 편집',
          '미리보기: 실시간으로 변경사항 확인',
        ],
        tips: [
          'Ctrl+Enter로 코드 자동 포맷팅',
          'Tab 키로 들여쓰기',
          '자동 저장은 2초마다 실행됩니다',
        ],
      },
      {
        title: '파일 관리',
        description: '여러 파일을 탭으로 관리하고 저장/다운로드할 수 있습니다.',
        examples: [
          '파일 탭 클릭으로 파일 전환',
          '저장 버튼으로 수동 저장',
          '다운로드 버튼으로 파일 다운로드',
        ],
      },
    ],
  },
  {
    id: 'features',
    title: '주요 기능',
    icon: Code,
    content: [
      {
        title: '코드 자동완성',
        description: 'HTML, CSS, JavaScript 키워드를 자동으로 완성해줍니다.',
        examples: [
          'HTML: 태그 이름 입력 시 자동완성',
          'CSS: 속성 이름 입력 시 자동완성',
          'JavaScript: 함수/키워드 입력 시 자동완성',
        ],
        tips: [
          '↑↓ 키로 제안 목록 이동',
          'Enter 또는 Tab으로 선택',
          'Esc로 자동완성 닫기',
        ],
      },
      {
        title: 'AI 코드 분석',
        description: 'AI가 코드를 분석하여 버그, 최적화, 개선사항을 제안합니다.',
        examples: [
          '버그 발견 시 수정 제안',
          '성능 최적화 제안',
          '디자인 개선 제안',
        ],
      },
      {
        title: '컴포넌트 라이브러리',
        description: '재사용 가능한 UI 컴포넌트를 쉽게 추가할 수 있습니다.',
        examples: [
          '버튼, 카드, 폼 등 다양한 컴포넌트',
          '클릭 한 번으로 코드 삽입',
          '커스터마이징 가능',
        ],
      },
      {
        title: '버전 관리',
        description: '변경 이력을 저장하고 이전 버전으로 되돌릴 수 있습니다.',
        examples: [
          '최대 50개 버전 저장',
          '버전별 복구 가능',
          '버전 삭제 가능',
        ],
      },
    ],
  },
  {
    id: 'shortcuts',
    title: '키보드 단축키',
    icon: Zap,
    content: [
      {
        title: '편집 단축키',
        description: '빠른 편집을 위한 키보드 단축키',
        examples: [
          'Ctrl+Enter: 코드 포맷팅',
          'Tab: 들여쓰기',
          'Ctrl+S: 저장',
          'Ctrl+Z: 실행 취소',
          'Ctrl+Y: 다시 실행',
        ],
      },
      {
        title: '자동완성 단축키',
        description: '자동완성 사용 단축키',
        examples: [
          '↑↓: 제안 목록 이동',
          'Enter: 선택',
          'Tab: 선택',
          'Esc: 닫기',
        ],
      },
    ],
  },
  {
    id: 'tips',
    title: '팁 & 트릭',
    icon: Lightbulb,
    content: [
      {
        title: '성능 최적화',
        description: '더 빠른 웹사이트를 만드는 팁',
        tips: [
          '이미지는 최적화된 형식 사용 (WebP, AVIF)',
          'CSS는 최소화하고 불필요한 스타일 제거',
          'JavaScript는 필요한 부분만 로드',
          '캐싱을 활용하여 반복 요청 최소화',
        ],
      },
      {
        title: '접근성 개선',
        description: '모든 사용자가 사용할 수 있도록',
        tips: [
          'alt 속성으로 이미지 설명 추가',
          '시맨틱 HTML 태그 사용',
          '키보드 네비게이션 지원',
          '색상 대비 비율 확인',
        ],
      },
      {
        title: '반응형 디자인',
        description: '모든 기기에서 잘 보이도록',
        tips: [
          '미디어 쿼리 사용',
          '유연한 단위 사용 (%, rem, em)',
          '모바일 우선 설계',
          '터치 친화적 버튼 크기',
        ],
      },
    ],
  },
];

export default function EditorHelpPanel() {
  const [selectedSection, setSelectedSection] = useState<string>('getting-started');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSections = helpSections.map(section => ({
    ...section,
    content: section.content.filter(item =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter(section => section.content.length > 0);

  const currentSection = filteredSections.find(s => s.id === selectedSection) || filteredSections[0];

  return (
    <div className="w-96 bg-white border-l border-gray-200 flex flex-col h-full">
      {/* 헤더 */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-gray-900">도움말 & 가이드</h3>
          </div>
        </div>
        
        {/* 검색 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="검색..."
            className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 text-sm"
          />
        </div>
      </div>

      {/* 섹션 목록 */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2 mb-4">
          {filteredSections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setSelectedSection(section.id)}
                className={`w-full text-left p-3 rounded-lg transition-colors flex items-center gap-3 ${
                  selectedSection === section.id
                    ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-2 border-transparent'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{section.title}</span>
              </button>
            );
          })}
        </div>

        {/* 선택된 섹션 내용 */}
        {currentSection && (
          <div className="space-y-4">
            {currentSection.content.map((item, index) => (
              <ScrollAnimation key={index} direction="up" delay={index * 50}>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-2">{item.title}</h4>
                  <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                  
                  {item.examples && item.examples.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-semibold text-gray-700 mb-2">예시:</p>
                      <ul className="space-y-1">
                        {item.examples.map((example, idx) => (
                          <li key={idx} className="text-xs text-gray-600 flex items-start gap-2">
                            <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>{example}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {item.tips && item.tips.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-yellow-700 mb-2 flex items-center gap-1">
                        <Lightbulb className="w-3 h-3" />
                        팁:
                      </p>
                      <ul className="space-y-1">
                        {item.tips.map((tip, idx) => (
                          <li key={idx} className="text-xs text-gray-600 flex items-start gap-2">
                            <ArrowRight className="w-3 h-3 text-purple-500 mt-0.5 flex-shrink-0" />
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </ScrollAnimation>
            ))}
          </div>
        )}
      </div>

      {/* 빠른 링크 */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <p className="text-xs font-semibold text-gray-700 mb-2">빠른 링크:</p>
        <div className="flex flex-wrap gap-2">
          <a
            href="/help"
            target="_blank"
            className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
          >
            전체 도움말
          </a>
          <a
            href="/templates/website"
            target="_blank"
            className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
          >
            템플릿 갤러리
          </a>
        </div>
      </div>
    </div>
  );
}
