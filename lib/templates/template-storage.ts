/**
 * 템플릿 저장소 관리
 * 1,000개 이상 확장 가능, 중복 방지
 */

import { Template, TemplateFilter, validateTemplate, generateTemplateId } from './template-schema';

/**
 * 템플릿 저장소 (인메모리 + localStorage 백업)
 */
class TemplateStorage {
  private templates: Map<string, Template> = new Map();
  private indexByCategory: Map<string, Set<string>> = new Map();
  private indexByType: Map<string, Set<string>> = new Map();
  private indexByTag: Map<string, Set<string>> = new Map();
  private searchIndex: Map<string, Set<string>> = new Map(); // 검색 인덱스

  constructor() {
    this.loadFromLocalStorage();
  }

  /**
   * 템플릿 추가 (중복 방지)
   */
  add(template: Template): { success: boolean; id?: string; error?: string } {
    // 유효성 검사
    const validation = validateTemplate(template);
    if (!validation.valid) {
      return {
        success: false,
        error: `템플릿 유효성 검사 실패: ${validation.errors.join(', ')}`,
      };
    }

    // ID 중복 확인
    if (this.templates.has(template.metadata.id)) {
      return {
        success: false,
        error: `템플릿 ID 중복: ${template.metadata.id}`,
      };
    }

    // 템플릿 저장
    this.templates.set(template.metadata.id, template);

    // 인덱스 업데이트
    this.updateIndexes(template);

    // localStorage에 저장
    this.saveToLocalStorage();

    return {
      success: true,
      id: template.metadata.id,
    };
  }

  /**
   * 템플릿 가져오기
   */
  get(id: string): Template | null {
    return this.templates.get(id) || null;
  }

  /**
   * 템플릿 업데이트
   */
  update(id: string, updates: Partial<Template>): { success: boolean; error?: string } {
    const existing = this.templates.get(id);
    if (!existing) {
      return {
        success: false,
        error: `템플릿을 찾을 수 없습니다: ${id}`,
      };
    }

    // 기존 인덱스 제거
    this.removeFromIndexes(existing);

    // 업데이트된 템플릿 생성
    const updated: Template = {
      ...existing,
      ...updates,
      metadata: {
        ...existing.metadata,
        ...updates.metadata,
        updatedAt: Date.now(),
      },
    };

    // 유효성 검사
    const validation = validateTemplate(updated);
    if (!validation.valid) {
      // 인덱스 복구
      this.updateIndexes(existing);
      return {
        success: false,
        error: `템플릿 유효성 검사 실패: ${validation.errors.join(', ')}`,
      };
    }

    // 템플릿 업데이트
    this.templates.set(id, updated);

    // 인덱스 업데이트
    this.updateIndexes(updated);

    // localStorage에 저장
    this.saveToLocalStorage();

    return { success: true };
  }

  /**
   * 템플릿 삭제
   */
  delete(id: string): { success: boolean; error?: string } {
    const template = this.templates.get(id);
    if (!template) {
      return {
        success: false,
        error: `템플릿을 찾을 수 없습니다: ${id}`,
      };
    }

    // 인덱스에서 제거
    this.removeFromIndexes(template);

    // 템플릿 삭제
    this.templates.delete(id);

    // localStorage에 저장
    this.saveToLocalStorage();

    return { success: true };
  }

  /**
   * 템플릿 검색/필터
   */
  search(filter: TemplateFilter): Template[] {
    let resultIds: Set<string> | null = null;

    // 타입 필터
    if (filter.type) {
      const typeIds = this.indexByType.get(filter.type);
      if (typeIds) {
        resultIds = new Set(typeIds);
      } else {
        return []; // 타입에 해당하는 템플릿이 없음
      }
    }

    // 카테고리 필터
    if (filter.category) {
      const categoryIds = this.indexByCategory.get(filter.category);
      if (categoryIds) {
        if (resultIds) {
          // 교집합
          resultIds = new Set([...resultIds].filter(id => categoryIds.has(id)));
        } else {
          resultIds = new Set(categoryIds);
        }
      } else {
        return []; // 카테고리에 해당하는 템플릿이 없음
      }
    }

    // 태그 필터
    if (filter.tags && filter.tags.length > 0) {
      const tagIds = new Set<string>();
      filter.tags.forEach(tag => {
        const ids = this.indexByTag.get(tag);
        if (ids) {
          ids.forEach(id => tagIds.add(id));
        }
      });

      if (resultIds) {
        // 교집합
        resultIds = new Set([...resultIds].filter(id => tagIds.has(id)));
      } else {
        resultIds = tagIds;
      }
    }

    // 검색어 필터
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      const searchIds = new Set<string>();

      // 검색 인덱스에서 찾기
      this.searchIndex.forEach((ids, keyword) => {
        if (keyword.includes(searchLower)) {
          ids.forEach(id => searchIds.add(id));
        }
      });

      // 또는 전체 템플릿에서 검색
      if (searchIds.size === 0) {
        this.templates.forEach((template, id) => {
          const searchableText = [
            template.metadata.description,
            template.metadata.id,
            ...template.metadata.tags,
          ].join(' ').toLowerCase();

          if (searchableText.includes(searchLower)) {
            searchIds.add(id);
          }
        });
      }

      if (resultIds) {
        // 교집합
        resultIds = new Set([...resultIds].filter(id => searchIds.has(id)));
      } else {
        resultIds = searchIds;
      }
    }

