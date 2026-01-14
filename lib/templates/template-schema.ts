/**
 * AI 협업형 템플릿 시스템 - JSON 스키마
 * 웹/앱 공용, 블록 기반, 확장 가능한 구조
 */

/**
 * 템플릿 메타데이터
 */
export interface TemplateMetadata {
  id: string;                    // 고유 ID (예: "template-web-landing-001")
  version: string;                // 버전 (예: "1.0.0")
  createdAt: number;              // 생성 시간 (timestamp)
  updatedAt: number;              // 수정 시간 (timestamp)
  author?: string;                // 작성자 (AI 또는 사용자)
  tags: string[];                  // 태그 (검색/필터링용)
  description: string;            // 설명
  thumbnail?: string;             // 썸네일 URL
}

/**
 * 템플릿 타입
 */
export type TemplateType = 'web' | 'app' | 'hybrid';

/**
 * 템플릿 카테고리
 */
export type TemplateCategory = 
  | 'landing' 
  | 'blog' 
  | 'portfolio' 
  | 'ecommerce' 
  | 'dashboard' 
  | 'saas' 
  | 'mobile-app' 
  | 'web-app' 
  | 'other';

/**
 * 블록 타입
 */
export type BlockType = 
  | 'text' 
  | 'heading' 
  | 'image' 
  | 'video' 
  | 'button' 
  | 'form' 
  | 'container' 
  | 'code' 
  | 'list' 
  | 'table' 
  | 'card' 
  | 'hero' 
  | 'navbar' 
  | 'footer' 
  | 'sidebar' 
  | 'custom';

/**
 * 블록 스타일
 */
export interface BlockStyle {
  // 레이아웃
  position?: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';
  top?: string | number;
  left?: string | number;
  right?: string | number;
  bottom?: string | number;
  display?: 'block' | 'inline' | 'flex' | 'grid' | 'none';
  flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
  alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  gap?: string;
  gridTemplateColumns?: string;
  gridTemplateRows?: string;
  gridColumn?: string;
  gridRow?: string;
  
  // 크기
  width?: string;
  height?: string;
  minWidth?: string;
  minHeight?: string;
  maxWidth?: string;
  maxHeight?: string;
  
  // 간격
  margin?: string;
  marginTop?: string;
  marginRight?: string;
  marginBottom?: string;
  marginLeft?: string;
  padding?: string;
  paddingTop?: string;
  paddingRight?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  
  // 색상
  backgroundColor?: string;
  color?: string;
  borderColor?: string;
  
  // 테두리
  border?: string;
  borderTop?: string;
  borderRight?: string;
  borderBottom?: string;
  borderLeft?: string;
  borderWidth?: string;
  borderStyle?: string;
  borderRadius?: string;
  
  // 그림자
  boxShadow?: string;
  
  // 타이포그래피
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
  lineHeight?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  
  // 기타
  opacity?: number;
  transform?: string;
  transition?: string;
  zIndex?: number;
  cursor?: string;
  overflow?: 'visible' | 'hidden' | 'scroll' | 'auto';
  overflowX?: 'visible' | 'hidden' | 'scroll' | 'auto';
  overflowY?: 'visible' | 'hidden' | 'scroll' | 'auto';
  
  // 반응형
  responsive?: {
    mobile?: Partial<BlockStyle>;
    tablet?: Partial<BlockStyle>;
    desktop?: Partial<BlockStyle>;
  };
}

/**
 * 블록 데이터
 */
export interface BlockData {
  id: string;                    // 블록 고유 ID
  type: BlockType;                // 블록 타입
  content: any;                   // 블록 내용 (타입별 다름)
  style: BlockStyle;              // 블록 스타일
  children?: BlockData[];         // 자식 블록 (컨테이너 타입)
  metadata?: {                    // 추가 메타데이터
    [key: string]: any;
  };
}

/**
 * 편집 가능한 필드 정의
 */
