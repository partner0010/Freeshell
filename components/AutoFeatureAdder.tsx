/**
 * 자동 기능 추가 컴포넌트
 * 사용자가 원하는 기능을 자동으로 추가
 */
'use client';

import { useState } from 'react';
import { 
  Plus, 
  Sparkles, 
  CheckCircle, 
  X,
  Wand2,
  Loader2
} from 'lucide-react';
import EnhancedButton from './EnhancedButton';
import EnhancedCard from './EnhancedCard';

interface Feature {
  id: string;
  name: string;
  description: string;
  category: 'navigation' | 'form' | 'content' | 'interaction' | 'media' | 'social';
  code: {
    html: string;
    css: string;
    js?: string;
  };
}

const availableFeatures: Feature[] = [
  {
    id: 'navbar',
    name: '네비게이션 바',
    description: '반응형 네비게이션 메뉴',
    category: 'navigation',
    code: {
      html: '<nav class="navbar"><ul><li><a href="#home">Home</a></li></ul></nav>',
      css: '.navbar { display: flex; justify-content: space-between; }',
    },
  },
  {
    id: 'contact-form',
    name: '연락처 폼',
    description: '이메일 전송 폼',
    category: 'form',
    code: {
      html: '<form class="contact-form"><input type="email" placeholder="Email"><button>전송</button></form>',
      css: '.contact-form { max-width: 500px; margin: 0 auto; }',
    },
  },
  {
    id: 'image-gallery',
    name: '이미지 갤러리',
    description: '반응형 이미지 갤러리',
    category: 'media',
    code: {
      html: '<div class="gallery"><img src="image1.jpg" alt="Image 1"></div>',
      css: '.gallery { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }',
    },
  },
  {
    id: 'social-share',
    name: '소셜 공유 버튼',
    description: 'SNS 공유 버튼',
    category: 'social',
    code: {
      html: '<div class="social-share"><button>Facebook</button><button>Twitter</button></div>',
      css: '.social-share { display: flex; gap: 1rem; }',
    },
  },
  {
    id: 'modal',
    name: '모달 창',
    description: '팝업 모달',
    category: 'interaction',
    code: {
      html: '<div class="modal"><div class="modal-content"><span class="close">&times;</span><p>모달 내용</p></div></div>',
      css: '.modal { display: none; position: fixed; z-index: 1000; }',
      js: 'document.querySelector(".close").addEventListener("click", () => { document.querySelector(".modal").style.display = "none"; });',
    },
  },
];

export default function AutoFeatureAdder({
  files,
  onFilesChange,
}: {
  files: Array<{ name: string; type: string; content: string }>;
  onFilesChange: (files: Array<{ name: string; type: string; content: string }>) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAdding, setIsAdding] = useState<string | null>(null);

  const categories = [
    { id: 'all', name: '전체' },
    { id: 'navigation', name: '네비게이션' },
    { id: 'form', name: '폼' },
    { id: 'content', name: '콘텐츠' },
    { id: 'interaction', name: '인터랙션' },
    { id: 'media', name: '미디어' },
    { id: 'social', name: '소셜' },
  ];

  const filteredFeatures = selectedCategory === 'all'
    ? availableFeatures
    : availableFeatures.filter(f => f.category === selectedCategory);

  const addFeature = (feature: Feature) => {
    setIsAdding(feature.id);
    
    setTimeout(() => {
      const newFiles = [...files];
      
      // HTML 파일 찾기
      const htmlFile = newFiles.find(f => f.name.includes('html') || f.name.includes('index'));
      if (htmlFile) {
        // body 태그 안에 추가
        const bodyMatch = htmlFile.content.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        if (bodyMatch) {
          htmlFile.content = htmlFile.content.replace(
            /(<body[^>]*>)([\s\S]*?)(<\/body>)/i,
            `$1$2${feature.code.html}$3`
          );
        } else {
          htmlFile.content += feature.code.html;
        }
      }

      // CSS 파일 찾기
      const cssFile = newFiles.find(f => f.name.includes('css') || f.name.includes('style'));
      if (cssFile) {
        cssFile.content += '\n\n' + feature.code.css;
      } else {
        // CSS 파일이 없으면 생성
        newFiles.push({
          name: 'style.css',
          type: 'css',
          content: feature.code.css,
        });
      }

      // JavaScript 파일 찾기
      if (feature.code.js) {
        const jsFile = newFiles.find(f => f.name.includes('js') || f.name.includes('script'));
        if (jsFile) {
          jsFile.content += '\n\n' + feature.code.js;
        } else {
          newFiles.push({
            name: 'script.js',
            type: 'javascript',
            content: feature.code.js,
          });
        }
      }

      onFilesChange(newFiles);
      setIsAdding(null);
      setIsOpen(false);
    }, 500);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 z-50 p-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full shadow-lg hover:scale-110 transition-transform"
        title="기능 추가"
      >
        <Plus className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <EnhancedCard className="max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Wand2 className="w-6 h-6 text-purple-600" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">기능 추가</h2>
                <p className="text-sm text-gray-600">원하는 기능을 선택하면 자동으로 코드가 추가됩니다</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 카테고리 필터 */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* 기능 목록 */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredFeatures.map(feature => (
              <div
                key={feature.id}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-300 transition-colors"
              >
                <h3 className="font-semibold text-gray-900 mb-1">{feature.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{feature.description}</p>
                <EnhancedButton
                  variant="outline"
                  size="sm"
                  onClick={() => addFeature(feature)}
                  loading={isAdding === feature.id}
                  icon={isAdding === feature.id ? Loader2 : Plus}
                  fullWidth
                >
                  {isAdding === feature.id ? '추가 중...' : '추가하기'}
                </EnhancedButton>
              </div>
            ))}
          </div>
        </div>
      </EnhancedCard>
    </div>
  );
}
