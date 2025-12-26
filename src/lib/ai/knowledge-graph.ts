/**
 * 지식 그래프 및 벡터 데이터베이스 시스템
 * 장기 기억, 컨텍스트 관리, 지식 저장
 * 자기 학습 시스템 통합: 지식 검색 및 저장 최적화
 */

import { selfLearningSystem } from './self-learning';

export interface KnowledgeNode {
  id: string;
  type: 'concept' | 'fact' | 'relationship' | 'experience' | 'pattern';
  content: string;
  metadata: Record<string, any>;
  embeddings?: number[];
  connections: string[];
  confidence: number;
  createdAt: Date;
  updatedAt: Date;
  accessCount: number;
}

export interface KnowledgeRelationship {
  from: string;
  to: string;
  type: 'related_to' | 'causes' | 'requires' | 'similar_to' | 'opposite_to';
  strength: number;
}

class KnowledgeGraph {
  private nodes: Map<string, KnowledgeNode> = new Map();
  private relationships: Map<string, KnowledgeRelationship> = new Map();
  private vectorIndex: Map<string, number[]> = new Map();

  /**
   * 지식 노드 추가
   */
  async addNode(node: Omit<KnowledgeNode, 'id' | 'createdAt' | 'updatedAt' | 'accessCount'>): Promise<KnowledgeNode> {
    const id = `kg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // 임베딩 생성 (실제로는 OpenAI Embeddings API 사용)
    const embeddings = await this.generateEmbeddings(node.content);
    
    const knowledgeNode: KnowledgeNode = {
      ...node,
      id,
      embeddings,
      createdAt: new Date(),
      updatedAt: new Date(),
      accessCount: 0,
    };

    this.nodes.set(id, knowledgeNode);
    if (embeddings) {
      this.vectorIndex.set(id, embeddings);
    }

    return knowledgeNode;
  }

  /**
   * 관계 추가
   */
  addRelationship(relationship: KnowledgeRelationship): void {
    const key = `${relationship.from}-${relationship.to}-${relationship.type}`;
    this.relationships.set(key, relationship);
    
    // 노드에 연결 추가
    const fromNode = this.nodes.get(relationship.from);
    const toNode = this.nodes.get(relationship.to);
    
    if (fromNode && !fromNode.connections.includes(relationship.to)) {
      fromNode.connections.push(relationship.to);
    }
    if (toNode && !toNode.connections.includes(relationship.from)) {
      toNode.connections.push(relationship.from);
    }
  }

  /**
   * 유사한 지식 검색 (벡터 유사도)
   */
  async searchSimilar(query: string, limit: number = 5): Promise<KnowledgeNode[]> {
    const queryEmbeddings = await this.generateEmbeddings(query);
    if (!queryEmbeddings) return [];

    const similarities: Array<{ node: KnowledgeNode; similarity: number }> = [];

    for (const [nodeId, embeddings] of this.vectorIndex.entries()) {
      const similarity = this.cosineSimilarity(queryEmbeddings, embeddings);
      const node = this.nodes.get(nodeId);
      if (node) {
        similarities.push({ node, similarity });
      }
    }

    const results = similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)
      .map(item => {
        item.node.accessCount++;
        return item.node;
      });

    // 자기 학습: 검색 결과에서 학습
    selfLearningSystem.learnFromExperience({
      task: 'knowledge_search',
      input: { query, limit },
      output: { results: results.length, avgSimilarity: similarities[0]?.similarity || 0 },
      success: results.length > 0,
      performance: results.length > 0 ? Math.min(1.0, similarities[0]?.similarity || 0) : 0.3,
      patterns: ['knowledge_search', 'vector_similarity'],
      improvements: [],
    }).catch(err => console.error('지식 검색 학습 오류:', err));

    return results;
  }

  /**
   * 관련 지식 검색 (그래프 탐색)
   */
  findRelated(nodeId: string, depth: number = 2): KnowledgeNode[] {
    const visited = new Set<string>();
    const result: KnowledgeNode[] = [];
    const queue: Array<{ id: string; depth: number }> = [{ id: nodeId, depth: 0 }];

    while (queue.length > 0) {
      const { id, depth: currentDepth } = queue.shift()!;
      if (visited.has(id) || currentDepth > depth) continue;

      visited.add(id);
      const node = this.nodes.get(id);
      if (node && id !== nodeId) {
        result.push(node);
      }

      if (currentDepth < depth) {
        node?.connections.forEach(connId => {
          if (!visited.has(connId)) {
            queue.push({ id: connId, depth: currentDepth + 1 });
          }
        });
      }
    }

    return result;
  }

  /**
   * 경험 저장
   */
  async saveExperience(goal: string, result: any, success: boolean, lessons: string[]): Promise<void> {
    const experienceNode = await this.addNode({
      type: 'experience',
      content: `목표: ${goal}\n결과: ${JSON.stringify(result)}\n성공: ${success}`,
      metadata: {
        goal,
        result,
        success,
        lessons,
      },
      connections: [],
      confidence: success ? 0.9 : 0.5,
    });

    // 관련 개념과 연결
    const concepts = await this.extractConcepts(goal);
    for (const concept of concepts) {
      const conceptNode = await this.findOrCreateConcept(concept);
      this.addRelationship({
        from: experienceNode.id,
        to: conceptNode.id,
        type: 'related_to',
        strength: 0.8,
      });
    }

    // 자기 학습: 지식 저장 성능 추적
    selfLearningSystem.learnFromExperience({
      task: 'knowledge_storage',
      input: { goal, conceptsCount: concepts.length },
      output: { nodeId: experienceNode.id, connections: experienceNode.connections.length },
      success,
      performance: success ? 0.9 : 0.5,
      patterns: ['knowledge_storage', 'graph_connection'],
      improvements: lessons,
    }).catch(err => console.error('지식 저장 학습 오류:', err));
  }

  /**
   * 개념 추출
   */
  private async extractConcepts(text: string): Promise<string[]> {
    // 실제로는 NLP 모델을 사용하여 개념 추출
    // 여기서는 간단한 키워드 추출
    const keywords = text.match(/\b\w{4,}\b/g) || [];
    return [...new Set(keywords)].slice(0, 5);
  }

  /**
   * 개념 찾기 또는 생성
   */
  private async findOrCreateConcept(concept: string): Promise<KnowledgeNode> {
    // 기존 개념 검색
    const similar = await this.searchSimilar(concept, 1);
    if (similar.length > 0 && similar[0].content.includes(concept)) {
      return similar[0];
    }

    // 새 개념 생성
    return await this.addNode({
      type: 'concept',
      content: concept,
      metadata: { name: concept },
      connections: [],
      confidence: 0.7,
    });
  }

  /**
   * 임베딩 생성 (OpenAI Embeddings API)
   */
  private async generateEmbeddings(text: string): Promise<number[] | undefined> {
    try {
      if (!process.env.OPENAI_API_KEY) return undefined;

      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'text-embedding-3-small',
          input: text,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.data[0].embedding;
      }
    } catch (error) {
      console.error('임베딩 생성 실패:', error);
    }
    return undefined;
  }

  /**
   * 코사인 유사도 계산
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * 지식 그래프 조회
   */
  getNode(id: string): KnowledgeNode | undefined {
    const node = this.nodes.get(id);
    if (node) {
      node.accessCount++;
      node.updatedAt = new Date();
    }
    return node;
  }

  /**
   * 모든 노드 조회
   */
  getAllNodes(): KnowledgeNode[] {
    return Array.from(this.nodes.values());
  }
}

export const knowledgeGraph = new KnowledgeGraph();

