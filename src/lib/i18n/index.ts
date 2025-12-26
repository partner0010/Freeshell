/**
 * 국제화 (i18n) 시스템
 * Internationalization System
 */

export type Locale = 'ko' | 'en' | 'ja' | 'zh' | 'es' | 'fr';

export interface Translations {
  [key: string]: string | Translations;
}

const translations: Record<Locale, Translations> = {
  ko: {
    common: {
      search: '검색',
      cancel: '취소',
      confirm: '확인',
      save: '저장',
      delete: '삭제',
      edit: '편집',
      close: '닫기',
      login: '로그인',
      logout: '로그아웃',
      home: '홈',
      back: '뒤로',
    },
    menu: {
      blocks: '블록',
      styles: '스타일',
      ai: 'AI',
      pages: '페이지',
      theme: '테마',
      editor: '에디터',
      creator: '콘텐츠 생성',
      agents: 'AI 에이전트',
      meetingNotes: '회의록',
      signature: '전자서명',
      remote: '원격 솔루션',
      trends: '최신 트렌드',
      community: '커뮤니티',
      help: '도움말',
      debugging: '디버깅',
      validation: '사이트 검증',
    },
    ai: {
      copilot: 'AI 코파일럿',
      design: 'AI 디자인',
      improve: 'AI 개선',
      shell: 'SHELL',
      assistant: 'AI 어시스턴트',
      chat: '채팅',
    },
    agents: {
      title: 'AI 에이전트',
      subtitle: '자동화된 AI 에이전트로 복잡한 작업을 자동으로 처리하세요',
      contentCreation: '콘텐츠 생성',
      agent: '에이전트',
      workflow: '워크플로우',
      schedule: '스케줄',
      history: '히스토리',
      selectContentType: '원하는 콘텐츠 타입을 선택하고 생성하세요',
      video: '영상 생성',
      image: '이미지 생성',
      text: '텍스트 생성',
      code: '코드 생성',
      audio: '음성 생성',
      music: '노래 생성',
      ebook: '전자책 생성',
      blog: '블로그 포스팅',
    },
  },
  en: {
    common: {
      search: 'Search',
      cancel: 'Cancel',
      confirm: 'Confirm',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      close: 'Close',
    },
    menu: {
      blocks: 'Blocks',
      styles: 'Styles',
      ai: 'AI',
      pages: 'Pages',
      theme: 'Theme',
      editor: 'Editor',
      creator: 'Content Creator',
      agents: 'AI Agents',
      meetingNotes: 'Meeting Notes',
      signature: 'E-Signature',
      remote: 'Remote Solution',
      trends: 'Trends',
      community: 'Community',
      help: 'Help',
      debugging: 'Debugging',
      validation: 'Site Validation',
    },
    ai: {
      copilot: 'AI Copilot',
      design: 'AI Design',
      improve: 'AI Improve',
    },
  },
  ja: {
    common: {
      search: '検索',
      cancel: 'キャンセル',
      confirm: '確認',
      save: '保存',
      delete: '削除',
      edit: '編集',
      close: '閉じる',
      login: 'ログイン',
      logout: 'ログアウト',
      home: 'ホーム',
      back: '戻る',
    },
    menu: {
      blocks: 'ブロック',
      styles: 'スタイル',
      ai: 'AI',
      pages: 'ページ',
      theme: 'テーマ',
      editor: 'エディター',
      creator: 'コンテンツ作成',
      agents: 'AIエージェント',
      signature: '電子署名',
      remote: 'リモートソリューション',
      trends: '最新トレンド',
      community: 'コミュニティ',
      help: 'ヘルプ',
      debugging: 'デバッグ',
      validation: 'サイト検証',
    },
    ai: {
      copilot: 'AIコパイロット',
      design: 'AIデザイン',
      improve: 'AI改善',
      shell: 'SHELL',
      assistant: 'AIアシスタント',
      chat: 'チャット',
    },
    agents: {
      title: 'AIエージェント',
      subtitle: '自動化されたAIエージェントで複雑なタスクを自動処理',
      contentCreation: 'コンテンツ作成',
      agent: 'エージェント',
      workflow: 'ワークフロー',
      schedule: 'スケジュール',
      history: '履歴',
      selectContentType: '希望するコンテンツタイプを選択して作成',
      video: '動画生成',
      image: '画像生成',
      text: 'テキスト生成',
      code: 'コード生成',
      audio: '音声生成',
      music: '音楽生成',
      ebook: '電子書籍生成',
      blog: 'ブログ投稿',
    },
  },
  zh: {
    common: {
      search: '搜索',
      cancel: '取消',
      confirm: '确认',
      save: '保存',
      delete: '删除',
      edit: '编辑',
      close: '关闭',
      login: '登录',
      logout: '登出',
      home: '首页',
      back: '返回',
    },
    menu: {
      blocks: '区块',
      styles: '样式',
      ai: 'AI',
      pages: '页面',
      theme: '主题',
      editor: '编辑器',
      creator: '内容创作',
      agents: 'AI代理',
      signature: '电子签名',
      remote: '远程解决方案',
      trends: '最新趋势',
      community: '社区',
      help: '帮助',
      debugging: '调试',
      validation: '网站验证',
    },
    ai: {
      copilot: 'AI副驾驶',
      design: 'AI设计',
      improve: 'AI改进',
      shell: 'SHELL',
      assistant: 'AI助手',
      chat: '聊天',
    },
    agents: {
      title: 'AI代理',
      subtitle: '使用自动化AI代理自动处理复杂任务',
      contentCreation: '内容创作',
      agent: '代理',
      workflow: '工作流',
      schedule: '日程',
      history: '历史',
      selectContentType: '选择您想要的内容类型并创建',
      video: '视频生成',
      image: '图像生成',
      text: '文本生成',
      code: '代码生成',
      audio: '音频生成',
      music: '音乐生成',
      ebook: '电子书生成',
      blog: '博客发布',
    },
  },
  es: {
    common: {
      search: 'Buscar',
      cancel: 'Cancelar',
      confirm: 'Confirmar',
      save: 'Guardar',
      delete: 'Eliminar',
      edit: 'Editar',
      close: 'Cerrar',
      login: 'Iniciar sesión',
      logout: 'Cerrar sesión',
      home: 'Inicio',
      back: 'Atrás',
    },
    menu: {
      blocks: 'Bloques',
      styles: 'Estilos',
      ai: 'AI',
      pages: 'Páginas',
      theme: 'Tema',
      editor: 'Editor',
      creator: 'Creación de contenido',
      agents: 'Agentes AI',
      signature: 'Firma electrónica',
      remote: 'Solución remota',
      trends: 'Tendencias',
      community: 'Comunidad',
      help: 'Ayuda',
      debugging: 'Depuración',
      validation: 'Validación del sitio',
    },
    ai: {
      copilot: 'Copiloto AI',
      design: 'Diseño AI',
      improve: 'Mejorar AI',
      shell: 'SHELL',
      assistant: 'Asistente AI',
      chat: 'Chat',
    },
    agents: {
      title: 'Agentes AI',
      subtitle: 'Procese automáticamente tareas complejas con agentes AI automatizados',
      contentCreation: 'Creación de contenido',
      agent: 'Agente',
      workflow: 'Flujo de trabajo',
      schedule: 'Programa',
      history: 'Historial',
      selectContentType: 'Seleccione el tipo de contenido que desea y créelo',
      video: 'Generación de video',
      image: 'Generación de imagen',
      text: 'Generación de texto',
      code: 'Generación de código',
      audio: 'Generación de audio',
      music: 'Generación de música',
      ebook: 'Generación de libro electrónico',
      blog: 'Publicación de blog',
    },
  },
  fr: {
    common: {
      search: 'Rechercher',
      cancel: 'Annuler',
      confirm: 'Confirmer',
      save: 'Enregistrer',
      delete: 'Supprimer',
      edit: 'Modifier',
      close: 'Fermer',
      login: 'Connexion',
      logout: 'Déconnexion',
      home: 'Accueil',
      back: 'Retour',
    },
    menu: {
      blocks: 'Blocs',
      styles: 'Styles',
      ai: 'AI',
      pages: 'Pages',
      theme: 'Thème',
      editor: 'Éditeur',
      creator: 'Création de contenu',
      agents: 'Agents AI',
      signature: 'Signature électronique',
      remote: 'Solution à distance',
      trends: 'Tendances',
      community: 'Communauté',
      help: 'Aide',
      debugging: 'Débogage',
      validation: 'Validation du site',
    },
    ai: {
      copilot: 'Copilote AI',
      design: 'Design AI',
      improve: 'Améliorer AI',
      shell: 'SHELL',
      assistant: 'Assistant AI',
      chat: 'Chat',
    },
    agents: {
      title: 'Agents AI',
      subtitle: 'Traitez automatiquement des tâches complexes avec des agents AI automatisés',
      contentCreation: 'Création de contenu',
      agent: 'Agent',
      workflow: 'Flux de travail',
      schedule: 'Calendrier',
      history: 'Historique',
      selectContentType: 'Sélectionnez le type de contenu souhaité et créez-le',
      video: 'Génération vidéo',
      image: 'Génération d\'image',
      text: 'Génération de texte',
      code: 'Génération de code',
      audio: 'Génération audio',
      music: 'Génération musicale',
      ebook: 'Génération de livre électronique',
      blog: 'Publication de blog',
    },
  },
};

