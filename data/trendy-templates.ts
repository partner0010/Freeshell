/**
 * 최신 트렌드 반영 템플릿
 * 2025-2026 디자인 트렌드: 글래스모피즘, 뉴모피즘, 비비드 컬러, 볼드 메탈 등
 */
import type { WebsiteTemplate } from './website-templates';

export const trendyTemplates: Omit<WebsiteTemplate, 'id'>[] = [
  // 글래스모피즘 템플릿
  {
    name: '글래스모피즘 랜딩',
    description: '2025 최신 트렌드 - 반투명 유리 효과의 모던한 디자인',
    category: 'landing',
    tags: ['글래스모피즘', '모던', '트렌디', '2025'],
    preview: {
      html: `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>글래스모피즘 랜딩</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="background">
        <div class="gradient-orb orb-1"></div>
        <div class="gradient-orb orb-2"></div>
        <div class="gradient-orb orb-3"></div>
    </div>
    <nav class="glass-nav">
        <div class="logo">Glass</div>
        <div class="nav-links">
            <a href="#home">홈</a>
            <a href="#features">기능</a>
            <a href="#about">소개</a>
        </div>
    </nav>
    <main>
        <section class="hero-glass">
            <div class="glass-card">
                <h1>미래를 만나보세요</h1>
                <p>글래스모피즘 디자인으로 새로운 경험을 제공합니다</p>
                <button class="glass-button">시작하기</button>
            </div>
        </section>
        <section class="features-glass">
            <div class="glass-card feature">
                <h3>✨ 혁신적</h3>
                <p>최신 기술로 구현된 경험</p>
            </div>
            <div class="glass-card feature">
                <h3>🎨 아름다움</h3>
                <p>시각적으로 매력적인 디자인</p>
            </div>
            <div class="glass-card feature">
                <h3>⚡ 빠름</h3>
                <p>최적화된 성능</p>
            </div>
        </section>
    </main>
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
    min-height: 100vh;
    overflow-x: hidden;
    position: relative;
}

.background {
    position: fixed;
    inset: 0;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
    z-index: 0;
}

.gradient-orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.5;
    animation: float 20s infinite ease-in-out;
}

.orb-1 {
    width: 500px;
    height: 500px;
    background: #667eea;
    top: -200px;
    left: -200px;
}

.orb-2 {
    width: 400px;
    height: 400px;
    background: #764ba2;
    bottom: -150px;
    right: -150px;
    animation-delay: -5s;
}

.orb-3 {
    width: 300px;
    height: 300px;
    background: #f093fb;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    animation-delay: -10s;
}

@keyframes float {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(30px, -30px) scale(1.1); }
    66% { transform: translate(-30px, 30px) scale(0.9); }
}

.glass-nav {
    position: relative;
    z-index: 100;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    padding: 1rem 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.logo {
    font-size: 1.5rem;
    font-weight: bold;
    color: white;
}

.nav-links {
    display: flex;
    gap: 2rem;
}

.nav-links a {
    color: white;
    text-decoration: none;
    font-weight: 500;
    transition: opacity 0.3s;
}

.nav-links a:hover {
    opacity: 0.7;
}

.hero-glass {
    position: relative;
    z-index: 10;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
}

.glass-card {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 2rem;
    padding: 3rem;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    text-align: center;
    color: white;
}

.glass-card h1 {
    font-size: 3.5rem;
    margin-bottom: 1rem;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.glass-card p {
    font-size: 1.25rem;
    margin-bottom: 2rem;
    opacity: 0.9;
}

.glass-button {
    padding: 1rem 2rem;
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 1rem;
    color: white;
    font-weight: 600;
    font-size: 1.1rem;
    cursor: pointer;
    transition: all 0.3s;
}

.glass-button:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.features-glass {
    position: relative;
    z-index: 10;
    padding: 5rem 2rem;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
    max-width: 1200px;
    margin: 0 auto;
}

.feature {
    padding: 2rem;
}

.feature h3 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
}

@media (max-width: 768px) {
    .glass-card h1 {
        font-size: 2rem;
    }
    
    .nav-links {
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
});`,
    },
    files: [],
    difficulty: 'intermediate',
    features: ['글래스모피즘', '애니메이션', '반응형', '모던'],
  },
  // 뉴모피즘 템플릿
  {
    name: '뉴모피즘 대시보드',
    description: '부드러운 그림자와 입체감이 있는 뉴모피즘 디자인',
    category: 'dashboard',
    tags: ['뉴모피즘', '대시보드', '소프트', '입체'],
    preview: {
      html: `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>뉴모피즘 대시보드</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="neumorphic-container">
        <header class="neumorphic-header">
            <h1>대시보드</h1>
        </header>
        <main class="dashboard-grid">
            <div class="neumorphic-card">
                <div class="card-icon">📊</div>
                <h3>통계</h3>
                <p class="stat-value">1,234</p>
            </div>
            <div class="neumorphic-card">
                <div class="card-icon">👥</div>
                <h3>사용자</h3>
                <p class="stat-value">567</p>
            </div>
            <div class="neumorphic-card">
                <div class="card-icon">💰</div>
                <h3>매출</h3>
                <p class="stat-value">₩89,012</p>
            </div>
            <div class="neumorphic-card large">
                <h3>차트</h3>
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
    background: #e0e5ec;
    min-height: 100vh;
    padding: 2rem;
}

.neumorphic-container {
    max-width: 1200px;
    margin: 0 auto;
}

.neumorphic-header {
    background: #e0e5ec;
    padding: 2rem;
    border-radius: 2rem;
    margin-bottom: 2rem;
    box-shadow: 
        9px 9px 16px rgba(163, 177, 198, 0.6),
        -9px -9px 16px rgba(255, 255, 255, 0.5);
    text-align: center;
}

.neumorphic-header h1 {
    color: #4a5568;
    font-size: 2.5rem;
}

.dashboard-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
}

.neumorphic-card {
    background: #e0e5ec;
    padding: 2rem;
    border-radius: 2rem;
    box-shadow: 
        9px 9px 16px rgba(163, 177, 198, 0.6),
        -9px -9px 16px rgba(255, 255, 255, 0.5);
    text-align: center;
    transition: all 0.3s;
}

.neumorphic-card:hover {
    box-shadow: 
        inset 9px 9px 16px rgba(163, 177, 198, 0.6),
        inset -9px -9px 16px rgba(255, 255, 255, 0.5);
}

.neumorphic-card.large {
    grid-column: span 2;
}

.card-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
}

.neumorphic-card h3 {
    color: #4a5568;
    margin-bottom: 1rem;
    font-size: 1.25rem;
}

.stat-value {
    font-size: 2rem;
    font-weight: bold;
    color: #2d3748;
}

.chart-placeholder {
    height: 200px;
    background: #e0e5ec;
    border-radius: 1rem;
    margin-top: 1rem;
    box-shadow: 
        inset 5px 5px 10px rgba(163, 177, 198, 0.6),
        inset -5px -5px 10px rgba(255, 255, 255, 0.5);
}

@media (max-width: 768px) {
    .neumorphic-card.large {
        grid-column: span 1;
    }
}`,
      js: `// 카드 애니메이션
document.querySelectorAll('.neumorphic-card').forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    setTimeout(() => {
        card.style.transition = 'all 0.5s';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
    }, index * 100);
});`,
    },
    files: [],
    difficulty: 'intermediate',
    features: ['뉴모피즘', '입체감', '소프트 UI', '대시보드'],
  },
  // 비비드 컬러 템플릿
  {
    name: '비비드 컬러 랜딩',
    description: '2025 트렌드 - 선명하고 생동감 있는 컬러 조합',
    category: 'landing',
    tags: ['비비드', '볼드', '트렌디', '2025'],
    preview: {
      html: `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>비비드 컬러 랜딩</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <nav class="vivid-nav">
        <div class="logo">Vivid</div>
        <button class="nav-toggle">☰</button>
    </nav>
    <section class="vivid-hero">
        <h1 class="vivid-title">생동감 넘치는<br>디지털 경험</h1>
        <p class="vivid-subtitle">비비드한 컬러로 만나는 새로운 세상</p>
        <div class="vivid-buttons">
            <button class="btn-vivid-1">시작하기</button>
            <button class="btn-vivid-2">더 알아보기</button>
        </div>
    </section>
    <section class="vivid-features">
        <div class="feature-vivid feature-1">
            <h3>🎨 창의적</h3>
            <p>무한한 가능성</p>
        </div>
        <div class="feature-vivid feature-2">
            <h3>⚡ 빠른</h3>
            <p>즉각적인 반응</p>
        </div>
        <div class="feature-vivid feature-3">
            <h3>🌟 혁신적</h3>
            <p>차세대 기술</p>
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
    background: #0a0a0a;
    color: white;
    overflow-x: hidden;
}

.vivid-nav {
    position: fixed;
    top: 0;
    width: 100%;
    padding: 1.5rem 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: rgba(10, 10, 10, 0.8);
    backdrop-filter: blur(10px);
    z-index: 1000;
}

.logo {
    font-size: 1.5rem;
    font-weight: bold;
    background: linear-gradient(135deg, #ff006e, #8338ec, #3a86ff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.vivid-hero {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 2rem;
    background: linear-gradient(135deg, #0a0a0a 0%, #1a0033 50%, #000033 100%);
    position: relative;
    overflow: hidden;
}

.vivid-hero::before {
    content: '';
    position: absolute;
    width: 500px;
    height: 500px;
    background: radial-gradient(circle, rgba(255, 0, 110, 0.3) 0%, transparent 70%);
    top: -250px;
    left: -250px;
    animation: pulse 4s infinite;
}

.vivid-hero::after {
    content: '';
    position: absolute;
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, rgba(131, 56, 236, 0.3) 0%, transparent 70%);
    bottom: -200px;
    right: -200px;
    animation: pulse 4s infinite 2s;
}

@keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 0.5; }
    50% { transform: scale(1.2); opacity: 0.8; }
}

.vivid-title {
    font-size: 4rem;
    font-weight: 900;
    margin-bottom: 1.5rem;
    background: linear-gradient(135deg, #ff006e, #8338ec, #3a86ff, #06ffa5);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-size: 200% 200%;
    animation: gradient 3s ease infinite;
    position: relative;
    z-index: 10;
}

@keyframes gradient {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
}

.vivid-subtitle {
    font-size: 1.5rem;
    margin-bottom: 3rem;
    opacity: 0.9;
    position: relative;
    z-index: 10;
}

.vivid-buttons {
    display: flex;
    gap: 1.5rem;
    position: relative;
    z-index: 10;
}

.btn-vivid-1 {
    padding: 1rem 2.5rem;
    background: linear-gradient(135deg, #ff006e, #8338ec);
    border: none;
    border-radius: 2rem;
    color: white;
    font-weight: 700;
    font-size: 1.1rem;
    cursor: pointer;
    transition: all 0.3s;
    box-shadow: 0 10px 30px rgba(255, 0, 110, 0.4);
}

.btn-vivid-1:hover {
    transform: translateY(-3px);
    box-shadow: 0 15px 40px rgba(255, 0, 110, 0.6);
}

.btn-vivid-2 {
    padding: 1rem 2.5rem;
    background: transparent;
    border: 3px solid #3a86ff;
    border-radius: 2rem;
    color: #3a86ff;
    font-weight: 700;
    font-size: 1.1rem;
    cursor: pointer;
    transition: all 0.3s;
}

.btn-vivid-2:hover {
    background: #3a86ff;
    color: white;
    box-shadow: 0 10px 30px rgba(58, 134, 255, 0.4);
}

.vivid-features {
    padding: 5rem 2rem;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    max-width: 1200px;
    margin: 0 auto;
}

.feature-vivid {
    padding: 3rem 2rem;
    border-radius: 2rem;
    text-align: center;
    transition: transform 0.3s;
}

.feature-vivid:hover {
    transform: translateY(-10px);
}

.feature-1 {
    background: linear-gradient(135deg, #ff006e, #ff4081);
}

.feature-2 {
    background: linear-gradient(135deg, #8338ec, #a855f7);
}

.feature-3 {
    background: linear-gradient(135deg, #3a86ff, #06ffa5);
}

.feature-vivid h3 {
    font-size: 2rem;
    margin-bottom: 1rem;
}

.feature-vivid p {
    font-size: 1.1rem;
    opacity: 0.9;
}

@media (max-width: 768px) {
    .vivid-title {
        font-size: 2.5rem;
    }
    
    .vivid-buttons {
        flex-direction: column;
        width: 100%;
    }
}`,
      js: `// 인터랙티브 효과
document.querySelectorAll('.feature-vivid').forEach((feature, index) => {
    feature.style.opacity = '0';
    feature.style.transform = 'translateY(30px)';
    setTimeout(() => {
        feature.style.transition = 'all 0.6s';
        feature.style.opacity = '1';
        feature.style.transform = 'translateY(0)';
    }, index * 200);
});`,
    },
    files: [],
    difficulty: 'advanced',
    features: ['비비드 컬러', '그라데이션', '애니메이션', '볼드'],
  },
  // 볼드 메탈 템플릿
  {
    name: '볼드 메탈 비즈니스',
    description: '강렬한 메탈릭 효과와 볼드한 타이포그래피',
    category: 'business',
    tags: ['메탈', '볼드', '비즈니스', '프리미엄'],
    preview: {
      html: `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>볼드 메탈 비즈니스</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <header class="metal-header">
        <nav class="metal-nav">
            <div class="logo-metal">METAL</div>
            <div class="nav-metal">
                <a href="#home">홈</a>
                <a href="#services">서비스</a>
                <a href="#contact">연락</a>
            </div>
        </nav>
    </header>
    <section class="metal-hero">
        <h1 class="metal-title">강력한 비즈니스 솔루션</h1>
        <p class="metal-subtitle">메탈릭한 디자인으로 프리미엄 경험을 제공합니다</p>
        <button class="metal-button">지금 시작하기</button>
    </section>
    <section class="metal-services">
        <div class="service-metal">
            <div class="metal-icon">⚡</div>
            <h3>빠른 성능</h3>
            <p>최적화된 솔루션</p>
        </div>
        <div class="service-metal">
            <div class="metal-icon">🔒</div>
            <h3>안전한 보안</h3>
            <p>엔터프라이즈급</p>
        </div>
        <div class="service-metal">
            <div class="metal-icon">🚀</div>
            <h3>확장 가능</h3>
            <p>무한한 성장</p>
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
    background: #0a0a0a;
    color: white;
    overflow-x: hidden;
}

.metal-header {
    position: fixed;
    top: 0;
    width: 100%;
    z-index: 1000;
    background: rgba(10, 10, 10, 0.95);
    backdrop-filter: blur(10px);
}

.metal-nav {
    max-width: 1200px;
    margin: 0 auto;
    padding: 1.5rem 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.logo-metal {
    font-size: 1.5rem;
    font-weight: 900;
    background: linear-gradient(135deg, #ffd700, #ffed4e, #ffd700);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: 0 0 30px rgba(255, 215, 0, 0.5);
    letter-spacing: 2px;
}

.nav-metal {
    display: flex;
    gap: 2rem;
}

.nav-metal a {
    color: #ffd700;
    text-decoration: none;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
    transition: all 0.3s;
    position: relative;
}

.nav-metal a::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 0;
    width: 0;
    height: 2px;
    background: #ffd700;
    transition: width 0.3s;
}

.nav-metal a:hover::after {
    width: 100%;
}

.metal-hero {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 2rem;
    background: 
        radial-gradient(circle at 20% 50%, rgba(255, 215, 0, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 80% 80%, rgba(255, 215, 0, 0.1) 0%, transparent 50%),
        #0a0a0a;
    position: relative;
}

.metal-hero::before {
    content: '';
    position: absolute;
    inset: 0;
    background: 
        repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(255, 215, 0, 0.03) 2px,
            rgba(255, 215, 0, 0.03) 4px
        );
    pointer-events: none;
}

.metal-title {
    font-size: 5rem;
    font-weight: 900;
    margin-bottom: 1.5rem;
    background: linear-gradient(135deg, #ffd700, #ffed4e, #ffffff, #ffd700);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-size: 200% 200%;
    animation: metal-shine 3s linear infinite;
    text-transform: uppercase;
    letter-spacing: 3px;
    position: relative;
    z-index: 10;
}

@keyframes metal-shine {
    0% { background-position: 0% 50%; }
    100% { background-position: 200% 50%; }
}

.metal-subtitle {
    font-size: 1.5rem;
    margin-bottom: 3rem;
    color: #ffd700;
    opacity: 0.9;
    position: relative;
    z-index: 10;
}

.metal-button {
    padding: 1.25rem 3rem;
    background: linear-gradient(135deg, #ffd700, #ffed4e);
    border: none;
    border-radius: 0.5rem;
    color: #0a0a0a;
    font-weight: 900;
    font-size: 1.1rem;
    text-transform: uppercase;
    letter-spacing: 2px;
    cursor: pointer;
    transition: all 0.3s;
    box-shadow: 
        0 0 20px rgba(255, 215, 0, 0.5),
        0 10px 30px rgba(255, 215, 0, 0.3);
    position: relative;
    z-index: 10;
}

.metal-button:hover {
    transform: translateY(-3px);
    box-shadow: 
        0 0 30px rgba(255, 215, 0, 0.8),
        0 15px 40px rgba(255, 215, 0, 0.5);
}

.metal-button:active {
    transform: translateY(-1px);
}

.metal-services {
    padding: 5rem 2rem;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    max-width: 1200px;
    margin: 0 auto;
}

.service-metal {
    background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 215, 0, 0.05));
    border: 2px solid rgba(255, 215, 0, 0.3);
    border-radius: 1rem;
    padding: 3rem 2rem;
    text-align: center;
    transition: all 0.3s;
    position: relative;
    overflow: hidden;
}

.service-metal::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255, 215, 0, 0.1) 0%, transparent 70%);
    opacity: 0;
    transition: opacity 0.3s;
}

.service-metal:hover::before {
    opacity: 1;
}

.service-metal:hover {
    border-color: #ffd700;
    box-shadow: 0 0 30px rgba(255, 215, 0, 0.3);
    transform: translateY(-5px);
}

.metal-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
    filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.5));
}

.service-metal h3 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    color: #ffd700;
    font-weight: 700;
}

.service-metal p {
    color: #ccc;
}

@media (max-width: 768px) {
    .metal-title {
        font-size: 3rem;
    }
    
    .nav-metal {
        display: none;
    }
}`,
      js: `// 메탈 효과
document.addEventListener('DOMContentLoaded', () => {
    const title = document.querySelector('.metal-title');
    if (title) {
        title.style.animation = 'metal-shine 3s linear infinite';
    }
});`,
    },
    files: [],
    difficulty: 'advanced',
    features: ['메탈릭 효과', '볼드 타이포', '프리미엄', '애니메이션'],
  },
];

