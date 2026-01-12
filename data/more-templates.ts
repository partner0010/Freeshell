/**
 * 추가 다양한 템플릿
 * SaaS, 앱, 비즈니스 등 더 많은 카테고리
 */
import type { WebsiteTemplate } from './website-templates';

export const moreTemplates: Omit<WebsiteTemplate, 'id'>[] = [
  // SaaS 랜딩 페이지
  {
    name: 'SaaS 랜딩 페이지',
    description: 'SaaS 서비스를 위한 전문적인 랜딩 페이지',
    category: 'business',
    tags: ['SaaS', '비즈니스', '프로페셔널', 'B2B'],
    preview: {
      html: `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SaaS 플랫폼</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <nav class="saas-nav">
        <div class="container">
            <div class="logo">SaaS Platform</div>
            <div class="nav-links">
                <a href="#features">기능</a>
                <a href="#pricing">가격</a>
                <a href="#about">소개</a>
                <button class="nav-cta">무료 체험</button>
            </div>
        </div>
    </nav>
    <section class="saas-hero">
        <div class="container">
            <h1>비즈니스를 성장시키는<br>강력한 SaaS 플랫폼</h1>
            <p>수천 개의 기업이 신뢰하는 솔루션</p>
            <div class="hero-cta">
                <button class="btn-primary">무료로 시작하기</button>
                <button class="btn-secondary">데모 보기</button>
            </div>
            <div class="hero-stats">
                <div class="stat">
                    <div class="stat-number">10,000+</div>
                    <div class="stat-label">활성 사용자</div>
                </div>
                <div class="stat">
                    <div class="stat-number">99.9%</div>
                    <div class="stat-label">업타임</div>
                </div>
                <div class="stat">
                    <div class="stat-number">24/7</div>
                    <div class="stat-label">지원</div>
                </div>
            </div>
        </div>
    </section>
    <section id="features" class="saas-features">
        <div class="container">
            <h2>왜 우리를 선택해야 할까요?</h2>
            <div class="features-grid">
                <div class="feature-item">
                    <div class="feature-icon">⚡</div>
                    <h3>빠른 성능</h3>
                    <p>최적화된 인프라로 빠른 응답 속도</p>
                </div>
                <div class="feature-item">
                    <div class="feature-icon">🔒</div>
                    <h3>엔터프라이즈 보안</h3>
                    <p>최고 수준의 보안 시스템</p>
                </div>
                <div class="feature-item">
                    <div class="feature-icon">📊</div>
                    <h3>실시간 분석</h3>
                    <p>데이터 기반 인사이트 제공</p>
                </div>
            </div>
        </div>
    </section>
    <script src="script.js"></script>
</body>
</html>`,
      css: `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: #1f2937;
    line-height: 1.6;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
}

.saas-nav {
    background: white;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    position: sticky;
    top: 0;
    z-index: 1000;
}

.saas-nav .container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 2rem;
}

.logo {
    font-size: 1.5rem;
    font-weight: bold;
    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.nav-links {
    display: flex;
    align-items: center;
    gap: 2rem;
}

.nav-links a {
    text-decoration: none;
    color: #4b5563;
    font-weight: 500;
    transition: color 0.3s;
}

.nav-links a:hover {
    color: #3b82f6;
}

.nav-cta {
    padding: 0.5rem 1.5rem;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 0.5rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.3s;
}

.nav-cta:hover {
    background: #2563eb;
}

.saas-hero {
    padding: 6rem 2rem;
    background: linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%);
    text-align: center;
}

.saas-hero h1 {
    font-size: 3.5rem;
    font-weight: 800;
    margin-bottom: 1.5rem;
    color: #1f2937;
    line-height: 1.2;
}

.saas-hero p {
    font-size: 1.25rem;
    color: #6b7280;
    margin-bottom: 2.5rem;
}

.hero-cta {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin-bottom: 4rem;
}

.btn-primary {
    padding: 1rem 2rem;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 0.5rem;
    font-weight: 600;
    font-size: 1.1rem;
    cursor: pointer;
    transition: all 0.3s;
}

.btn-primary:hover {
    background: #2563eb;
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(59, 130, 246, 0.3);
}

.btn-secondary {
    padding: 1rem 2rem;
    background: white;
    color: #3b82f6;
    border: 2px solid #3b82f6;
    border-radius: 0.5rem;
    font-weight: 600;
    font-size: 1.1rem;
    cursor: pointer;
    transition: all 0.3s;
}

.btn-secondary:hover {
    background: #3b82f6;
    color: white;
}

.hero-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 3rem;
    max-width: 800px;
    margin: 0 auto;
}

.stat {
    text-align: center;
}

.stat-number {
    font-size: 2.5rem;
    font-weight: 800;
    color: #3b82f6;
    margin-bottom: 0.5rem;
}

.stat-label {
    color: #6b7280;
    font-size: 0.875rem;
}

.saas-features {
    padding: 5rem 2rem;
    background: white;
}

.saas-features h2 {
    text-align: center;
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 3rem;
    color: #1f2937;
}

.features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
}

.feature-item {
    text-align: center;
    padding: 2rem;
    border-radius: 1rem;
    transition: transform 0.3s;
}

.feature-item:hover {
    transform: translateY(-5px);
}

.feature-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
}

.feature-item h3 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    color: #1f2937;
}

.feature-item p {
    color: #6b7280;
}

@media (max-width: 768px) {
    .saas-hero h1 {
        font-size: 2.5rem;
    }
    
    .hero-cta {
        flex-direction: column;
    }
    
    .hero-stats {
        grid-template-columns: 1fr;
    }
}`,
      js: `// 스무스 스크롤
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});`,
    },
    files: [],
    difficulty: 'intermediate',
    features: ['SaaS', '통계', 'CTA', '프로페셔널'],
  },
  // 모바일 앱 랜딩
  {
    name: '모바일 앱 랜딩',
    description: '모바일 앱을 위한 현대적인 랜딩 페이지',
    category: 'landing',
    tags: ['모바일', '앱', '다운로드', '스마트폰'],
    preview: {
      html: `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>모바일 앱</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <nav class="app-nav">
        <div class="container">
            <div class="logo">AppName</div>
            <button class="menu-toggle">☰</button>
        </div>
    </nav>
    <section class="app-hero">
        <div class="container">
            <div class="hero-content">
                <h1>생활을 더 편리하게<br>만드는 앱</h1>
                <p>지금 다운로드하고 새로운 경험을 시작하세요</p>
                <div class="download-buttons">
                    <button class="download-btn ios">
                        <span>📱</span>
                        <div>
                            <small>App Store에서</small>
                            <strong>다운로드</strong>
                        </div>
                    </button>
                    <button class="download-btn android">
                        <span>🤖</span>
                        <div>
                            <small>Google Play에서</small>
                            <strong>다운로드</strong>
                        </div>
                    </button>
                </div>
            </div>
            <div class="hero-image">
                <div class="phone-mockup"></div>
            </div>
        </div>
    </section>
    <section class="app-features">
        <div class="container">
            <h2>주요 기능</h2>
            <div class="features-list">
                <div class="feature">
                    <div class="feature-icon">✨</div>
                    <h3>직관적인 UI</h3>
                    <p>사용하기 쉬운 인터페이스</p>
                </div>
                <div class="feature">
                    <div class="feature-icon">🔔</div>
                    <h3>실시간 알림</h3>
                    <p>중요한 정보를 놓치지 마세요</p>
                </div>
                <div class="feature">
                    <div class="feature-icon">☁️</div>
                    <h3>클라우드 동기화</h3>
                    <p>모든 기기에서 접근 가능</p>
                </div>
            </div>
        </div>
    </section>
    <script src="script.js"></script>
</body>
</html>`,
      css: `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: #1f2937;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
}

.app-nav {
    background: white;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    position: sticky;
    top: 0;
    z-index: 1000;
}

.app-nav .container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 2rem;
}

.logo {
    font-size: 1.5rem;
    font-weight: bold;
    color: #3b82f6;
}

.app-hero {
    padding: 4rem 2rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

.app-hero .container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4rem;
    align-items: center;
}

.hero-content h1 {
    font-size: 3.5rem;
    font-weight: 800;
    margin-bottom: 1.5rem;
    line-height: 1.2;
}

.hero-content p {
    font-size: 1.25rem;
    margin-bottom: 2.5rem;
    opacity: 0.9;
}

.download-buttons {
    display: flex;
    gap: 1rem;
}

.download-btn {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 1.5rem;
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 1rem;
    color: white;
    cursor: pointer;
    transition: all 0.3s;
}

.download-btn:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
}

.download-btn span {
    font-size: 2rem;
}

.download-btn strong {
    display: block;
    font-size: 1.1rem;
}

.download-btn small {
    display: block;
    font-size: 0.75rem;
    opacity: 0.8;
}

.phone-mockup {
    width: 300px;
    height: 600px;
    background: white;
    border-radius: 3rem;
    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    margin: 0 auto;
    position: relative;
    overflow: hidden;
}

.phone-mockup::before {
    content: '';
    position: absolute;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 20px;
    background: #1f2937;
    border-radius: 0 0 1rem 1rem;
}

.app-features {
    padding: 5rem 2rem;
    background: #f9fafb;
}

.app-features h2 {
    text-align: center;
    font-size: 2.5rem;
    margin-bottom: 3rem;
    color: #1f2937;
}

.features-list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
}

.feature {
    text-align: center;
    padding: 2rem;
    background: white;
    border-radius: 1rem;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.feature-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
}

.feature h3 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    color: #1f2937;
}

.feature p {
    color: #6b7280;
}

@media (max-width: 768px) {
    .app-hero .container {
        grid-template-columns: 1fr;
    }
    
    .hero-content h1 {
        font-size: 2.5rem;
    }
    
    .download-buttons {
        flex-direction: column;
    }
}`,
      js: `// 다운로드 버튼 클릭
document.querySelectorAll('.download-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        alert('앱 스토어로 이동합니다!');
    });
});`,
    },
    files: [],
    difficulty: 'intermediate',
    features: ['모바일', '다운로드', '앱 스토어', '반응형'],
  },
];

