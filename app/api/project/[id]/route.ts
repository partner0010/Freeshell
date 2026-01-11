import { NextRequest, NextResponse } from 'next/server';
import { projectService } from '@/lib/services/projectService';

/**
 * 프로젝트 조회 API
 * GET /api/project/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    const project = projectService.getProjectById(id);
    
    if (!project) {
      return NextResponse.json(
        { error: '프로젝트를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      project,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[Project API] 오류:', error);
    return NextResponse.json(
      {
        error: '프로젝트 조회 중 오류가 발생했습니다.',
        message: error.message || '알 수 없는 오류',
      },
      { status: 500 }
    );
  }
}

/**
 * 프로젝트 업데이트 API
 * PUT /api/project/[id]
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    
    const project = projectService.updateProject(id, body);
    
    if (!project) {
      return NextResponse.json(
        { error: '프로젝트를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      project,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[Project API] 오류:', error);
    return NextResponse.json(
      {
        error: '프로젝트 업데이트 중 오류가 발생했습니다.',
        message: error.message || '알 수 없는 오류',
      },
      { status: 500 }
    );
  }
}

/**
 * 프로젝트 삭제 API
 * DELETE /api/project/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    const success = projectService.deleteProject(id);
    
    if (!success) {
      return NextResponse.json(
        { error: '프로젝트를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '프로젝트가 삭제되었습니다.',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[Project API] 오류:', error);
    return NextResponse.json(
      {
        error: '프로젝트 삭제 중 오류가 발생했습니다.',
        message: error.message || '알 수 없는 오류',
      },
      { status: 500 }
    );
  }
}

