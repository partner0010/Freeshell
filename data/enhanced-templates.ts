/**
 * 강화된 웹사이트/앱 템플릿
 * 더 다양하고 디테일한 템플릿 추가
 */
import type { WebsiteTemplate } from './website-templates';

// 추가 고급 템플릿들
export const enhancedTemplates: Omit<WebsiteTemplate, 'id'>[] = [
  // 포트폴리오 웹사이트
  {
    name: '프로페셔널 포트폴리오',
    description: '작품을 효과적으로 보여주는 포트폴리오 웹사이트',
    category: 'portfolio',
    tags: ['포트폴리오', '작품', '프로페셔널', '갤러리'],
    preview: {
      html: `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>포트폴리오</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <nav class="navbar">
        <div class="container">
            <div class="logo">Portfolio</div>
            <ul class="nav-menu">
                <li><a href="#home">홈</a></li>
                <li><a href="#about">소개</a></li>
                <li><a href="#works">작품</a></li>
                <li><a href="#contact">연락</a></li>
            </ul>
        </div>
    </nav>
    <section id="home" class="hero-section">
        <div class="hero-content">
            <h1>안녕하세요, 저는 <span class="highlight">디자이너</span>입니다</h1>
            <p>창의적인 솔루션으로 비전을 현실로 만듭니다</p>
            <button class="cta-btn">작품 보기</button>
        </div>
    </section>
    <section id="works" class="works-section">
        <h2>작품</h2>
        <div class="works-grid">
            <div class="work-item">
                <div class="work-image"></div>
                <h3>프로젝트 1</h3>
                <p>프로젝트 설명</p>
            </div>
            <div class="work-item">
                <div class="work-image"></div>
                <h3>프로젝트 2</h3>
                <p>프로젝트 설명</p>
            </div>
            <div class="work-item">
                <div class="work-image"></div>
                <h3>프로젝트 3</h3>
                <p>프로젝트 설명</p>
            </div>
        </div>
    </section>
    <footer class="footer">
        <p>&copy; 2024 Portfolio. All rights reserved.</p>
    </footer>
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
    line-height: 1.6;
    color: #333;
}

.navbar {
    background: white;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    position: fixed;
    top: 0;
    width: 100%;
    z-index: 1000;
}

.navbar .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 1rem 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.logo {
    font-size: 1.5rem;
    font-weight: bold;
    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.nav-menu {
    display: flex;
    list-style: none;
    gap: 2rem;
}

.nav-menu a {
    text-decoration: none;
    color: #333;
    font-weight: 500;
    transition: color 0.3s;
}

.nav-menu a:hover {
    color: #3b82f6;
}

.hero-section {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    text-align: center;
    padding-top: 80px;
}

.hero-content h1 {
    font-size: 3.5rem;
    margin-bottom: 1rem;
}

.highlight {
    color: #fbbf24;
}

.hero-content p {
    font-size: 1.25rem;
    margin-bottom: 2rem;
    opacity: 0.9;
}

.cta-btn {
    padding: 1rem 2rem;
    background: white;
    color: #3b82f6;
    border: none;
    border-radius: 0.5rem;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s;
}

.cta-btn:hover {
    transform: translateY(-2px);
}

.works-section {
    padding: 5rem 2rem;
    max-width: 1200px;
    margin: 0 auto;
}

.works-section h2 {
    text-align: center;
    font-size: 2.5rem;
    margin-bottom: 3rem;
}

.works-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
}

.work-item {
    background: white;
    border-radius: 1rem;
    overflow: hidden;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    transition: transform 0.3s;
}

.work-item:hover {
    transform: translateY(-5px);
}

.work-image {
    width: 100%;
    height: 200px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.work-item h3 {
    padding: 1rem;
    font-size: 1.25rem;
}

.work-item p {
    padding: 0 1rem 1rem;
    color: #666;
}

.footer {
    background: #1f2937;
    color: white;
    text-align: center;
    padding: 2rem;
}

@media (max-width: 768px) {
    .hero-content h1 {
        font-size: 2rem;
    }
    
    .nav-menu {
        display: none;
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
});

// 스크롤 시 네비게이션 효과
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.boxShadow = '0 2px 20px rgba(0,0,0,0.15)';
    } else {
        navbar.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
    }
});`,
    },
    files: [],
    difficulty: 'intermediate',
    features: ['반응형 디자인', '스무스 스크롤', '작품 갤러리', '고정 네비게이션'],
  },
  // 쇼핑몰 템플릿
  {
    name: '이커머스 쇼핑몰',
    description: '완전한 기능을 갖춘 온라인 쇼핑몰 템플릿',
    category: 'ecommerce',
    tags: ['쇼핑몰', '이커머스', '상품', '결제'],
    preview: {
      html: `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>온라인 쇼핑몰</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <header class="header">
        <div class="container">
            <div class="logo">Shop</div>
            <nav class="nav">
                <a href="#home">홈</a>
                <a href="#products">상품</a>
                <a href="#about">소개</a>
                <a href="#contact">연락</a>
            </nav>
            <div class="cart-icon">
                <span>🛒</span>
                <span class="cart-count">0</span>
            </div>
        </div>
    </header>
    <main>
        <section class="hero">
            <h1>최고의 상품을 만나보세요</h1>
            <p>품질과 가격 모두 만족하는 쇼핑몰</p>
        </section>
        <section id="products" class="products-section">
            <h2>인기 상품</h2>
            <div class="products-grid">
                <div class="product-card">
                    <div class="product-image"></div>
                    <h3>상품명 1</h3>
                    <p class="price">₩29,000</p>
                    <button class="add-to-cart">장바구니 추가</button>
                </div>
                <div class="product-card">
                    <div class="product-image"></div>
                    <h3>상품명 2</h3>
                    <p class="price">₩39,000</p>
                    <button class="add-to-cart">장바구니 추가</button>
                </div>
                <div class="product-card">
                    <div class="product-image"></div>
                    <h3>상품명 3</h3>
                    <p class="price">₩49,000</p>
                    <button class="add-to-cart">장바구니 추가</button>
                </div>
            </div>
        </section>
    </main>
    <footer class="footer">
        <p>&copy; 2024 Shop. All rights reserved.</p>
    </footer>
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
    line-height: 1.6;
    color: #333;
}

.header {
    background: white;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    position: sticky;
    top: 0;
    z-index: 1000;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 1rem 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.logo {
    font-size: 1.5rem;
    font-weight: bold;
    color: #3b82f6;
}

.nav {
    display: flex;
    gap: 2rem;
}

.nav a {
    text-decoration: none;
    color: #333;
    font-weight: 500;
    transition: color 0.3s;
}

.nav a:hover {
    color: #3b82f6;
}

.cart-icon {
    position: relative;
    font-size: 1.5rem;
    cursor: pointer;
}

.cart-count {
    position: absolute;
    top: -8px;
    right: -8px;
    background: #ef4444;
    color: white;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
}

.hero {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    text-align: center;
    padding: 5rem 2rem;
}

.hero h1 {
    font-size: 3rem;
    margin-bottom: 1rem;
}

.products-section {
    padding: 5rem 2rem;
    max-width: 1200px;
    margin: 0 auto;
}

.products-section h2 {
    text-align: center;
    font-size: 2.5rem;
    margin-bottom: 3rem;
}

.products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
}

.product-card {
    background: white;
    border-radius: 1rem;
    overflow: hidden;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    transition: transform 0.3s;
}

.product-card:hover {
    transform: translateY(-5px);
}

.product-image {
    width: 100%;
    height: 200px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.product-card h3 {
    padding: 1rem;
    font-size: 1.25rem;
}

.price {
    padding: 0 1rem;
    font-size: 1.5rem;
    font-weight: bold;
    color: #3b82f6;
}

.add-to-cart {
    width: 100%;
    padding: 1rem;
    background: #3b82f6;
    color: white;
    border: none;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.3s;
}

.add-to-cart:hover {
    background: #2563eb;
}

.footer {
    background: #1f2937;
    color: white;
    text-align: center;
    padding: 2rem;
}`,
      js: `let cartCount = 0;

document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', function() {
        cartCount++;
        document.querySelector('.cart-count').textContent = cartCount;
        button.textContent = '추가됨!';
        setTimeout(() => {
            button.textContent = '장바구니 추가';
        }, 1000);
    });
});`,
    },
    files: [],
    difficulty: 'intermediate',
    features: ['장바구니 기능', '상품 카드', '반응형 디자인', '가격 표시'],
  },
  // 대시보드 템플릿
  {
    name: '관리자 대시보드',
    description: '데이터 시각화와 관리 기능이 있는 대시보드',
    category: 'dashboard',
    tags: ['대시보드', '관리자', '데이터', '차트'],
    preview: {
      html: `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>관리자 대시보드</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="dashboard">
        <aside class="sidebar">
            <div class="logo">Dashboard</div>
            <nav class="sidebar-nav">
                <a href="#" class="active">대시보드</a>
                <a href="#">사용자</a>
                <a href="#">통계</a>
                <a href="#">설정</a>
            </nav>
        </aside>
        <main class="main-content">
            <header class="topbar">
                <h1>대시보드</h1>
                <div class="user-menu">사용자</div>
            </header>
            <div class="stats-grid">
                <div class="stat-card">
                    <h3>총 사용자</h3>
                    <p class="stat-value">1,234</p>
                    <span class="stat-change">+12%</span>
                </div>
                <div class="stat-card">
                    <h3>매출</h3>
                    <p class="stat-value">₩5,678,900</p>
                    <span class="stat-change">+8%</span>
                </div>
                <div class="stat-card">
                    <h3>주문</h3>
                    <p class="stat-value">456</p>
                    <span class="stat-change">+5%</span>
                </div>
                <div class="stat-card">
                    <h3>전환율</h3>
                    <p class="stat-value">3.2%</p>
                    <span class="stat-change">+0.5%</span>
                </div>
            </div>
            <div class="chart-section">
                <h2>통계 차트</h2>
                <div class="chart-placeholder"></div>
            </div>
        </main>
    </div>
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
    background: #f3f4f6;
}

.dashboard {
    display: flex;
    min-height: 100vh;
}

.sidebar {
    width: 250px;
    background: #1f2937;
    color: white;
    padding: 2rem;
}

.logo {
    font-size: 1.5rem;
    font-weight: bold;
    margin-bottom: 3rem;
}

.sidebar-nav {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.sidebar-nav a {
    color: #9ca3af;
    text-decoration: none;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    transition: background 0.3s;
}

.sidebar-nav a:hover,
.sidebar-nav a.active {
    background: #374151;
    color: white;
}

.main-content {
    flex: 1;
    padding: 2rem;
}

.topbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
}

.topbar h1 {
    font-size: 2rem;
    color: #1f2937;
}

.user-menu {
    padding: 0.5rem 1rem;
    background: white;
    border-radius: 0.5rem;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.stat-card {
    background: white;
    padding: 1.5rem;
    border-radius: 0.5rem;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.stat-card h3 {
    color: #6b7280;
    font-size: 0.875rem;
    margin-bottom: 0.5rem;
}

.stat-value {
    font-size: 2rem;
    font-weight: bold;
    color: #1f2937;
    margin-bottom: 0.5rem;
}

.stat-change {
    color: #10b981;
    font-size: 0.875rem;
}

.chart-section {
    background: white;
    padding: 2rem;
    border-radius: 0.5rem;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.chart-section h2 {
    margin-bottom: 1rem;
    color: #1f2937;
}

.chart-placeholder {
    height: 300px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.25rem;
}`,
      js: `// 대시보드 기능
document.addEventListener('DOMContentLoaded', function() {
    console.log('대시보드가 로드되었습니다.');
    
    // 통계 카드 애니메이션
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach((card, index) => {
        setTimeout(() => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'all 0.5s';
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 100);
        }, index * 100);
    });
});`,
    },
    files: [],
    difficulty: 'advanced',
    features: ['사이드바 네비게이션', '통계 카드', '차트 영역', '반응형 레이아웃'],
  },
];