export interface EditableField {
  id: string;                     // 필드 ID
  blockId: string;                 // 속한 블록 ID
  path: string;                    // 데이터 경로 (예: "content.text", "style.backgroundColor")
  type: 'text' | 'number' | 'color' | 'image' | 'url' | 'select' | 'boolean';
  label: string;                   // 필드 라벨
  defaultValue?: any;              // 기본값
  options?: any[];                 // 선택 옵션 (select 타입)
  validation?: {                   // 검증 규칙
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: string;
  };
  description?: string;             // 필드 설명
}

/**
 * 미리보기 정보
 */
export interface PreviewInfo {
  width: number;                   // 기본 너비
  height: number;                  // 기본 높이
  backgroundColor?: string;        // 배경색
  deviceType?: 'mobile' | 'tablet' | 'desktop';
  screenshot?: string;             // 스크린샷 URL
}

/**
 * 템플릿 구조
 */
export interface Template {
  metadata: TemplateMetadata;
  type: TemplateType;
  category: TemplateCategory;
  blocks: BlockData[];             // 루트 블록들
  editableFields: EditableField[]; // 편집 가능한 필드 목록
  previewInfo: PreviewInfo;        // 미리보기 정보
  styles?: {                       // 전역 스타일
    global?: {
      fontFamily?: string;
      color?: string;
      backgroundColor?: string;
    };
    variables?: {                   // CSS 변수
      [key: string]: string;
    };
  };
  scripts?: {                      // 스크립트 (선택사항)
    head?: string;                 // <head>에 추가할 스크립트
    body?: string;                 // </body> 앞에 추가할 스크립트
  };
}

/**
 * 템플릿 생성 옵션 (AI용)
 */
export interface TemplateGenerationOptions {
  type: TemplateType;
  category: TemplateCategory;
  description: string;             // 사용자 요구사항
  style?: {                        // 스타일 선호도
    colorScheme?: string[];
    layout?: 'centered' | 'sidebar' | 'full-width';
    theme?: 'light' | 'dark' | 'auto';
  };
  features?: string[];              // 포함할 기능
  blocks?: BlockType[];            // 포함할 블록 타입
}

/**
 * 템플릿 검색/필터 옵션
 */
export interface TemplateFilter {
  type?: TemplateType;
  category?: TemplateCategory;
  tags?: string[];
  search?: string;
  limit?: number;
  offset?: number;
}

/**
 * 템플릿 유효성 검사
 */
export function validateTemplate(template: Template): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // 필수 필드 검증
  if (!template.metadata?.id) errors.push('metadata.id is required');
  if (!template.type) errors.push('type is required');
  if (!template.category) errors.push('category is required');
  if (!template.blocks || template.blocks.length === 0) errors.push('blocks is required');
  if (!template.previewInfo) errors.push('previewInfo is required');

  // ID 중복 검증
  const blockIds = new Set<string>();
  const checkBlockIds = (blocks: BlockData[]) => {
    blocks.forEach(block => {
      if (blockIds.has(block.id)) {
        errors.push(`Duplicate block ID: ${block.id}`);
      }
      blockIds.add(block.id);
      if (block.children) {
        checkBlockIds(block.children);
      }
    });
  };
  checkBlockIds(template.blocks);

  // 편집 가능 필드 검증
  if (template.editableFields) {
    template.editableFields.forEach(field => {
      if (!blockIds.has(field.blockId)) {
        errors.push(`EditableField references non-existent block: ${field.blockId}`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * 템플릿 ID 생성 (중복 방지)
 */
export function generateTemplateId(
  type: TemplateType,
  category: TemplateCategory,
  index: number
): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `template-${type}-${category}-${index}-${timestamp}-${random}`;
}

/**
 * 블록 ID 생성
 */
export function generateBlockId(blockType: BlockType, index: number): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 6);
  return `block-${blockType}-${index}-${timestamp}-${random}`;
}