// 파일 내용 채우기
trendyTemplates.forEach(template => {
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
    { primary: '#ff006e', secondary: '#8338ec', accent: '#3a86ff' },
    { primary: '#06ffa5', secondary: '#00d4ff', accent: '#8338ec' },
    { primary: '#ffd700', secondary: '#ff6b6b', accent: '#4ecdc4' },
    { primary: '#ff4081', secondary: '#7c4dff', accent: '#00bcd4' },
    { primary: '#f093fb', secondary: '#4facfe', accent: '#00f2fe' },
  ];

  for (let i = 0; i < count; i++) {
    const colors = colorSchemes[i % colorSchemes.length];
    const variation = {
      ...baseTemplate,
      id: `${baseTemplate.name.toLowerCase().replace(/\s+/g, '-')}-trendy-${i + 1}`,
      name: `${baseTemplate.name} ${i + 1 > 1 ? `(${i + 1})` : ''}`,
      preview: {
        ...baseTemplate.preview,
        css: baseTemplate.preview.css
          .replace(/#ff006e/g, colors.primary)
          .replace(/#8338ec/g, colors.secondary)
          .replace(/#3a86ff/g, colors.accent)
          .replace(/#ffd700/g, colors.primary)
          .replace(/#667eea/g, colors.primary)
          .replace(/#764ba2/g, colors.secondary),
      },
      files: baseTemplate.files.map(file => ({
        ...file,
        content: file.type === 'css' 
          ? file.content
              .replace(/#ff006e/g, colors.primary)
              .replace(/#8338ec/g, colors.secondary)
              .replace(/#3a86ff/g, colors.accent)
              .replace(/#ffd700/g, colors.primary)
              .replace(/#667eea/g, colors.primary)
              .replace(/#764ba2/g, colors.secondary)
          : file.content,
      })),
    };
    variations.push(variation as WebsiteTemplate);
  }
  return variations;
}

// 트렌디 템플릿 변형 생성
export const trendyTemplateVariations: WebsiteTemplate[] = [];
trendyTemplates.forEach(template => {
  const variations = generateTemplateVariations(template, 2000);
  trendyTemplateVariations.push(...variations);
});
