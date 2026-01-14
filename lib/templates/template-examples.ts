/**
 * 템플릿 예시 3개
 * 웹/앱 공용, 블록 기반 구조
 */

import { Template } from './template-schema';

/**
 * 예시 1: 랜딩 페이지 템플릿 (웹)
 */
export const landingPageTemplate: Template = {
  metadata: {
    id: 'template-web-landing-001',
    version: '1.0.0',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    author: 'AI Generator',
    tags: ['landing', 'hero', 'modern', 'responsive'],
    description: '모던한 랜딩 페이지 템플릿 - 히어로 섹션, 기능 소개, CTA 포함',
    thumbnail: '/templates/thumbnails/landing-001.png',
  },
  type: 'web',
  category: 'landing',
  blocks: [
    {
      id: 'block-navbar-1',
      type: 'navbar',
      content: {
        logo: '로고',
        links: [
          { text: '홈', href: '#home' },
          { text: '소개', href: '#about' },
          { text: '기능', href: '#features' },
          { text: '연락처', href: '#contact' },
        ],
      },
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 2rem',
        backgroundColor: '#ffffff',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
      },
    },
    {
      id: 'block-hero-1',
      type: 'hero',
      content: {
        title: '혁신적인 솔루션을 만나보세요',
        subtitle: '당신의 비즈니스를 성장시키는 강력한 도구',
        cta: {
          primary: { text: '시작하기', href: '#signup' },
          secondary: { text: '더 알아보기', href: '#about' },
        },
        backgroundImage: 'https://via.placeholder.com/1920x1080',
      },
      style: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '4rem 2rem',
        minHeight: '600px',
        backgroundColor: '#f0f4f8',
        textAlign: 'center',
      },
      children: [
        {
          id: 'block-heading-1',
          type: 'heading',
          content: {
            level: 1,
            text: '혁신적인 솔루션을 만나보세요',
          },
          style: {
            fontSize: '3rem',
            fontWeight: 'bold',
            color: '#1a202c',
            marginBottom: '1rem',
          },
        },
        {
          id: 'block-text-1',
          type: 'text',
          content: {
            text: '당신의 비즈니스를 성장시키는 강력한 도구',
          },
          style: {
            fontSize: '1.25rem',
            color: '#4a5568',
            marginBottom: '2rem',
          },
        },
        {
          id: 'block-button-group-1',
          type: 'container',
          content: {},
          style: {
            display: 'flex',
            gap: '1rem',
          },
          children: [
            {
              id: 'block-button-1',
              type: 'button',
              content: {
                text: '시작하기',
                href: '#signup',
                variant: 'primary',
              },
              style: {
                padding: '0.75rem 2rem',
                backgroundColor: '#3b82f6',
                color: '#ffffff',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer',
              },
            },
            {
              id: 'block-button-2',
              type: 'button',
              content: {
                text: '더 알아보기',
                href: '#about',
                variant: 'secondary',
              },
              style: {
                padding: '0.75rem 2rem',
                backgroundColor: 'transparent',
                color: '#3b82f6',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                border: '2px solid #3b82f6',
                cursor: 'pointer',
              },
            },
          ],
        },
      ],
    },
    {
      id: 'block-features-1',
      type: 'container',
      content: {},
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '2rem',
        padding: '4rem 2rem',
        backgroundColor: '#ffffff',
      },
      children: [
        {
          id: 'block-card-1',
          type: 'card',
          content: {
            title: '빠른 성능',
            description: '최적화된 코드로 빠른 로딩 속도를 제공합니다.',
            icon: '⚡',
          },
          style: {
            padding: '2rem',
            borderRadius: '0.5rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          },
        },
        {
          id: 'block-card-2',
          type: 'card',
          content: {
            title: '반응형 디자인',
            description: '모든 기기에서 완벽하게 작동합니다.',
            icon: '📱',
          },
          style: {
            padding: '2rem',
            borderRadius: '0.5rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          },
        },
        {
          id: 'block-card-3',
          type: 'card',
          content: {
            title: '사용하기 쉬움',
            description: '직관적인 인터페이스로 누구나 쉽게 사용할 수 있습니다.',
            icon: '✨',
          },
          style: {
            padding: '2rem',
            borderRadius: '0.5rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          },
        },
      ],
    },
    {
      id: 'block-footer-1',
      type: 'footer',
      content: {
        copyright: '© 2024 All rights reserved',
        links: [
          { text: '개인정보처리방침', href: '#privacy' },
          { text: '이용약관', href: '#terms' },
        ],
      },
      style: {
        padding: '2rem',
        backgroundColor: '#1a202c',
        color: '#ffffff',
        textAlign: 'center',
      },
    },
  ],
  editableFields: [
    {
      id: 'field-hero-title',
      blockId: 'block-heading-1',
      path: 'content.text',
      type: 'text',
      label: '히어로 제목',
      defaultValue: '혁신적인 솔루션을 만나보세요',
      description: '메인 히어로 섹션의 제목을 입력하세요',
    },
    {
      id: 'field-hero-subtitle',
      blockId: 'block-text-1',
      path: 'content.text',
      type: 'text',
      label: '히어로 부제목',
      defaultValue: '당신의 비즈니스를 성장시키는 강력한 도구',
    },
    {
      id: 'field-hero-bg',
      blockId: 'block-hero-1',
      path: 'content.backgroundImage',
      type: 'image',
      label: '히어로 배경 이미지',
      defaultValue: 'https://via.placeholder.com/1920x1080',
    },
    {
      id: 'field-primary-cta',
      blockId: 'block-button-1',
      path: 'content.text',
      type: 'text',
      label: '주요 CTA 버튼 텍스트',
      defaultValue: '시작하기',
    },
    {
      id: 'field-primary-cta-color',
      blockId: 'block-button-1',
      path: 'style.backgroundColor',
      type: 'color',
      label: '주요 CTA 버튼 색상',
      defaultValue: '#3b82f6',
    },
  ],
  previewInfo: {
    width: 1920,
    height: 3000,
    backgroundColor: '#ffffff',
    deviceType: 'desktop',
  },
  styles: {
    global: {
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#1a202c',
      backgroundColor: '#ffffff',
    },
    variables: {
      '--primary-color': '#3b82f6',
      '--secondary-color': '#8b5cf6',
      '--text-color': '#1a202c',
      '--bg-color': '#ffffff',
    },
  },
};

