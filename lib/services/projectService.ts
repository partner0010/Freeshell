/**
 * Project 서비스
 */
import { projectStorage } from '@/lib/db/storage';
import type { Project, CreateProjectInput, UpdateProjectInput } from '@/lib/models/Project';

export class ProjectService {
  /**
   * 프로젝트 생성
   */
  createProject(input: CreateProjectInput): Project {
    return projectStorage.create(input);
  }

  /**
   * 프로젝트 조회
   */
  getProjectById(id: string): Project | undefined {
    return projectStorage.findById(id);
  }

  /**
   * 사용자의 모든 프로젝트 조회
   */
  getProjectsByUserId(userId: string): Project[] {
    return projectStorage.findByUserId(userId);
  }

  /**
   * 프로젝트 업데이트
   */
  updateProject(id: string, updates: UpdateProjectInput): Project | undefined {
    return projectStorage.update(id, updates);
  }

  /**
   * 프로젝트 삭제
   */
  deleteProject(id: string): boolean {
    return projectStorage.delete(id);
  }
}

export const projectService = new ProjectService();