// 파일 내용 채우기
moreTemplates.forEach(template => {
  template.files = [
    {
      name: 'index.html',
      type: 'html',
      content: template.preview.html,
    },
    {
      name: 'style.css',
      type: 'css',
      content: template.preview.css,
    },
    {
      name: 'script.js',
      type: 'javascript',
      content: template.preview.js || '',
    },
  ];
});

// 템플릿 변형 생성
function generateTemplateVariations(baseTemplate: Omit<WebsiteTemplate, 'id'>, count: number): WebsiteTemplate[] {
  const variations: WebsiteTemplate[] = [];
  const colorSchemes = [
    { primary: '#3b82f6', secondary: '#8b5cf6', accent: '#ec4899' },
    { primary: '#10b981', secondary: '#06b6d4', accent: '#f59e0b' },
    { primary: '#ef4444', secondary: '#f97316', accent: '#eab308' },
    { primary: '#6366f1', secondary: '#8b5cf6', accent: '#ec4899' },
    { primary: '#14b8a6', secondary: '#0ea5e9', accent: '#a855f7' },
  ];

  for (let i = 0; i < count; i++) {
    const colors = colorSchemes[i % colorSchemes.length];
    const variation = {
      ...baseTemplate,
      id: `${baseTemplate.name.toLowerCase().replace(/\s+/g, '-')}-more-${i + 1}`,
      name: `${baseTemplate.name} ${i + 1 > 1 ? `(${i + 1})` : ''}`,
      preview: {
        ...baseTemplate.preview,
        css: baseTemplate.preview.css
          .replace(/#3b82f6/g, colors.primary)
          .replace(/#8b5cf6/g, colors.secondary)
          .replace(/#ec4899/g, colors.accent),
      },
      files: baseTemplate.files.map(file => ({
        ...file,
        content: file.type === 'css' 
          ? file.content
              .replace(/#3b82f6/g, colors.primary)
              .replace(/#8b5cf6/g, colors.secondary)
              .replace(/#ec4899/g, colors.accent)
          : file.content,
      })),
    };
    variations.push(variation as WebsiteTemplate);
  }
  return variations;
}

// 추가 템플릿 변형 생성
export const moreTemplateVariations: WebsiteTemplate[] = [];
moreTemplates.forEach(template => {
  const variations = generateTemplateVariations(template, 2000);
  moreTemplateVariations.push(...variations);
});
