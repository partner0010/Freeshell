/**
 * 웹사이트/앱 템플릿 데이터
 * 다양한 카테고리의 웹사이트와 웹 앱 템플릿
 */

export interface WebsiteTemplate {
  id: string;
  name: string;
  description: string;
  category: 'landing' | 'blog' | 'portfolio' | 'business' | 'ecommerce' | 'app' | 'dashboard' | 'other';
  tags: string[];
  preview: {
    html: string;
    css: string;
    js?: string;
  };
  files: Array<{
    name: string;
    type: 'html' | 'css' | 'javascript';
    content: string;
  }>;
  thumbnail?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  features: string[];
}

// 템플릿 생성 함수 - 다양한 변형을 자동 생성
function generateTemplateVariations(baseTemplate: Omit<WebsiteTemplate, 'id'>, count: number): WebsiteTemplate[] {
  const variations: WebsiteTemplate[] = [];
  
  // 더 다양한 색상 스킴 (20가지)
  const colorSchemes = [
    { primary: '#3b82f6', secondary: '#8b5cf6', accent: '#ec4899' }, // Blue-Purple-Pink
    { primary: '#10b981', secondary: '#06b6d4', accent: '#f59e0b' }, // Green-Cyan-Orange
    { primary: '#ef4444', secondary: '#f97316', accent: '#eab308' }, // Red-Orange-Yellow
    { primary: '#6366f1', secondary: '#8b5cf6', accent: '#ec4899' }, // Indigo-Purple-Pink
    { primary: '#14b8a6', secondary: '#0ea5e9', accent: '#a855f7' }, // Teal-Blue-Purple
    { primary: '#f43f5e', secondary: '#ec4899', accent: '#a855f7' }, // Rose-Pink-Purple
    { primary: '#06b6d4', secondary: '#3b82f6', accent: '#8b5cf6' }, // Cyan-Blue-Purple
    { primary: '#f59e0b', secondary: '#ef4444', accent: '#ec4899' }, // Amber-Red-Pink
    { primary: '#8b5cf6', secondary: '#ec4899', accent: '#f43f5e' }, // Purple-Pink-Rose
    { primary: '#0ea5e9', secondary: '#06b6d4', accent: '#10b981' }, // Sky-Cyan-Emerald
    { primary: '#a855f7', secondary: '#6366f1', accent: '#3b82f6' }, // Violet-Indigo-Blue
    { primary: '#ec4899', secondary: '#f43f5e', accent: '#ef4444' }, // Pink-Rose-Red
    { primary: '#06b6d4', secondary: '#14b8a6', accent: '#10b981' }, // Cyan-Teal-Emerald
    { primary: '#3b82f6', secondary: '#0ea5e9', accent: '#06b6d4' }, // Blue-Sky-Cyan
    { primary: '#8b5cf6', secondary: '#a855f7', accent: '#6366f1' }, // Purple-Violet-Indigo
    { primary: '#f97316', secondary: '#f59e0b', accent: '#eab308' }, // Orange-Amber-Yellow
    { primary: '#ec4899', secondary: '#8b5cf6', accent: '#6366f1' }, // Pink-Purple-Indigo
    { primary: '#10b981', secondary: '#14b8a6', accent: '#06b6d4' }, // Emerald-Teal-Cyan
    { primary: '#ef4444', secondary: '#f43f5e', accent: '#ec4899' }, // Red-Rose-Pink
    { primary: '#6366f1', secondary: '#3b82f6', accent: '#0ea5e9' }, // Indigo-Blue-Sky
  ];

  // 스타일 변형 (레이아웃, 폰트, 간격 등)
  const styleVariations = [
    { layout: 'centered', spacing: 'compact', font: 'sans' },
    { layout: 'wide', spacing: 'normal', font: 'serif' },
    { layout: 'narrow', spacing: 'loose', font: 'mono' },
    { layout: 'centered', spacing: 'normal', font: 'sans' },
    { layout: 'wide', spacing: 'compact', font: 'serif' },
  ];

  for (let i = 0; i < count; i++) {
    const colorScheme = colorSchemes[i % colorSchemes.length];
    const styleVar = styleVariations[i % styleVariations.length];
    
    // CSS 변형 생성
    let modifiedCss = baseTemplate.preview.css
      .replace(/#3b82f6/g, colorScheme.primary)
      .replace(/#8b5cf6/g, colorScheme.secondary)
      .replace(/#ec4899/g, colorScheme.accent)
      .replace(/#6366f1/g, colorScheme.primary)
      .replace(/#10b981/g, colorScheme.secondary)
      .replace(/#ef4444/g, colorScheme.accent);

    // 스타일 변형 적용
    if (styleVar.spacing === 'compact') {
      modifiedCss = modifiedCss.replace(/padding:\s*\d+px/g, (match) => {
        const value = parseInt(match.match(/\d+/)?.[0] || '20');
        return match.replace(/\d+/, String(Math.max(10, value * 0.7)));
      });
    } else if (styleVar.spacing === 'loose') {
      modifiedCss = modifiedCss.replace(/padding:\s*\d+px/g, (match) => {
        const value = parseInt(match.match(/\d+/)?.[0] || '20');
        return match.replace(/\d+/, String(value * 1.3));
      });
    }

    // 폰트 변형
    if (styleVar.font === 'serif') {
      modifiedCss = modifiedCss.replace(/font-family:[^;]+/g, 'font-family: Georgia, serif');
    } else if (styleVar.font === 'mono') {
      modifiedCss = modifiedCss.replace(/font-family:[^;]+/g, 'font-family: "Courier New", monospace');
    }

    const variation = {
      ...baseTemplate,
      id: `${baseTemplate.name.toLowerCase().replace(/\s+/g, '-')}-v${i + 1}`,
      name: `${baseTemplate.name} ${i + 1 > 1 ? `(변형 ${i + 1})` : ''}`,
      description: `${baseTemplate.description} - ${colorScheme.primary} 테마`,
      preview: {
        ...baseTemplate.preview,
        css: modifiedCss,
      },
      files: baseTemplate.files.map(file => ({
        ...file,
        content: file.type === 'css' 
          ? file.content
              .replace(/#3b82f6/g, colorScheme.primary)
              .replace(/#8b5cf6/g, colorScheme.secondary)
              .replace(/#ec4899/g, colorScheme.accent)
              .replace(/#6366f1/g, colorScheme.primary)
              .replace(/#10b981/g, colorScheme.secondary)
              .replace(/#ef4444/g, colorScheme.accent)
          : file.content,
      })),
    };
    variations.push(variation as WebsiteTemplate);
  }
  return variations;
}

// 기본 템플릿 정의
const baseTemplates: Omit<WebsiteTemplate, 'id'>[] = [
  // 랜딩 페이지
  {
    name: '모던 랜딩 페이지',
    description: '현대적이고 세련된 랜딩 페이지 템플릿',
    category: 'landing',
    tags: ['랜딩페이지', '마케팅', '모던', '반응형'],
    preview: {
      html: `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>모던 랜딩 페이지</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <header class="header">
        <nav class="nav">
            <div class="logo">Brand</div>
            <ul class="nav-links">
                <li><a href="#home">홈</a></li>
                <li><a href="#features">기능</a></li>
                <li><a href="#about">소개</a></li>
                <li><a href="#contact">연락처</a></li>
            </ul>
            <button class="cta-button">시작하기</button>
        </nav>
    </header>
    <main>
        <section class="hero">
            <h1>혁신적인 솔루션으로<br>미래를 만들어가세요</h1>
            <p>강력한 기능과 직관적인 디자인으로 비즈니스를 성장시키세요</p>
            <div class="hero-buttons">
                <button class="btn-primary">무료로 시작하기</button>
                <button class="btn-secondary">더 알아보기</button>
            </div>
        </section>
        <section class="features" id="features">
            <h2>주요 기능</h2>
            <div class="feature-grid">
                <div class="feature-card">
                    <div class="feature-icon">⚡</div>
                    <h3>빠른 성능</h3>
                    <p>최적화된 코드로 빠른 로딩 속도</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">🔒</div>
                    <h3>안전한 보안</h3>
                    <p>엔터프라이즈급 보안 시스템</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">📱</div>
                    <h3>반응형 디자인</h3>
                    <p>모든 기기에서 완벽한 경험</p>
                </div>
            </div>
        </section>
    </main>
    <footer class="footer">
        <p>&copy; 2024 Brand. All rights reserved.</p>
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
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
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

.nav {
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

.nav-links {
    display: flex;
    list-style: none;
    gap: 2rem;
}

.nav-links a {
    text-decoration: none;
    color: #333;
    font-weight: 500;
    transition: color 0.3s;
}

.nav-links a:hover {
    color: #3b82f6;
}

.cta-button {
    padding: 0.75rem 1.5rem;
    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
    color: white;
    border: none;
    border-radius: 0.5rem;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s;
}

.cta-button:hover {
    transform: translateY(-2px);
}

.hero {
    text-align: center;
    padding: 6rem 2rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

.hero h1 {
    font-size: 3.5rem;
    margin-bottom: 1.5rem;
    line-height: 1.2;
}

.hero p {
    font-size: 1.25rem;
    margin-bottom: 2rem;
    opacity: 0.9;
}

.hero-buttons {
    display: flex;
    gap: 1rem;
    justify-content: center;
}

.btn-primary, .btn-secondary {
    padding: 1rem 2rem;
    font-size: 1.1rem;
    border: none;
    border-radius: 0.5rem;
    cursor: pointer;
    font-weight: 600;
    transition: transform 0.2s;
}

.btn-primary {
    background: white;
    color: #3b82f6;
}

.btn-secondary {
    background: transparent;
    color: white;
    border: 2px solid white;
}

.btn-primary:hover, .btn-secondary:hover {
    transform: translateY(-2px);
}

.features {
    padding: 5rem 2rem;
    max-width: 1200px;
    margin: 0 auto;
}

.features h2 {
    text-align: center;
    font-size: 2.5rem;
    margin-bottom: 3rem;
}

.feature-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
}

.feature-card {
    padding: 2rem;
    background: white;
    border-radius: 1rem;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    text-align: center;
    transition: transform 0.3s;
}

.feature-card:hover {
    transform: translateY(-5px);
}

.feature-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
}

.feature-card h3 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
}

.footer {
    background: #1f2937;
    color: white;
    text-align: center;
    padding: 2rem;
}

@media (max-width: 768px) {
    .nav-links {
        display: none;
    }
    
    .hero h1 {
        font-size: 2rem;
    }
    
    .hero-buttons {
        flex-direction: column;
    }
}`,
      js: `document.addEventListener('DOMContentLoaded', function() {
    // 스무스 스크롤
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
});`,
    },
    files: [
      {
        name: 'index.html',
        type: 'html',
        content: '',
      },
      {
        name: 'style.css',
        type: 'css',
        content: '',
      },
      {
        name: 'script.js',
        type: 'javascript',
        content: '',
      },
    ],
    difficulty: 'beginner',
    features: ['반응형 디자인', '스무스 스크롤', '모던 UI'],
  },
  // 블로그 템플릿
  {
    name: '미니멀 블로그',
    description: '깔끔하고 읽기 좋은 블로그 템플릿',
    category: 'blog',
    tags: ['블로그', '미니멀', '읽기', '콘텐츠'],
    preview: {
      html: `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>미니멀 블로그</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <header class="header">
        <div class="container">
            <h1 class="logo">My Blog</h1>
            <nav>
                <a href="#home">홈</a>
                <a href="#about">소개</a>
                <a href="#posts">글</a>
            </nav>
        </div>
    </header>
    <main class="container">
        <article class="post">
            <h2>블로그 포스트 제목</h2>
            <div class="meta">
                <span>2024년 1월 1일</span>
                <span>작성자: 홍길동</span>
            </div>
            <div class="content">
                <p>이것은 블로그 포스트의 내용입니다. 여기에 본문이 들어갑니다.</p>
                <p>여러 문단으로 구성된 긴 글을 작성할 수 있습니다.</p>
            </div>
        </article>
    </main>
    <footer class="footer">
        <p>&copy; 2024 My Blog</p>
    </footer>
</body>
</html>`,
      css: `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    line-height: 1.8;
    color: #333;
    background: #f9fafb;
}

.container {
    max-width: 800px;
    margin: 0 auto;
    padding: 0 2rem;
}

.header {
    background: white;
    padding: 2rem 0;
    border-bottom: 1px solid #e5e7eb;
}

.header .container {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.logo {
    font-size: 1.5rem;
    font-weight: bold;
}

nav a {
    margin-left: 2rem;
    text-decoration: none;
    color: #666;
}

.post {
    background: white;
    padding: 3rem;
    margin: 3rem 0;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.post h2 {
    font-size: 2rem;
    margin-bottom: 1rem;
}

.meta {
    color: #666;
    font-size: 0.9rem;
    margin-bottom: 2rem;
}

.meta span {
    margin-right: 1rem;
}

.content p {
    margin-bottom: 1.5rem;
}

.footer {
    text-align: center;
    padding: 2rem;
    color: #666;
}`,
    },
    files: [
      {
        name: 'index.html',
        type: 'html',
        content: '',
      },
      {
        name: 'style.css',
        type: 'css',
        content: '',
      },
    ],
    difficulty: 'beginner',
    features: ['미니멀 디자인', '읽기 최적화', '반응형'],
  },
  // 투두리스트 앱
  {
    name: '투두리스트 앱',
    description: '간단하고 실용적인 투두리스트 웹 앱',
    category: 'app',
    tags: ['투두', '할일', '앱', '인터랙티브'],
    preview: {
      html: `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>투두리스트</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <h1>할 일 목록</h1>
        <div class="input-section">
            <input type="text" id="todoInput" placeholder="새 할 일을 입력하세요...">
            <button id="addBtn">추가</button>
        </div>
        <ul id="todoList"></ul>
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
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 2rem;
}

.container {
    background: white;
    border-radius: 1rem;
    padding: 2rem;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    width: 100%;
    max-width: 500px;
}

h1 {
    text-align: center;
    margin-bottom: 2rem;
    color: #333;
}

.input-section {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 2rem;
}

#todoInput {
    flex: 1;
    padding: 0.75rem;
    border: 2px solid #e5e7eb;
    border-radius: 0.5rem;
    font-size: 1rem;
}

#todoInput:focus {
    outline: none;
    border-color: #3b82f6;
}

#addBtn {
    padding: 0.75rem 1.5rem;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 0.5rem;
    font-weight: 600;
    cursor: pointer;
}

#addBtn:hover {
    background: #2563eb;
}

#todoList {
    list-style: none;
}

.todo-item {
    display: flex;
    align-items: center;
    padding: 1rem;
    margin-bottom: 0.5rem;
    background: #f9fafb;
    border-radius: 0.5rem;
    gap: 1rem;
}

.todo-item.completed {
    opacity: 0.6;
    text-decoration: line-through;
}

.todo-item input[type="checkbox"] {
    width: 1.5rem;
    height: 1.5rem;
    cursor: pointer;
}

.todo-item span {
    flex: 1;
}

.todo-item button {
    padding: 0.5rem 1rem;
    background: #ef4444;
    color: white;
    border: none;
    border-radius: 0.25rem;
    cursor: pointer;
}

.todo-item button:hover {
    background: #dc2626;
}`,
      js: `let todos = [];

const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');

function renderTodos() {
    todoList.innerHTML = '';
    todos.forEach((todo, index) => {
        const li = document.createElement('li');
        li.className = \`todo-item \${todo.completed ? 'completed' : ''}\`;
        li.innerHTML = \`
            <input type="checkbox" \${todo.completed ? 'checked' : ''} onchange="toggleTodo(\${index})">
            <span>\${todo.text}</span>
            <button onclick="deleteTodo(\${index})">삭제</button>
        \`;
        todoList.appendChild(li);
    });
}

function addTodo() {
    const text = todoInput.value.trim();
    if (text) {
        todos.push({ text, completed: false });
        todoInput.value = '';
        renderTodos();
    }
}

function toggleTodo(index) {
    todos[index].completed = !todos[index].completed;
    renderTodos();
}

function deleteTodo(index) {
    todos.splice(index, 1);
    renderTodos();
}

addBtn.addEventListener('click', addTodo);
todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTodo();
});

window.toggleTodo = toggleTodo;
window.deleteTodo = deleteTodo;`,
    },
    files: [
      {
        name: 'index.html',
        type: 'html',
        content: '',
      },
      {
        name: 'style.css',
        type: 'css',
        content: '',
      },
      {
        name: 'script.js',
        type: 'javascript',
        content: '',
      },
    ],
    difficulty: 'beginner',
    features: ['로컬 스토리지', '체크박스', '삭제 기능'],
  },
];

// 파일 내용을 실제 HTML/CSS/JS로 채우기
baseTemplates.forEach(template => {
  template.files.forEach(file => {
    if (file.name === 'index.html') {
      file.content = template.preview.html;
    } else if (file.name === 'style.css') {
      file.content = template.preview.css;
    } else if (file.name === 'script.js' && template.preview.js) {
      file.content = template.preview.js;
    }
  });
});

// 강화된 템플릿 가져오기
import { enhancedTemplateVariations } from './enhanced-templates';
// 최신 트렌드 템플릿 가져오기
import { trendyTemplateVariations } from './trendy-templates';
// 추가 템플릿 가져오기
import { moreTemplateVariations } from './more-templates';

// 템플릿 생성 (각 기본 템플릿에서 여러 변형 생성)
export const websiteTemplates: WebsiteTemplate[] = [];

// 기본 템플릿 변형 생성
baseTemplates.forEach(template => {
  // 각 템플릿당 2000개 변형 생성
  const variations = generateTemplateVariations(template, 2000);
  websiteTemplates.push(...variations);
});

// 강화된 템플릿 추가
websiteTemplates.push(...enhancedTemplateVariations);

// 최신 트렌드 템플릿 추가
websiteTemplates.push(...trendyTemplateVariations);

// 추가 템플릿 추가
websiteTemplates.push(...moreTemplateVariations);

// 추가 카테고리별 템플릿 생성 함수
export function generateTemplatesByCategory(category: string, count: number): WebsiteTemplate[] {
  const categoryTemplates = websiteTemplates.filter(t => t.category === category);
  if (categoryTemplates.length >= count) {
    return categoryTemplates.slice(0, count);
  }
  
  // 부족하면 기본 템플릿에서 생성
  const base = baseTemplates.find(t => t.category === category);
  if (base) {
    return generateTemplateVariations(base, count);
  }
  return [];
}

// 전체 템플릿 개수 확인
console.log(`생성된 웹사이트 템플릿 개수: ${websiteTemplates.length}`);