// 파일 내용 채우기
enhancedTemplates.forEach(template => {
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

// 템플릿 변형 생성 함수 (website-templates.ts에서 가져옴)
function generateTemplateVariations(baseTemplate: Omit<WebsiteTemplate, 'id'>, count: number): WebsiteTemplate[] {
  const variations: WebsiteTemplate[] = [];
  const colors = [
    { primary: '#3b82f6', secondary: '#8b5cf6', accent: '#ec4899' },
    { primary: '#10b981', secondary: '#06b6d4', accent: '#f59e0b' },
    { primary: '#ef4444', secondary: '#f97316', accent: '#eab308' },
    { primary: '#6366f1', secondary: '#8b5cf6', accent: '#ec4899' },
    { primary: '#14b8a6', secondary: '#0ea5e9', accent: '#a855f7' },
  ];

  for (let i = 0; i < count; i++) {
    const colorScheme = colors[i % colors.length];
    const variation = {
      ...baseTemplate,
      id: `${baseTemplate.name.toLowerCase().replace(/\s+/g, '-')}-${i + 1}`,
      name: `${baseTemplate.name} ${i + 1 > 1 ? `(${i + 1})` : ''}`,
      preview: {
        ...baseTemplate.preview,
        css: baseTemplate.preview.css.replace(/#3b82f6/g, colorScheme.primary)
          .replace(/#8b5cf6/g, colorScheme.secondary)
          .replace(/#ec4899/g, colorScheme.accent),
      },
      files: baseTemplate.files.map(file => ({
        ...file,
        content: file.type === 'css' 
          ? file.content.replace(/#3b82f6/g, colorScheme.primary)
            .replace(/#8b5cf6/g, colorScheme.secondary)
            .replace(/#ec4899/g, colorScheme.accent)
          : file.content,
      })),
    };
    variations.push(variation as WebsiteTemplate);
  }
  return variations;
}

// 강화된 템플릿 변형 생성
export const enhancedTemplateVariations: WebsiteTemplate[] = [];
enhancedTemplates.forEach(template => {
  const variations = generateTemplateVariations(template, 2000);
  enhancedTemplateVariations.push(...variations);
});