/**
 * 예시 2: 블로그 템플릿 (웹)
 */
export const blogTemplate: Template = {
  metadata: {
    id: 'template-web-blog-001',
    version: '1.0.0',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    author: 'AI Generator',
    tags: ['blog', 'article', 'content', 'minimal'],
    description: '미니멀한 블로그 템플릿 - 글 목록, 상세 페이지, 사이드바 포함',
    thumbnail: '/templates/thumbnails/blog-001.png',
  },
  type: 'web',
  category: 'blog',
  blocks: [
    {
      id: 'block-header-1',
      type: 'container',
      content: {},
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1.5rem 2rem',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
      },
      children: [
        {
          id: 'block-logo-1',
          type: 'text',
          content: { text: 'My Blog' },
          style: {
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#1a202c',
          },
        },
        {
          id: 'block-nav-1',
          type: 'container',
          content: {},
          style: {
            display: 'flex',
            gap: '2rem',
          },
          children: [
            { id: 'block-nav-link-1', type: 'text', content: { text: '홈' }, style: {} },
            { id: 'block-nav-link-2', type: 'text', content: { text: '카테고리' }, style: {} },
            { id: 'block-nav-link-3', type: 'text', content: { text: '소개' }, style: {} },
          ],
        },
      ],
    },
    {
      id: 'block-main-1',
      type: 'container',
      content: {},
      style: {
        display: 'grid',
        gridTemplateColumns: '1fr 300px',
        gap: '2rem',
        padding: '2rem',
        maxWidth: '1200px',
        margin: '0 auto',
      },
      children: [
        {
          id: 'block-content-1',
          type: 'container',
          content: {},
          style: {},
          children: [
            {
              id: 'block-article-1',
              type: 'card',
              content: {
                title: '블로그 포스트 제목',
                date: '2024-01-01',
                excerpt: '포스트 요약 내용이 여기에 표시됩니다...',
                image: 'https://via.placeholder.com/800x400',
              },
              style: {
                marginBottom: '2rem',
                padding: '0',
                borderRadius: '0.5rem',
                overflow: 'hidden',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              },
            },
            {
              id: 'block-article-2',
              type: 'card',
              content: {
                title: '또 다른 포스트 제목',
                date: '2024-01-02',
                excerpt: '포스트 요약 내용이 여기에 표시됩니다...',
                image: 'https://via.placeholder.com/800x400',
              },
              style: {
                marginBottom: '2rem',
                padding: '0',
                borderRadius: '0.5rem',
                overflow: 'hidden',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              },
            },
          ],
        },
        {
          id: 'block-sidebar-1',
          type: 'sidebar',
          content: {},
          style: {
            padding: '1.5rem',
            backgroundColor: '#f9fafb',
            borderRadius: '0.5rem',
          },
          children: [
            {
              id: 'block-widget-1',
              type: 'card',
              content: {
                title: '인기 포스트',
                items: ['포스트 1', '포스트 2', '포스트 3'],
              },
              style: {
                marginBottom: '2rem',
              },
            },
            {
              id: 'block-widget-2',
              type: 'card',
              content: {
                title: '카테고리',
                items: ['기술', '디자인', '일상'],
              },
              style: {},
            },
          ],
        },
      ],
    },
  ],
  editableFields: [
    {
      id: 'field-blog-title',
      blockId: 'block-logo-1',
      path: 'content.text',
      type: 'text',
      label: '블로그 제목',
      defaultValue: 'My Blog',
    },
    {
      id: 'field-article-title',
      blockId: 'block-article-1',
      path: 'content.title',
      type: 'text',
      label: '포스트 제목',
      defaultValue: '블로그 포스트 제목',
    },
  ],
  previewInfo: {
    width: 1200,
    height: 2000,
    backgroundColor: '#ffffff',
    deviceType: 'desktop',
  },
};

