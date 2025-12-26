/**
 * 워크플로우 데이터베이스 저장소
 */

import { prisma } from '@/lib/db';
import type { Workflow, WorkflowStep } from './workflow-manager';

/**
 * DB에서 워크플로우를 Workflow 타입으로 변환
 */
function dbToWorkflow(dbWorkflow: any): Workflow {
  return {
    id: dbWorkflow.id,
    name: dbWorkflow.name,
    description: dbWorkflow.description || '',
    steps: (dbWorkflow.steps as any) || [],
    status: dbWorkflow.status as 'active' | 'paused' | 'stopped',
    createdAt: dbWorkflow.createdAt,
    updatedAt: dbWorkflow.updatedAt,
    lastRun: dbWorkflow.lastRun || undefined,
    runCount: dbWorkflow.runCount || 0,
  };
}

/**
 * 모든 워크플로우 조회
 */
export async function getAllWorkflowsFromDB(): Promise<Workflow[]> {
  try {
    const workflows = await prisma.workflow.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return workflows.map(dbToWorkflow);
  } catch (error) {
    console.error('워크플로우 조회 실패:', error);
    return [];
  }
}

/**
 * 워크플로우 조회
 */
export async function getWorkflowFromDB(id: string): Promise<Workflow | null> {
  try {
    const workflow = await prisma.workflow.findUnique({
      where: { id },
    });
    return workflow ? dbToWorkflow(workflow) : null;
  } catch (error) {
    console.error('워크플로우 조회 실패:', error);
    return null;
  }
}

/**
 * 워크플로우 생성
 */
export async function createWorkflowInDB(
  name: string,
  description: string,
  steps: WorkflowStep[]
): Promise<Workflow> {
  try {
    const workflow = await prisma.workflow.create({
      data: {
        name,
        description,
        steps: steps as any,
        status: 'paused',
        runCount: 0,
      },
    });
    return dbToWorkflow(workflow);
  } catch (error) {
    console.error('워크플로우 생성 실패:', error);
    throw error;
  }
}

/**
 * 워크플로우 업데이트
 */
export async function updateWorkflowInDB(
  id: string,
  updates: Partial<{
    name: string;
    description: string;
    steps: WorkflowStep[];
    status: 'active' | 'paused' | 'stopped';
    lastRun: Date;
    runCount: number;
  }>
): Promise<Workflow | null> {
  try {
    const updateData: any = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.steps !== undefined) updateData.steps = updates.steps as any;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.lastRun !== undefined) updateData.lastRun = updates.lastRun;
    if (updates.runCount !== undefined) updateData.runCount = updates.runCount;

    const workflow = await prisma.workflow.update({
      where: { id },
      data: updateData,
    });
    return dbToWorkflow(workflow);
  } catch (error) {
    console.error('워크플로우 업데이트 실패:', error);
    return null;
  }
}

/**
 * 워크플로우 삭제
 */
export async function deleteWorkflowFromDB(id: string): Promise<boolean> {
  try {
    await prisma.workflow.delete({
      where: { id },
    });
    return true;
  } catch (error) {
    console.error('워크플로우 삭제 실패:', error);
    return false;
  }
}

