/**
 * 템플릿 확장 스크립트
 * 기본 템플릿을 바탕으로 다양한 변형 생성하여 50개 이상 확보
 */

// 기본 템플릿 구조를 바탕으로 변형 생성
export function expandTemplates() {
  const expandedTemplates: any[] = [];

  // 블로그 포스트 템플릿 (20개 목표 - 현재 3개)
  const blogVariations = [
    { title: '기술 제품 리뷰', tags: ['리뷰', '기술', '제품'] },
    { title: '하우투 가이드', tags: ['가이드', '하우투', '튜토리얼'] },
    { title: '뉴스 분석', tags: ['뉴스', '분석', '이슈'] },
    { title: '여행 후기', tags: ['여행', '후기', '추천'] },
    { title: '음식 리뷰', tags: ['음식', '맛집', '리뷰'] },
    { title: '책 리뷰', tags: ['책', '독서', '리뷰'] },
    { title: '영화 리뷰', tags: ['영화', '리뷰', '평점'] },
    { title: '게임 리뷰', tags: ['게임', '리뷰', '평가'] },
    { title: '비즈니스 인사이트', tags: ['비즈니스', '경영', '인사이트'] },
    { title: '건강 정보', tags: ['건강', '웰니스', '팁'] },
    { title: '패션 스타일', tags: ['패션', '스타일', '코디'] },
    { title: '인테리어 디자인', tags: ['인테리어', '디자인', '리모델링'] },
    { title: '투자 정보', tags: ['투자', '주식', '재테크'] },
    { title: '학습 방법', tags: ['학습', '공부법', '교육'] },
    { title: '취미 생활', tags: ['취미', '라이프스타일', '여가'] },
    { title: '경제 분석', tags: ['경제', '시장', '분석'] },
    { title: '사회 이슈', tags: ['사회', '이슈', '논의'] },
    { title: '문화 콘텐츠', tags: ['문화', '콘텐츠', '트렌드'] },
    { title: '기술 트렌드', tags: ['기술', 'IT', '트렌드'] },
    { title: '라이프스타일', tags: ['라이프스타일', '일상', '생활'] },
  ];

  blogVariations.forEach((variation, index) => {
    if (index >= 3) { // 이미 3개는 있으므로 나머지만 추가
      expandedTemplates.push({
        id: `blog-${variation.title.toLowerCase().replace(/\s+/g, '-')}-${String(index + 1).padStart(3, '0')}`,
        title: `${variation.title} 블로그 템플릿`,
        category: 'blog',
        contentType: 'blog-post',
        platform: '네이버 블로그, 티스토리',
        description: `${variation.title} 관련 블로그 포스트를 작성하는 템플릿`,
        example: `제목: [${variation.title}] 주제 - 매력적인 제목

## 📌 개요
이 포스트에서는 [주제]에 대해 다뤄보겠습니다.

## ✨ 주요 내용
- [내용 1]
- [내용 2]
- [내용 3]

## 💡 상세 설명
[상세한 설명 내용]

## 🎯 결론
[결론 및 요약]

## 📌 마무리
이 내용이 도움이 되셨다면 좋아요와 댓글 부탁드립니다!`,
        structure: {
          sections: ['개요', '주요 내용', '상세 설명', '결론', '마무리'],
          tips: [
            '독자의 관점에서 작성하세요',
            '실용적인 정보를 제공하세요',
            '이미지나 예시를 활용하세요',
            'SEO를 고려한 키워드를 자연스럽게 포함하세요'
          ],
          length: {
            min: 1000,
            max: 3000,
            recommended: 2000
          }
        },
        tags: variation.tags,
        isPremium: index >= 15,
        createdAt: new Date(2024, 0, 1 + index)
      });
    }
  });

  // 유튜브 스크립트 템플릿 (15개 목표 - 현재 1개)
  const youtubeVariations = [
    { name: '제품 리뷰', duration: 5 },
    { name: '튜토리얼', duration: 10 },
    { name: '브이로그', duration: 5 },
    { name: '교육 영상', duration: 8 },
    { name: '음식 레시피', duration: 5 },
    { name: '게임 플레이', duration: 10 },
    { name: '운동 가이드', duration: 8 },
    { name: '여행 브이로그', duration: 5 },
    { name: '뷰티 팁', duration: 5 },
    { name: '라이프 해킹', duration: 5 },
    { name: '인터뷰', duration: 10 },
    { name: '시연 영상', duration: 5 },
    { name: '비교 영상', duration: 8 },
    { name: '챌린지', duration: 3 },
    { name: '하이라이트', duration: 5 },
  ];

  youtubeVariations.forEach((variation, index) => {
    if (index >= 1) { // 이미 1개는 있으므로 나머지만 추가
      expandedTemplates.push({
        id: `youtube-${variation.name.toLowerCase().replace(/\s+/g, '-')}-${String(index + 1).padStart(3, '0')}`,
        title: `${variation.name} 유튜브 스크립트 (${variation.duration}분)`,
        category: 'youtube',
        contentType: 'youtube-script',
        platform: '유튜브',
        description: `${variation.name} 영상을 위한 ${variation.duration}분 스크립트 템플릿`,
        example: `[0:00-0:10] 인트로
안녕하세요! 오늘은 [주제]에 대해 알아보겠습니다.

[0:10-${variation.duration * 60 - 30}] 본문
[주요 내용 설명]

[${variation.duration * 60 - 30}-${variation.duration * 60}] 아웃트로
영상이 도움이 되셨다면 좋아요와 구독 부탁드립니다!`,
        structure: {
          sections: ['인트로', '본문', '아웃트로'],
          tips: [
            `${variation.duration}분 이내로 구성하세요`,
            '시각적 자료를 활용하세요',
            '자연스러운 말투로 작성하세요',
            '핵심 정보는 처음 30초에 집중하세요'
          ],
          length: {
            min: variation.duration * 100,
            max: variation.duration * 200,
            recommended: variation.duration * 150
          }
        },
        tags: ['유튜브', variation.name.toLowerCase(), '스크립트', '영상'],
        isPremium: index >= 10,
        createdAt: new Date(2024, 0, 1 + index)
      });
    }
  });

  // SNS 게시물 템플릿 (10개 목표 - 현재 1개)
  const snsVariations = [
    { name: '제품 홍보', platform: '페이스북, 링크드인' },
    { name: '이벤트 안내', platform: '페이스북, 트위터' },
    { name: '팁/노하우', platform: '페이스북, 링크드인' },
    { name: '질문형', platform: '페이스북, 트위터' },
    { name: '인용글', platform: '페이스북, 링크드인' },
    { name: '통계 공유', platform: '링크드인' },
    { name: '성공 스토리', platform: '링크드인, 페이스북' },
    { name: '회사 소식', platform: '링크드인' },
    { name: '고객 후기', platform: '페이스북' },
    { name: '프로모션', platform: '페이스북, 트위터' },
  ];

  snsVariations.forEach((variation, index) => {
    if (index >= 1) { // 이미 1개는 있으므로 나머지만 추가
      expandedTemplates.push({
        id: `sns-${variation.name.toLowerCase().replace(/\s+/g, '-')}-${String(index + 1).padStart(3, '0')}`,
        title: `${variation.name} SNS 게시물`,
        category: 'sns',
        contentType: 'sns-post',
        platform: variation.platform,
        description: `${variation.name}를 위한 SNS 게시물 템플릿`,
        example: `🚀 [강력한 헤드라인]

[핵심 메시지]

✨ 주요 포인트:
✓ [포인트 1]
✓ [포인트 2]
✓ [포인트 3]

👉 [행동 유도 문구]

#해시태그 #관련키워드`,
        structure: {
          sections: ['헤드라인', '핵심 메시지', '주요 포인트', '행동 유도', '해시태그'],
          tips: [
            '첫 문장이 중요합니다',
            '불릿 포인트로 가독성 향상',
            '명확한 CTA 포함',
            '3-5개 해시태그 사용'
          ],
          length: {
            min: 200,
            max: 500,
            recommended: 300
          }
        },
        tags: ['SNS', variation.name.toLowerCase(), '마케팅', '게시물'],
        isPremium: index >= 7,
        createdAt: new Date(2024, 0, 1 + index)
      });
    }
  });

  // 인스타그램 캡션 템플릿 (5개 목표 - 현재 1개)
  const instagramVariations = [
    { name: '일상 공유', tags: ['일상', '데일리', '공유'] },
    { name: '제품 소개', tags: ['제품', '소개', '홍보'] },
    { name: '여행 사진', tags: ['여행', '사진', '추억'] },
    { name: '음식 사진', tags: ['음식', '맛집', '요리'] },
    { name: '영감 주는 글', tags: ['영감', '동기부여', '명언'] },
  ];

  instagramVariations.forEach((variation, index) => {
    if (index >= 1) { // 이미 1개는 있으므로 나머지만 추가
      expandedTemplates.push({
        id: `instagram-${variation.name.toLowerCase().replace(/\s+/g, '-')}-${String(index + 1).padStart(3, '0')}`,
        title: `${variation.name} 인스타그램 캡션`,
        category: 'instagram',
        contentType: 'instagram-caption',
        platform: '인스타그램',
        description: `${variation.name}용 인스타그램 캡션 템플릿`,
        example: `[짧은 메시지] ✨

[간단한 설명]

#${variation.tags[0]} #${variation.tags[1]} #${variation.tags[2]}`,
        structure: {
          sections: ['짧은 메시지', '간단한 설명', '해시태그'],
          tips: [
            '짧고 간결하게',
            '감정을 담아서',
            '적절한 이모지 활용',
            '해시태그는 최소화'
          ],
          length: {
            min: 50,
            max: 200,
            recommended: 100
          }
        },
        tags: ['인스타그램', ...variation.tags],
        isPremium: index >= 3,
        createdAt: new Date(2024, 0, 1 + index)
      });
    }
  });

  return expandedTemplates;
}

