/**
 * AI 콘텐츠 제작 가이드 데이터
 * 각 콘텐츠 유형별 무료 AI 도구 및 단계별 가이드
 */

export interface ContentGuide {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'video' | 'image' | 'text' | 'audio' | 'ebook';
  difficulty: 'easy' | 'medium' | 'hard';
  timeRequired: string;
  tools: Array<{
    name: string;
    url: string;
    freeTier: boolean;
    description: string;
  }>;
  steps: Array<{
    stepNumber: number;
    title: string;
    description: string;
    details: string[];
    tips?: string[];
  }>;
  resources: Array<{
    title: string;
    url: string;
    type: 'tutorial' | 'tool' | 'example' | 'community';
  }>;
}

export const contentGuides: ContentGuide[] = [
  {
    id: 'youtube-video',
    title: 'YouTube 영상 제작',
    description: 'AI를 활용하여 YouTube 영상을 기획, 제작, 편집하는 완전 가이드',
    icon: '🎥',
    category: 'video',
    difficulty: 'medium',
    timeRequired: '2-3시간',
    tools: [
      {
        name: 'ChatGPT (Google Gemini)',
        url: 'https://chat.openai.com/',
        freeTier: true,
        description: '스크립트 작성, 아이디어 기획, 제목 생성',
      },
      {
        name: 'Lumen5',
        url: 'https://lumen5.com/',
        freeTier: true,
        description: '텍스트를 자동으로 비디오로 변환',
      },
      {
        name: 'Canva',
        url: 'https://www.canva.com/',
        freeTier: true,
        description: '썸네일 및 간단한 영상 편집',
      },
      {
        name: 'CapCut',
        url: 'https://www.capcut.com/',
        freeTier: true,
        description: '무료 영상 편집 도구 (모바일/PC)',
      },
    ],
    steps: [
      {
        stepNumber: 1,
        title: '주제 및 아이디어 선정',
        description: 'AI를 활용하여 영상 주제와 아이디어를 생성합니다',
        details: [
          'ChatGPT 또는 Google Gemini에 "YouTube 영상 아이디어 10개 생성해줘" 요청',
          '특정 주제에 대해 검색량이 높은 키워드 분석',
          '경쟁 채널 분석 및 차별화 포인트 도출',
        ],
        tips: [
          '트렌딩 키워드를 활용하면 조회수 증가 가능',
          '자신의 전문 분야와 관심사 중심으로 선택',
        ],
      },
      {
        stepNumber: 2,
        title: '스크립트 작성',
        description: 'AI를 활용하여 영상 스크립트를 작성합니다',
        details: [
          '선정한 주제를 ChatGPT/Gemini에 입력: "다음 주제로 5분 YouTube 영상 스크립트 작성해줘: [주제]"',
          '구성 요청: "도입부, 본문, 마무리로 구성해줘"',
          '톤앤매너 지정: "캐주얼하게", "전문적으로" 등',
          '스크립트 검토 및 수정',
        ],
        tips: [
          '도입부는 15초 이내로 핵심 내용을 전달',
          '본문은 3-5개 섹션으로 나누어 구성',
          '마무리는 시청자 참여 유도 (좋아요, 구독, 댓글)',
        ],
      },
      {
        stepNumber: 3,
        title: '썸네일 및 제목 생성',
        description: '클릭률을 높이는 썸네일과 제목을 생성합니다',
        details: [
          'AI에 "이 스크립트의 매력적인 제목 10개 생성해줘" 요청',
          '키워드 포함 여부 확인',
          'Canva에서 썸네일 템플릿 활용',
          '명확하고 읽기 쉬운 텍스트 배치',
        ],
        tips: [
          '제목은 50자 이내로 간결하게',
          '숫자나 질문형 제목이 클릭률 높음',
          '썸네일은 모바일에서도 잘 보이도록',
        ],
      },
      {
        stepNumber: 4,
        title: '영상 제작',
        description: '스크립트를 바탕으로 영상을 제작합니다',
        details: [
          'Lumen5: 텍스트 입력 → 자동 영상 생성 (무료 3개)',
          'CapCut: 수동 편집이 필요한 경우',
          'Canva: 간단한 텍스트 오버레이 및 그래픽 추가',
        ],
        tips: [
          '무료 도구는 제한이 있으니 프로젝트별로 선택',
          '일관된 스타일 유지',
        ],
      },
      {
        stepNumber: 5,
        title: '최종 편집 및 업로드',
        description: '영상을 최종 편집하고 YouTube에 업로드합니다',
        details: [
          '자막 추가 (YouTube 자동 생성 활용 가능)',
          '배경 음악 추가 (무료 음원 사이트 활용)',
          '태그 및 설명 작성 (AI로 키워드 추천 받기)',
          '업로드 및 공개 설정',
        ],
        tips: [
          '첫 24시간이 중요하니 최적 시간대에 업로드',
          '댓글에 적극적으로 응답',
        ],
      },
    ],
    resources: [
      {
        title: 'Lumen5 사용법 가이드',
        url: 'https://lumen5.com/learn/',
        type: 'tutorial',
      },
      {
        title: 'YouTube Creator Academy',
        url: 'https://creatoracademy.youtube.com/',
        type: 'tutorial',
      },
      {
        title: '무료 음원 사이트 - Pixabay',
        url: 'https://pixabay.com/music/',
        type: 'tool',
      },
    ],
  },
  {
    id: 'shorts',
    title: 'YouTube 숏츠 제작',
    description: '60초 이내의 숏폼 콘텐츠를 AI로 빠르게 제작',
    icon: '⚡',
    category: 'video',
    difficulty: 'easy',
    timeRequired: '30분-1시간',
    tools: [
      {
        name: 'ChatGPT (Google Gemini)',
        url: 'https://chat.openai.com/',
        freeTier: true,
        description: '숏츠 스크립트 및 아이디어 생성',
      },
      {
        name: 'CapCut',
        url: 'https://www.capcut.com/',
        freeTier: true,
        description: '숏츠 전용 편집 기능 제공',
      },
      {
        name: 'Canva',
        url: 'https://www.canva.com/',
        freeTier: true,
        description: '숏츠 템플릿 및 그래픽',
      },
    ],
    steps: [
      {
        stepNumber: 1,
        title: '아이디어 및 스크립트',
        description: '숏츠용 초단기 콘텐츠 기획',
        details: [
          'AI에 "바이럴할 만한 숏츠 아이디어 10개" 요청',
          '15-30초 스크립트 작성 (핵심만 전달)',
          '훅(Hook) 강조: 처음 3초가 중요',
        ],
      },
      {
        stepNumber: 2,
        title: '영상 촬영/제작',
        description: '짧고 강렬한 영상 제작',
        details: [
          '스마트폰으로 촬영 (세로 9:16 비율)',
          '조명과 소리 확인',
          '여러 각도로 촬영하여 선택',
        ],
      },
      {
        stepNumber: 3,
        title: '편집',
        description: 'CapCut으로 빠른 편집',
        details: [
          'CapCut 숏츠 템플릿 활용',
          '자동 자막 생성',
          '이펙트 및 전환 효과 추가',
          '리듬에 맞춘 편집',
        ],
      },
      {
        stepNumber: 4,
        title: '제목 및 해시태그',
        description: '검색 최적화',
        details: [
          'AI로 매력적인 제목 생성',
          '관련 해시태그 3-5개 추가',
          '썸네일은 자동 생성되는 프레임 활용',
        ],
      },
    ],
    resources: [
      {
        title: 'CapCut 숏츠 가이드',
        url: 'https://www.capcut.com/learn',
        type: 'tutorial',
      },
    ],
  },
  {
    id: 'image-generation',
    title: 'AI 이미지 생성',
    description: '텍스트 프롬프트만으로 고품질 이미지 생성',
    icon: '🖼️',
    category: 'image',
    difficulty: 'easy',
    timeRequired: '10-30분',
    tools: [
      {
        name: 'Stable Diffusion (Hugging Face)',
        url: 'https://huggingface.co/spaces/stabilityai/stable-diffusion',
        freeTier: true,
        description: '완전 무료 오픈소스 이미지 생성',
      },
      {
        name: 'Leonardo.ai',
        url: 'https://leonardo.ai/',
        freeTier: true,
        description: '일일 150개 무료 생성',
      },
      {
        name: 'Bing Image Creator (DALL-E 3)',
        url: 'https://www.bing.com/images/create',
        freeTier: true,
        description: 'Microsoft 계정으로 무료 사용',
      },
      {
        name: 'Google Gemini (이미지 생성)',
        url: 'https://aistudio.google.com/',
        freeTier: true,
        description: 'Google 계정으로 무료 사용',
      },
    ],
    steps: [
      {
        stepNumber: 1,
        title: '도구 선택 및 가입',
        description: '무료 이미지 생성 도구 선택',
        details: [
          'Bing Image Creator: 가장 쉬움 (Microsoft 계정)',
          'Leonardo.ai: 고품질, 일일 제한 있음',
          'Stable Diffusion: 완전 무료, 기술적 지식 필요',
        ],
      },
      {
        stepNumber: 2,
        title: '프롬프트 작성',
        description: '원하는 이미지를 묘사하는 텍스트 작성',
        details: [
          '주체(Subject): "고양이", "풍경" 등',
          '스타일(Style): "사진처럼", "수채화", "디지털 아트"',
          '분위기(Mood): "밝은", "어두운", "따뜻한"',
          '세부사항(Details): "고해상도", "선명한", "자연스러운"',
        ],
        tips: [
          '예시: "고양이가 정원에서 놀고 있는 사진, 자연스러운 조명, 고해상도"',
          '부정 프롬프트 사용: "blurry, low quality"',
        ],
      },
      {
        stepNumber: 3,
        title: '이미지 생성',
        description: '프롬프트 입력 후 이미지 생성',
        details: [
          '프롬프트 입력',
          '생성 버튼 클릭 (30초-2분 소요)',
          '여러 변형 생성하여 선택',
        ],
      },
      {
        stepNumber: 4,
        title: '후처리 및 다운로드',
        description: '이미지 다운로드 및 필요시 편집',
        details: [
          '마음에 드는 이미지 선택',
          '고해상도 버전 다운로드',
          'Canva에서 필요시 편집 (크기 조정, 텍스트 추가)',
        ],
      },
    ],
    resources: [
      {
        title: 'Bing Image Creator',
        url: 'https://www.bing.com/images/create',
        type: 'tool',
      },
      {
        title: 'Leonardo.ai',
        url: 'https://leonardo.ai/',
        type: 'tool',
      },
      {
        title: '프롬프트 작성 가이드',
        url: 'https://prompthero.com/',
        type: 'tutorial',
      },
    ],
  },
  {
    id: 'sns-post',
    title: 'SNS 글 작성',
    description: '인스타그램, 페이스북, 트위터용 게시물 자동 생성',
    icon: '📱',
    category: 'text',
    difficulty: 'easy',
    timeRequired: '10-20분',
    tools: [
      {
        name: 'ChatGPT (Google Gemini)',
        url: 'https://chat.openai.com/',
        freeTier: true,
        description: 'SNS 게시물 텍스트 생성',
      },
      {
        name: 'Canva',
        url: 'https://www.canva.com/',
        freeTier: true,
        description: 'SNS 포스트 디자인',
      },
    ],
    steps: [
      {
        stepNumber: 1,
        title: '콘텐츠 주제 결정',
        description: '게시할 내용의 주제 선정',
        details: [
          '제품 소개, 일상 공유, 팁 공유 등',
          '타겟 오디언스 고려',
        ],
      },
      {
        stepNumber: 2,
        title: 'AI로 게시물 작성',
        description: 'ChatGPT/Gemini로 게시물 생성',
        details: [
          '프롬프트: "인스타그램 게시물 작성해줘. 주제: [주제], 톤: [캐주얼/전문적]"',
          '해시태그 요청: "관련 해시태그 10개 추천해줘"',
          '여러 버전 생성하여 선택',
        ],
        tips: [
          '플랫폼별 특성 고려 (인스타: 해시태그 중요, 트위터: 짧게)',
          '감정적 톤 사용 시 공감도 증가',
        ],
      },
      {
        stepNumber: 3,
        title: '이미지/디자인 추가',
        description: 'Canva로 시각적 요소 추가',
        details: [
          'Canva SNS 템플릿 선택',
          '텍스트 추가 및 스타일링',
          '이미지 추가 (무료 스톡 사진 활용)',
          '브랜드 색상 및 폰트 통일',
        ],
      },
      {
        stepNumber: 4,
        title: '최종 검토 및 업로드',
        description: '게시물 최종 확인 후 업로드',
        details: [
          '오타 및 문법 확인',
          '해시태그 확인',
          '업로드 시간 최적화 (타겟 오디언스 활동 시간)',
        ],
      },
    ],
    resources: [
      {
        title: 'Canva SNS 템플릿',
        url: 'https://www.canva.com/templates/',
        type: 'tool',
      },
    ],
  },
  {
    id: 'blog-post',
    title: '블로그 포스팅 (네이버 등)',
    description: 'SEO 최적화된 블로그 포스팅 자동 작성',
    icon: '📝',
    category: 'text',
    difficulty: 'medium',
    timeRequired: '1-2시간',
    tools: [
      {
        name: 'ChatGPT (Google Gemini)',
        url: 'https://chat.openai.com/',
        freeTier: true,
        description: '블로그 포스팅 작성',
      },
      {
        name: '네이버 블로그',
        url: 'https://blog.naver.com/',
        freeTier: true,
        description: '블로그 플랫폼',
      },
      {
        name: 'Canva',
        url: 'https://www.canva.com/',
        freeTier: true,
        description: '블로그 이미지 제작',
      },
    ],
    steps: [
      {
        stepNumber: 1,
        title: '키워드 조사 및 주제 선정',
        description: '검색량이 높은 키워드 기반 주제 선정',
        details: [
          '네이버 데이터랩에서 키워드 검색량 확인',
          '경쟁 글 분석',
          'AI에 "이 키워드로 블로그 글 아이디어 5개" 요청',
        ],
      },
      {
        stepNumber: 2,
        title: '목차 및 구조 작성',
        description: '글의 구조를 먼저 설계',
        details: [
          'AI에 "이 주제로 블로그 글 목차 작성해줘" 요청',
          'H2, H3 제목 구조 확인',
          '각 섹션별 분량 계획',
        ],
      },
      {
        stepNumber: 3,
        title: '본문 작성',
        description: '섹션별로 내용 작성',
        details: [
          '각 섹션별로 AI에 요청: "이 제목으로 500자 분량 글 작성"',
          '키워드를 자연스럽게 포함',
          '독자 질문 답변 형식 활용',
        ],
        tips: [
          '너무 길면 분할해서 요청',
          '실제 경험과 데이터 포함 시 신뢰도 증가',
        ],
      },
      {
        stepNumber: 4,
        title: '이미지 추가',
        description: '글의 가독성을 높이는 이미지 추가',
        details: [
          '섹션별 대표 이미지 1-2개',
          'Canva로 인포그래픽 제작',
          '무료 스톡 사진 활용 (Pexels, Unsplash)',
        ],
      },
      {
        stepNumber: 5,
        title: '최적화 및 발행',
        description: 'SEO 최적화 후 발행',
        details: [
          '제목에 키워드 포함 (30자 이내)',
          '메타 설명 작성 (150자 이내)',
          '태그 추가',
          '내부/외부 링크 추가',
          '최종 교정 후 발행',
        ],
      },
    ],
    resources: [
      {
        title: '네이버 데이터랩',
        url: 'https://datalab.naver.com/',
        type: 'tool',
      },
      {
        title: '네이버 블로그',
        url: 'https://blog.naver.com/',
        type: 'tool',
      },
    ],
  },
  {
    id: 'ebook',
    title: '전자책 제작',
    description: 'AI를 활용한 전자책 기획, 작성, 디자인까지',
    icon: '📚',
    category: 'ebook',
    difficulty: 'hard',
    timeRequired: '1주-1개월',
    tools: [
      {
        name: 'ChatGPT (Google Gemini)',
        url: 'https://chat.openai.com/',
        freeTier: true,
        description: '책 내용 작성',
      },
      {
        name: 'Google Docs',
        url: 'https://docs.google.com/',
        freeTier: true,
        description: '원고 작성 및 편집',
      },
      {
        name: 'Canva',
        url: 'https://www.canva.com/',
        freeTier: true,
        description: '책 표지 및 디자인',
      },
      {
        name: 'Google Play Books',
        url: 'https://play.google.com/books/publish',
        freeTier: true,
        description: '무료 전자책 출판',
      },
    ],
    steps: [
      {
        stepNumber: 1,
        title: '기획 및 목차 작성',
        description: '책의 주제와 구조 설계',
        details: [
          '주제 선정 및 타겟 독자 정의',
          'AI에 "이 주제로 책 목차 작성해줘" 요청',
          '챕터별 주요 내용 정리',
          '예상 분량 계획 (보통 2-5만자)',
        ],
      },
      {
        stepNumber: 2,
        title: '챕터별 원고 작성',
        description: '각 챕터를 순차적으로 작성',
        details: [
          '챕터별로 AI에 요청: "이 주제로 2000자 분량 작성"',
          'Google Docs에 저장하며 진행',
          '일관성 유지 (톤, 스타일)',
          '사례와 예시 포함',
        ],
        tips: [
          '하루에 1-2챕터씩 작성 (과로 방지)',
          '중간에 검토하며 수정',
        ],
      },
      {
        stepNumber: 3,
        title: '편집 및 교정',
        description: '원고 다듬기',
        details: [
          '전체 흐름 확인',
          '반복되는 표현 수정',
          '오타 및 문법 검사',
          '가독성 개선',
        ],
      },
      {
        stepNumber: 4,
        title: '표지 및 디자인',
        description: '전자책 표지 제작',
        details: [
          'Canva 전자책 표지 템플릿 활용',
          '제목, 부제목, 저자명 배치',
          '시각적 임팩트 고려',
        ],
      },
      {
        stepNumber: 5,
        title: '포맷 변환 및 출판',
        description: '최종 파일 변환 후 출판',
        details: [
          'PDF 또는 EPUB 형식으로 변환',
          'Google Play Books에 업로드',
          '또는 Amazon KDP (유료)',
          '출판 정보 입력 (제목, 설명, 가격)',
        ],
      },
    ],
    resources: [
      {
        title: 'Google Play Books 출판 가이드',
        url: 'https://support.google.com/books/answer/6284584',
        type: 'tutorial',
      },
      {
        title: 'Canva 전자책 템플릿',
        url: 'https://www.canva.com/templates/EAE-xxx/',
        type: 'tool',
      },
    ],
  },
  {
    id: 'music',
    title: 'AI 음악 생성',
    description: 'AI로 배경 음악, 효과음, 노래 제작',
    icon: '🎵',
    category: 'audio',
    difficulty: 'medium',
    timeRequired: '30분-1시간',
    tools: [
      {
        name: 'Suno AI',
        url: 'https://suno.ai/',
        freeTier: true,
        description: '노래 생성 (일일 50곡 무료)',
      },
      {
        name: 'Udio',
        url: 'https://www.udio.com/',
        freeTier: true,
        description: '음악 생성 (일일 제한 있음)',
      },
      {
        name: 'Mubert',
        url: 'https://mubert.com/',
        freeTier: true,
        description: '배경 음악 생성',
      },
      {
        name: 'Pixabay Music',
        url: 'https://pixabay.com/music/',
        freeTier: true,
        description: '무료 음원 라이브러리',
      },
    ],
    steps: [
      {
        stepNumber: 1,
        title: '음악 스타일 결정',
        description: '원하는 장르 및 분위기 선정',
        details: [
          '장르: 팝, 록, 일렉트로닉, 재즈 등',
          '분위기: 밝은, 어두운, 에너지 넘치는 등',
          '용도: 배경 음악, 효과음, 노래 등',
        ],
      },
      {
        stepNumber: 2,
        title: '가사 작성 (노래인 경우)',
        description: 'AI로 가사 생성',
        details: [
          'ChatGPT/Gemini에 "이 주제로 가사 작성해줘" 요청',
          '후렴구 강조',
          '라임과 리듬 고려',
        ],
      },
      {
        stepNumber: 3,
        title: 'AI 음악 생성',
        description: 'Suno AI 또는 Udio로 음악 생성',
        details: [
          'Suno AI: 가사 입력 → 스타일 선택 → 생성',
          'Udio: 프롬프트 입력 (예: "upbeat pop song")',
          '생성 시간: 1-2분',
          '여러 버전 생성하여 선택',
        ],
        tips: [
          '프롬프트에 장르, BPM, 악기 포함',
          '예: "energetic electronic dance music, 128 BPM, synthesizer"',
        ],
      },
      {
        stepNumber: 4,
        title: '편집 및 다운로드',
        description: '음악 편집 및 최종 다운로드',
        details: [
          '필요시 Audacity (무료)로 편집',
          '볼륨 조절, 페이드 인/아웃',
          '최종 파일 다운로드 (MP3, WAV)',
        ],
      },
    ],
    resources: [
      {
        title: 'Suno AI',
        url: 'https://suno.ai/',
        type: 'tool',
      },
      {
        title: 'Udio',
        url: 'https://www.udio.com/',
        type: 'tool',
      },
      {
        title: 'Audacity (무료 오디오 편집)',
        url: 'https://www.audacityteam.org/',
        type: 'tool',
      },
    ],
  },
];

export const getGuideById = (id: string): ContentGuide | undefined => {
  return contentGuides.find((guide) => guide.id === id);
};

export const getGuidesByCategory = (category: ContentGuide['category']): ContentGuide[] => {
  return contentGuides.filter((guide) => guide.category === category);
};

