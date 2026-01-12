/**
 * 컴포넌트 라이브러리
 * 재사용 가능한 UI 컴포넌트를 드래그 앤 드롭으로 추가
 */
'use client';

import { useState } from 'react';
import { 
  Layout, 
  MousePointerClick as Button, 
  Image, 
  Video, 
  Type, 
  Grid, 
  Search,
  Menu,
  X,
  Plus
} from 'lucide-react';

interface Component {
  id: string;
  name: string;
  category: string;
  icon: any;
  code: {
    html: string;
    css: string;
    js?: string;
  };
  description: string;
}

const components: Component[] = [
  {
    id: 'button-primary',
    name: '기본 버튼',
    category: 'buttons',
    icon: Button,
    code: {
      html: '<button class="btn-primary">버튼</button>',
      css: `.btn-primary {
    padding: 0.75rem 1.5rem;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 0.5rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.3s;
}

.btn-primary:hover {
    background: #2563eb;
}`,
    },
    description: '기본 스타일의 버튼',
  },
  {
    id: 'button-gradient',
    name: '그라데이션 버튼',
    category: 'buttons',
    icon: Button,
    code: {
      html: '<button class="btn-gradient">그라데이션 버튼</button>',
      css: `.btn-gradient {
    padding: 0.75rem 1.5rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 0.5rem;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s;
}

.btn-gradient:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(102, 126, 234, 0.4);
}`,
    },
    description: '그라데이션 효과 버튼',
  },
  {
    id: 'button-glass',
    name: '글래스모피즘 버튼',
    category: 'buttons',
    icon: Button,
    code: {
      html: '<button class="btn-glass">글래스 버튼</button>',
      css: `.btn-glass {
    padding: 0.75rem 1.5rem;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 0.5rem;
    color: white;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
}

.btn-glass:hover {
    background: rgba(255, 255, 255, 0.2);
}`,
    },
    description: '글래스모피즘 스타일 버튼',
  },
  {
    id: 'card',
    name: '카드',
    category: 'layout',
    icon: Layout,
    code: {
      html: `<div class="card">
    <h3>카드 제목</h3>
    <p>카드 내용입니다.</p>
</div>`,
      css: `.card {
    background: white;
    border-radius: 0.5rem;
    padding: 1.5rem;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    transition: transform 0.3s;
}

.card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}`,
    },
    description: '기본 카드 컴포넌트',
  },
  {
    id: 'navbar',
    name: '네비게이션 바',
    category: 'navigation',
    icon: Menu,
    code: {
      html: `<nav class="navbar">
    <div class="logo">Logo</div>
    <ul class="nav-links">
        <li><a href="#home">홈</a></li>
        <li><a href="#about">소개</a></li>
        <li><a href="#contact">연락</a></li>
    </ul>
</nav>`,
      css: `.navbar {
    background: white;
    padding: 1rem 2rem;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.nav-links {
    display: flex;
    list-style: none;
    gap: 2rem;
}

.nav-links a {
    text-decoration: none;
    color: #333;
    font-weight: 500;
}`,
    },
    description: '기본 네비게이션 바',
  },
  {
    id: 'hero-section',
    name: '히어로 섹션',
    category: 'sections',
    icon: Type,
    code: {
      html: `<section class="hero">
    <h1>메인 타이틀</h1>
    <p>서브 타이틀 또는 설명</p>
    <button class="cta-button">시작하기</button>
</section>`,
      css: `.hero {
    text-align: center;
    padding: 5rem 2rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

.hero h1 {
    font-size: 3rem;
    margin-bottom: 1rem;
}

.cta-button {
    padding: 1rem 2rem;
    background: white;
    color: #3b82f6;
    border: none;
    border-radius: 0.5rem;
    font-weight: 600;
    cursor: pointer;
}`,
    },
    description: '히어로 섹션',
  },
  {
    id: 'image-gallery',
    name: '이미지 갤러리',
    category: 'media',
    icon: Image,
    code: {
      html: `<div class="gallery">
    <div class="gallery-item"></div>
    <div class="gallery-item"></div>
    <div class="gallery-item"></div>
</div>`,
      css: `.gallery {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
}

.gallery-item {
    aspect-ratio: 1;
    background: #e5e7eb;
    border-radius: 0.5rem;
}`,
    },
    description: '이미지 갤러리 그리드',
  },
  {
    id: 'search-bar',
    name: '검색 바',
    category: 'forms',
    icon: Search,
    code: {
      html: `<div class="search-bar">
    <input type="text" placeholder="검색...">
    <button>검색</button>
</div>`,
      css: `.search-bar {
    display: flex;
    gap: 0.5rem;
}

.search-bar input {
    flex: 1;
    padding: 0.75rem;
    border: 2px solid #e5e7eb;
    border-radius: 0.5rem;
}

.search-bar button {
    padding: 0.75rem 1.5rem;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 0.5rem;
}`,
    },
    description: '검색 입력 바',
  },
  {
    id: 'testimonial',
    name: '고객 후기',
    category: 'sections',
    icon: Type,
    code: {
      html: `<section class="testimonial">
    <div class="testimonial-card">
        <p class="quote">"정말 훌륭한 서비스입니다!"</p>
        <div class="author">
            <div class="avatar"></div>
            <div>
                <h4>홍길동</h4>
                <p>CEO, 회사명</p>
            </div>
        </div>
    </div>
</section>`,
      css: `.testimonial {
    padding: 3rem 2rem;
    background: #f9fafb;
}

.testimonial-card {
    max-width: 600px;
    margin: 0 auto;
    background: white;
    padding: 2rem;
    border-radius: 1rem;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.quote {
    font-size: 1.25rem;
    font-style: italic;
    margin-bottom: 1.5rem;
    color: #4b5563;
}

.author {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.avatar {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.author h4 {
    font-weight: 600;
    margin-bottom: 0.25rem;
}

.author p {
    font-size: 0.875rem;
    color: #6b7280;
}`,
    },
    description: '고객 후기 섹션',
  },
  {
    id: 'pricing-card',
    name: '가격 카드',
    category: 'layout',
    icon: Layout,
    code: {
      html: `<div class="pricing-card">
    <h3>프로 플랜</h3>
    <div class="price">
        <span class="amount">₩29,000</span>
        <span class="period">/월</span>
    </div>
    <ul class="features">
        <li>✓ 모든 기능</li>
        <li>✓ 우선 지원</li>
        <li>✓ 무제한 사용</li>
    </ul>
    <button class="pricing-btn">시작하기</button>
</div>`,
      css: `.pricing-card {
    background: white;
    border: 2px solid #e5e7eb;
    border-radius: 1rem;
    padding: 2rem;
    text-align: center;
    transition: all 0.3s;
}

.pricing-card:hover {
    border-color: #3b82f6;
    box-shadow: 0 10px 30px rgba(59, 130, 246, 0.2);
    transform: translateY(-5px);
}

.pricing-card h3 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
}

.price {
    margin: 1.5rem 0;
}

.amount {
    font-size: 2.5rem;
    font-weight: bold;
    color: #3b82f6;
}

.period {
    color: #6b7280;
}

.features {
    list-style: none;
    text-align: left;
    margin: 2rem 0;
}

.features li {
    padding: 0.5rem 0;
    color: #4b5563;
}

.pricing-btn {
    width: 100%;
    padding: 0.75rem;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 0.5rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.3s;
}

.pricing-btn:hover {
    background: #2563eb;
}`,
    },
    description: '가격 카드 컴포넌트',
  },
  {
    id: 'animated-card',
    name: '애니메이션 카드',
    category: 'layout',
    icon: Layout,
    code: {
      html: `<div class="animated-card">
    <h3>애니메이션 카드</h3>
    <p>호버 시 애니메이션 효과</p>
</div>`,
      css: `.animated-card {
    background: white;
    padding: 2rem;
    border-radius: 1rem;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
}

.animated-card:hover {
    transform: translateY(-10px) scale(1.02);
    box-shadow: 0 20px 40px rgba(0,0,0,0.15);
}

.animated-card h3 {
    margin-bottom: 1rem;
    color: #1f2937;
}

.animated-card p {
    color: #6b7280;
}`,
    },
    description: '호버 애니메이션 카드',
  },
  {
    id: 'form-modern',
    name: '모던 폼',
    category: 'forms',
    icon: Search,
    code: {
      html: `<form class="modern-form">
    <div class="form-group">
        <label>이름</label>
        <input type="text" placeholder="이름을 입력하세요">
    </div>
    <div class="form-group">
        <label>이메일</label>
        <input type="email" placeholder="email@example.com">
    </div>
    <button type="submit" class="form-submit">제출하기</button>
</form>`,
      css: `.modern-form {
    max-width: 500px;
    margin: 0 auto;
    padding: 2rem;
    background: white;
    border-radius: 1rem;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.form-group {
    margin-bottom: 1.5rem;
}

.form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
    color: #374151;
}

.form-group input {
    width: 100%;
    padding: 0.75rem;
    border: 2px solid #e5e7eb;
    border-radius: 0.5rem;
    transition: border-color 0.3s;
}

.form-group input:focus {
    outline: none;
    border-color: #3b82f6;
}

.form-submit {
    width: 100%;
    padding: 0.75rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 0.5rem;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s;
}

.form-submit:hover {
    transform: translateY(-2px);
}`,
    },
    description: '모던한 폼 디자인',
  },
  {
    id: 'modal',
    name: '모달 다이얼로그',
    category: 'layout',
    icon: Layout,
    code: {
      html: `<div class="modal-overlay">
    <div class="modal">
        <div class="modal-header">
            <h3>모달 제목</h3>
            <button class="modal-close">×</button>
        </div>
        <div class="modal-body">
            <p>모달 내용입니다.</p>
        </div>
        <div class="modal-footer">
            <button class="btn-cancel">취소</button>
            <button class="btn-confirm">확인</button>
        </div>
    </div>
</div>`,
      css: `.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal {
    background: white;
    border-radius: 1rem;
    max-width: 500px;
    width: 90%;
    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid #e5e7eb;
}

.modal-close {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #6b7280;
}

.modal-body {
    padding: 1.5rem;
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    padding: 1.5rem;
    border-top: 1px solid #e5e7eb;
}

.btn-cancel {
    padding: 0.5rem 1rem;
    background: #f3f4f6;
    border: none;
    border-radius: 0.5rem;
    cursor: pointer;
}

.btn-confirm {
    padding: 0.5rem 1rem;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 0.5rem;
    cursor: pointer;
}`,
    },
    description: '모달 다이얼로그',
  },
  {
    id: 'accordion',
    name: '아코디언',
    category: 'layout',
    icon: Layout,
    code: {
      html: `<div class="accordion">
    <div class="accordion-item">
        <button class="accordion-header">섹션 1</button>
        <div class="accordion-content">
            <p>아코디언 내용입니다.</p>
        </div>
    </div>
    <div class="accordion-item">
        <button class="accordion-header">섹션 2</button>
        <div class="accordion-content">
            <p>아코디언 내용입니다.</p>
        </div>
    </div>
</div>`,
      css: `.accordion {
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    overflow: hidden;
}

.accordion-item {
    border-bottom: 1px solid #e5e7eb;
}

.accordion-item:last-child {
    border-bottom: none;
}

.accordion-header {
    width: 100%;
    padding: 1rem;
    background: #f9fafb;
    border: none;
    text-align: left;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.3s;
}

.accordion-header:hover {
    background: #f3f4f6;
}

.accordion-content {
    padding: 1rem;
    display: none;
}

.accordion-content.active {
    display: block;
}`,
      js: `document.querySelectorAll('.accordion-header').forEach(header => {
    header.addEventListener('click', function() {
        const content = this.nextElementSibling;
        content.classList.toggle('active');
    });
});`,
    },
    description: '아코디언 컴포넌트',
  },
  {
    id: 'tabs',
    name: '탭 컴포넌트',
    category: 'layout',
    icon: Layout,
    code: {
      html: `<div class="tabs">
    <div class="tab-headers">
        <button class="tab-header active">탭 1</button>
        <button class="tab-header">탭 2</button>
        <button class="tab-header">탭 3</button>
    </div>
    <div class="tab-contents">
        <div class="tab-content active">탭 1 내용</div>
        <div class="tab-content">탭 2 내용</div>
        <div class="tab-content">탭 3 내용</div>
    </div>
</div>`,
      css: `.tabs {
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    overflow: hidden;
}

.tab-headers {
    display: flex;
    background: #f9fafb;
    border-bottom: 1px solid #e5e7eb;
}

.tab-header {
    flex: 1;
    padding: 1rem;
    background: none;
    border: none;
    border-right: 1px solid #e5e7eb;
    cursor: pointer;
    transition: background 0.3s;
}

.tab-header:last-child {
    border-right: none;
}

.tab-header.active {
    background: white;
    font-weight: 600;
    color: #3b82f6;
}

.tab-content {
    padding: 1.5rem;
    display: none;
}

.tab-content.active {
    display: block;
}`,
      js: `document.querySelectorAll('.tab-header').forEach((header, index) => {
    header.addEventListener('click', function() {
        document.querySelectorAll('.tab-header').forEach(h => h.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        this.classList.add('active');
        document.querySelectorAll('.tab-content')[index].classList.add('active');
    });
});`,
    },
    description: '탭 네비게이션',
  },
  {
    id: 'badge',
    name: '배지/태그',
    category: 'layout',
    icon: Layout,
    code: {
      html: `<div class="badges">
    <span class="badge">기본</span>
    <span class="badge badge-primary">프라이머리</span>
    <span class="badge badge-success">성공</span>
    <span class="badge badge-warning">경고</span>
    <span class="badge badge-danger">위험</span>
</div>`,
      css: `.badges {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
}

.badge {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.875rem;
    font-weight: 600;
    background: #e5e7eb;
    color: #374151;
}

.badge-primary {
    background: #3b82f6;
    color: white;
}

.badge-success {
    background: #10b981;
    color: white;
}

.badge-warning {
    background: #f59e0b;
    color: white;
}

.badge-danger {
    background: #ef4444;
    color: white;
}`,
    },
    description: '배지/태그 컴포넌트',
  },
  {
    id: 'progress-bar',
    name: '진행 바',
    category: 'layout',
    icon: Layout,
    code: {
      html: `<div class="progress-container">
    <div class="progress-bar" style="width: 75%">
        <span class="progress-text">75%</span>
    </div>
</div>`,
      css: `.progress-container {
    width: 100%;
    height: 1.5rem;
    background: #e5e7eb;
    border-radius: 9999px;
    overflow: hidden;
    position: relative;
}

.progress-bar {
    height: 100%;
    background: linear-gradient(90deg, #3b82f6, #8b5cf6);
    border-radius: 9999px;
    transition: width 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
}

.progress-text {
    color: white;
    font-size: 0.75rem;
    font-weight: 600;
}`,
    },
    description: '진행률 표시 바',
  },
];

export default function ComponentLibrary({ onInsert }: { onInsert: (component: Component) => void }) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['all', 'buttons', 'layout', 'navigation', 'sections', 'media', 'forms'];

  const filteredComponents = components.filter(comp => {
    const matchesCategory = selectedCategory === 'all' || comp.category === selectedCategory;
    const matchesSearch = comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         comp.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-3">컴포넌트 라이브러리</h3>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="컴포넌트 검색..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex gap-2 p-4 border-b border-gray-200 overflow-x-auto">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {cat === 'all' ? '전체' : cat}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {filteredComponents.map(component => {
          const Icon = component.icon;
          return (
            <div
              key={component.id}
              className="p-3 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer group"
              onClick={() => onInsert(component)}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-gray-900">{component.name}</span>
              </div>
              <p className="text-xs text-gray-600">{component.description}</p>
              <div className="mt-2 flex items-center gap-2 text-xs text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                <Plus className="w-3 h-3" />
                <span>클릭하여 추가</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
