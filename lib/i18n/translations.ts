/**
 * 다국어 지원 (i18n)
 * 한국어, 영어, 일본어, 중국어
 */

export type Language = 'ko' | 'en' | 'ja' | 'zh';

export interface Translations {
  [key: string]: {
    [lang in Language]: string;
  };
}

export const translations: Translations = {
  'editor.title': {
    ko: '웹사이트 에디터',
    en: 'Website Editor',
    ja: 'ウェブサイトエディター',
    zh: '网站编辑器',
  },
  'editor.save': {
    ko: '저장',
    en: 'Save',
    ja: '保存',
    zh: '保存',
  },
  'editor.download': {
    ko: '다운로드',
    en: 'Download',
    ja: 'ダウンロード',
    zh: '下载',
  },
  'editor.preview': {
    ko: '미리보기',
    en: 'Preview',
    ja: 'プレビュー',
    zh: '预览',
  },
  'editor.code': {
    ko: '코드 편집',
    en: 'Code Edit',
    ja: 'コード編集',
    zh: '代码编辑',
  },
  'editor.visual': {
    ko: '시각적 편집',
    en: 'Visual Edit',
    ja: 'ビジュアル編集',
    zh: '可视化编辑',
  },
  'help.title': {
    ko: '도움말 & 가이드',
    en: 'Help & Guide',
    ja: 'ヘルプ & ガイド',
    zh: '帮助与指南',
  },
  'review.title': {
    ko: '프로젝트 총평',
    en: 'Project Review',
    ja: 'プロジェクトレビュー',
    zh: '项目总评',
  },
  'ai.recommend': {
    ko: 'AI 추천',
    en: 'AI Recommendations',
    ja: 'AI推奨',
    zh: 'AI推荐',
  },
  'feature.add': {
    ko: '기능 추가',
    en: 'Add Feature',
    ja: '機能追加',
    zh: '添加功能',
  },
};

export function getTranslation(key: string, lang: Language): string {
  return translations[key]?.[lang] || key;
}

export function setLanguage(lang: Language) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('language', lang);
    document.documentElement.lang = lang;
  }
}

export function getLanguage(): Language {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('language') as Language;
    if (saved && ['ko', 'en', 'ja', 'zh'].includes(saved)) {
      return saved;
    }
    // 브라우저 언어 감지
    const browserLang = navigator.language.split('-')[0];
    if (browserLang === 'en') return 'en';
    if (browserLang === 'ja') return 'ja';
    if (browserLang === 'zh') return 'zh';
  }
  return 'ko';
}