    // 결과 가져오기
    const ids = resultIds 
      ? Array.from(resultIds)
      : Array.from(this.templates.keys());

    // 정렬 (최신순)
    const templates = ids
      .map(id => this.templates.get(id)!)
      .filter(Boolean)
      .sort((a, b) => b.metadata.createdAt - a.metadata.createdAt);

    // 페이지네이션
    const offset = filter.offset || 0;
    const limit = filter.limit || 100;

    return templates.slice(offset, offset + limit);
  }

  /**
   * 전체 템플릿 개수
   */
  count(): number {
    return this.templates.size;
  }

  /**
   * 인덱스 업데이트
   */
  private updateIndexes(template: Template): void {
    // 카테고리 인덱스
    if (!this.indexByCategory.has(template.category)) {
      this.indexByCategory.set(template.category, new Set());
    }
    this.indexByCategory.get(template.category)!.add(template.metadata.id);

    // 타입 인덱스
    if (!this.indexByType.has(template.type)) {
      this.indexByType.set(template.type, new Set());
    }
    this.indexByType.get(template.type)!.add(template.metadata.id);

    // 태그 인덱스
    template.metadata.tags.forEach(tag => {
      if (!this.indexByTag.has(tag)) {
        this.indexByTag.set(tag, new Set());
      }
      this.indexByTag.get(tag)!.add(template.metadata.id);
    });

    // 검색 인덱스
    const searchableText = [
      template.metadata.description,
      template.metadata.id,
      ...template.metadata.tags,
    ].join(' ').toLowerCase();

    const words = searchableText.split(/\s+/);
    words.forEach(word => {
      if (word.length >= 2) {
        if (!this.searchIndex.has(word)) {
          this.searchIndex.set(word, new Set());
        }
        this.searchIndex.get(word)!.add(template.metadata.id);
      }
    });
  }

  /**
   * 인덱스에서 제거
   */
  private removeFromIndexes(template: Template): void {
    // 카테고리 인덱스
    const categorySet = this.indexByCategory.get(template.category);
    if (categorySet) {
      categorySet.delete(template.metadata.id);
    }

    // 타입 인덱스
    const typeSet = this.indexByType.get(template.type);
    if (typeSet) {
      typeSet.delete(template.metadata.id);
    }

    // 태그 인덱스
    template.metadata.tags.forEach(tag => {
      const tagSet = this.indexByTag.get(tag);
      if (tagSet) {
        tagSet.delete(template.metadata.id);
      }
    });

    // 검색 인덱스
    this.searchIndex.forEach((ids) => {
      ids.delete(template.metadata.id);
    });
  }

  /**
   * localStorage에서 로드
   */
  private loadFromLocalStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem('templates');
      if (stored) {
        const templates: Template[] = JSON.parse(stored);
        templates.forEach(template => {
          this.templates.set(template.metadata.id, template);
          this.updateIndexes(template);
        });
      }
    } catch (error) {
      console.error('템플릿 로드 오류:', error);
    }
  }

  /**
   * localStorage에 저장
   */
  private saveToLocalStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const templates = Array.from(this.templates.values());
      localStorage.setItem('templates', JSON.stringify(templates));
    } catch (error) {
      console.error('템플릿 저장 오류:', error);
    }
  }
}

// 싱글톤 인스턴스
export const templateStorage = new TemplateStorage();