class I18nManager {
  private currentLocale: Locale = 'ko';

  constructor() {
    if (typeof window !== 'undefined') {
      const savedLocale = localStorage.getItem('locale') as Locale;
      if (savedLocale && Object.keys(translations).includes(savedLocale)) {
        this.currentLocale = savedLocale;
      } else {
        // 브라우저 언어 감지
        const browserLang = navigator.language.split('-')[0] as Locale;
        if (Object.keys(translations).includes(browserLang)) {
          this.currentLocale = browserLang;
        }
      }
    }
  }

  setLocale(locale: Locale): void {
    this.currentLocale = locale;
    if (typeof window !== 'undefined') {
      localStorage.setItem('locale', locale);
      document.documentElement.lang = locale;
    }
  }

  getLocale(): Locale {
    return this.currentLocale;
  }

  t(key: string, params?: Record<string, string>): string {
    const keys = key.split('.');
    let value: unknown = translations[this.currentLocale];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in (value as Record<string, unknown>)) {
        value = (value as Record<string, unknown>)[k];
      } else {
        // Fallback to Korean
        value = translations.ko;
        for (const fallbackKey of keys) {
          if (value && typeof value === 'object' && fallbackKey in (value as Record<string, unknown>)) {
            value = (value as Record<string, unknown>)[fallbackKey];
          } else {
            return key;
          }
        }
      }
    }

    if (typeof value !== 'string') {
      return key;
    }

    // 파라미터 치환
    if (params) {
      return value.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
        return params[paramKey] || match;
      });
    }

    return value;
  }
}

export const i18n = new I18nManager();