/**
 * 예시 3: 모바일 앱 템플릿 (앱)
 */
export const mobileAppTemplate: Template = {
  metadata: {
    id: 'template-app-mobile-001',
    version: '1.0.0',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    author: 'AI Generator',
    tags: ['mobile', 'app', 'dashboard', 'modern'],
    description: '모던한 모바일 앱 대시보드 템플릿',
    thumbnail: '/templates/thumbnails/mobile-001.png',
  },
  type: 'app',
  category: 'mobile-app',
  blocks: [
    {
      id: 'block-app-header-1',
      type: 'container',
      content: {},
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem',
        backgroundColor: '#3b82f6',
        color: '#ffffff',
      },
      children: [
        {
          id: 'block-app-title-1',
          type: 'heading',
          content: { level: 2, text: 'My App' },
          style: {
            fontSize: '1.25rem',
            fontWeight: 'bold',
            color: '#ffffff',
          },
        },
        {
          id: 'block-app-menu-1',
          type: 'button',
          content: { text: '☰', icon: true },
          style: {
            backgroundColor: 'transparent',
            border: 'none',
            color: '#ffffff',
            fontSize: '1.5rem',
            cursor: 'pointer',
          },
        },
      ],
    },
    {
      id: 'block-app-content-1',
      type: 'container',
      content: {},
      style: {
        padding: '1rem',
        backgroundColor: '#f9fafb',
        minHeight: 'calc(100vh - 120px)',
      },
      children: [
        {
          id: 'block-stats-1',
          type: 'container',
          content: {},
          style: {
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '1rem',
            marginBottom: '1.5rem',
          },
          children: [
            {
              id: 'block-stat-card-1',
              type: 'card',
              content: {
                title: '총 사용자',
                value: '1,234',
                icon: '👥',
              },
              style: {
                padding: '1.5rem',
                backgroundColor: '#ffffff',
                borderRadius: '0.5rem',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              },
            },
            {
              id: 'block-stat-card-2',
              type: 'card',
              content: {
                title: '활성 세션',
                value: '567',
                icon: '📊',
              },
              style: {
                padding: '1.5rem',
                backgroundColor: '#ffffff',
                borderRadius: '0.5rem',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              },
            },
          ],
        },
        {
          id: 'block-list-1',
          type: 'list',
          content: {
            items: [
              { title: '항목 1', subtitle: '설명 1', icon: '📱' },
              { title: '항목 2', subtitle: '설명 2', icon: '💡' },
              { title: '항목 3', subtitle: '설명 3', icon: '⚡' },
            ],
          },
          style: {
            backgroundColor: '#ffffff',
            borderRadius: '0.5rem',
            overflow: 'hidden',
          },
        },
      ],
    },
    {
      id: 'block-app-footer-1',
      type: 'container',
      content: {},
      style: {
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '1rem',
        backgroundColor: '#ffffff',
        borderTop: '1px solid #e5e7eb',
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
      },
      children: [
        { id: 'block-tab-1', type: 'button', content: { text: '홈', icon: '🏠' }, style: {} },
        { id: 'block-tab-2', type: 'button', content: { text: '검색', icon: '🔍' }, style: {} },
        { id: 'block-tab-3', type: 'button', content: { text: '프로필', icon: '👤' }, style: {} },
      ],
    },
  ],
  editableFields: [
    {
      id: 'field-app-title',
      blockId: 'block-app-title-1',
      path: 'content.text',
      type: 'text',
      label: '앱 제목',
      defaultValue: 'My App',
    },
    {
      id: 'field-header-color',
      blockId: 'block-app-header-1',
      path: 'style.backgroundColor',
      type: 'color',
      label: '헤더 배경색',
      defaultValue: '#3b82f6',
    },
  ],
  previewInfo: {
    width: 375,
    height: 812,
    backgroundColor: '#f9fafb',
    deviceType: 'mobile',
  },
};

/**
 * 템플릿 목록
 */
export const exampleTemplates: Template[] = [
  landingPageTemplate,
  blogTemplate,
  mobileAppTemplate,
];
