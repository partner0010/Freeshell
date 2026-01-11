/**
 * 템플릿 자동 생성 스크립트
 * 기본 템플릿 구조를 바탕으로 다양한 템플릿 생성
 * 
 * 사용법: npx ts-node scripts/generate-templates.ts
 */

import type { ContentTemplate } from '@/lib/models/ContentTemplate';

// 기본 템플릿 변형 생성기
function generateTemplateVariations(): ContentTemplate[] {
  const templates: ContentTemplate[] = [];
  
  // 블로그 템플릿 카테고리별 변형
  const blogCategories = [
    { name: '기술 제품 리뷰', keywords: ['리뷰', '기술', '제품', '구매후기'] },
    { name: '하우투 가이드', keywords: ['가이드', '하우투', '튜토리얼', '교육'] },
    { name: '뉴스 분석', keywords: ['뉴스', '분석', '이슈', '시사'] },
    { name: '여행 후기', keywords: ['여행', '후기', '추천', '일정'] },
    { name: '음식 리뷰', keywords: ['음식', '맛집', '리뷰', '추천'] },
    { name: '책 리뷰', keywords: ['책', '독서', '리뷰', '추천'] },
    { name: '영화 리뷰', keywords: ['영화', '리뷰', '평점', '추천'] },
    { name: '게임 리뷰', keywords: ['게임', '리뷰', '평가', '추천'] },
    { name: '비즈니스 인사이트', keywords: ['비즈니스', '경영', '인사이트', '전략'] },
    { name: '건강 정보', keywords: ['건강', '웰니스', '팁', '정보'] },
    { name: '패션 스타일', keywords: ['패션', '스타일', '코디', '트렌드'] },
    { name: '인테리어 디자인', keywords: ['인테리어', '디자인', '리모델링', '꾸미기'] },
    { name: '투자 정보', keywords: ['투자', '주식', '부동산', '재테크'] },
    { name: '학습 방법', keywords: ['학습', '공부법', '교육', '팁'] },
    { name: '취미 생활', keywords: ['취미', '라이프스타일', '여가', '활동'] },
    { name: '경제 분석', keywords: ['경제', '시장', '분석', '전망'] },
    { name: '사회 이슈', keywords: ['사회', '이슈', '논의', '의견'] },
    { name: '문화 콘텐츠', keywords: ['문화', '콘텐츠', '트렌드', '소식'] },
    { name: '기술 트렌드', keywords: ['기술', 'IT', '트렌드', '혁신'] },
    { name: '라이프스타일', keywords: ['라이프스타일', '일상', '생활', '팁'] },
  ];

  // 블로그 템플릿 생성
  blogCategories.forEach((category, index) => {
    templates.push({
      id: `blog-${category.name.toLowerCase().replace(/\s+/g, '-')}-${String(index + 1).padStart(3, '0')}`,
      title: `${category.name} 블로그 템플릿`,
      category: 'blog',
      contentType: 'blog-post',
      platform: '네이버 블로그, 티스토리, 브런치',
      description: `${category.name} 관련 블로그 포스트를 작성하는 템플릿`,
      example: `제목: [${category.name}] 주제 - 매력적인 제목

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
      tags: category.keywords,
      isPremium: index >= 15, // 나중에 추가된 것들은 프리미엄
      createdAt: new Date(2024, 0, 1 + index)
    });
  });

  // 유튜브 스크립트 템플릿 (15개)
  const youtubeCategories = [
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

  youtubeCategories.forEach((category, index) => {
    templates.push({
      id: `youtube-${category.name.toLowerCase().replace(/\s+/g, '-')}-${String(index + 1).padStart(3, '0')}`,
      title: `${category.name} 유튜브 스크립트 (${category.duration}분)`,
      category: 'youtube',
      contentType: 'youtube-script',
      platform: '유튜브',
      description: `${category.name} 영상을 위한 ${category.duration}분 스크립트 템플릿`,
      example: `[0:00-0:10] 인트로
안녕하세요! 오늘은 [주제]에 대해 알아보겠습니다.

[0:10-${category.duration * 60 - 30}] 본문
[주요 내용 설명]

[${category.duration * 60 - 30}-${category.duration * 60}] 아웃트로
영상이 도움이 되셨다면 좋아요와 구독 부탁드립니다!`,
      structure: {
        sections: ['인트로', '본문', '아웃트로'],
        tips: [
          `${category.duration}분 이내로 구성하세요`,
          '시각적 자료를 활용하세요',
          '자연스러운 말투로 작성하세요',
          '핵심 정보는 처음 30초에 집중하세요'
        ],
        length: {
          min: category.duration * 100,
          max: category.duration * 200,
          recommended: category.duration * 150
        }
      },
      tags: ['유튜브', category.name.toLowerCase(), '스크립트', '영상'],
      isPremium: index >= 10,
      createdAt: new Date(2024, 0, 1 + index)
    });
  });

  // SNS 게시물 템플릿 (10개)
  const snsCategories = [
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

  snsCategories.forEach((category, index) => {
    templates.push({
      id: `sns-${category.name.toLowerCase().replace(/\s+/g, '-')}-${String(index + 1).padStart(3, '0')}`,
      title: `${category.name} SNS 게시물`,
      category: 'sns',
      contentType: 'sns-post',
      platform: category.platform,
      description: `${category.name}를 위한 SNS 게시물 템플릿`,
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
      tags: ['SNS', category.name.toLowerCase(), '마케팅', '게시물'],
      isPremium: index >= 7,
      createdAt: new Date(2024, 0, 1 + index)
    });
  });

  // 인스타그램 캡션 템플릿 (5개)
  const instagramTypes = [
    { name: '일상 공유', tags: ['일상', '데일리', '공유'] },
    { name: '제품 소개', tags: ['제품', '소개', '홍보'] },
    { name: '여행 사진', tags: ['여행', '사진', '추억'] },
    { name: '음식 사진', tags: ['음식', '맛집', '요리'] },
    { name: '영감 주는 글', tags: ['영감', '동기부여', '명언'] },
  ];

  instagramTypes.forEach((type, index) => {
    templates.push({
      id: `instagram-${type.name.toLowerCase().replace(/\s+/g, '-')}-${String(index + 1).padStart(3, '0')}`,
      title: `${type.name} 인스타그램 캡션`,
      category: 'instagram',
      contentType: 'instagram-caption',
      platform: '인스타그램',
      description: `${type.name}용 인스타그램 캡션 템플릿`,
      example: `[짧은 메시지] ✨

[간단한 설명]

#${type.tags[0]} #${type.tags[1]} #${type.tags[2]}`,
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
      tags: ['인스타그램', ...type.tags],
      isPremium: index >= 3,
      createdAt: new Date(2024, 0, 1 + index)
    });
  });

  return templates;
}

// 템플릿 생성 및 출력
const generatedTemplates = generateTemplateVariations();
console.log(`생성된 템플릿 개수: ${generatedTemplates.length}`);
console.log('\n템플릿 목록:');
generatedTemplates.forEach((template, index) => {
  console.log(`${index + 1}. ${template.title} (${template.category})`);
});

// 파일로 내보내기 (필요시)
// import { writeFileSync } from 'fs';
// writeFileSync('data/generated-templates.json', JSON.stringify(generatedTemplates, null, 2));

export { generateTemplateVariations };

