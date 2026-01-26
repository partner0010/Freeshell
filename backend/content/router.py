"""
Content 모듈 - API 라우터
"""
from fastapi import APIRouter, HTTPException, Depends, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List

from backend.core import get_db, get_current_user, require_permission, Permission
from backend.database.models import User
from .service import ContentService
from .schemas import (
    ContentCreate,
    ContentUpdate,
    ContentResponse,
    ProjectCreate,
    ProjectUpdate,
    ProjectResponse,
    ProjectListResponse,
)

router = APIRouter(prefix="/api/v1/content", tags=["content"])
content_service = ContentService()


# ========== Project Endpoints ==========

@router.post("/projects", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    project_data: ProjectCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """프로젝트 생성"""
    result = await content_service.create_project(db, user.id, project_data)
    
    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("error", "Failed to create project")
        )
    
    return result["project"]


@router.get("/projects", response_model=ProjectListResponse)
async def list_projects(
    status: Optional[str] = Query(None, description="프로젝트 상태 필터"),
    page: int = Query(1, ge=1, description="페이지 번호"),
    page_size: int = Query(20, ge=1, le=100, description="페이지 크기"),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """프로젝트 목록 조회"""
    result = await content_service.list_projects(db, user.id, status, page, page_size)
    
    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get("error", "Failed to list projects")
        )
    
    return ProjectListResponse(
        projects=result["projects"],
        total=result["total"],
        page=result["page"],
        page_size=result["page_size"]
    )


@router.get("/projects/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """프로젝트 조회"""
    project = await content_service.get_project(db, project_id, user.id)
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    return project


@router.put("/projects/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: str,
    project_data: ProjectUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """프로젝트 수정"""
    result = await content_service.update_project(db, project_id, user.id, project_data)
    
    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("error", "Failed to update project")
        )
    
    return result["project"]


@router.delete("/projects/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """프로젝트 삭제"""
    result = await content_service.delete_project(db, project_id, user.id)
    
    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("error", "Failed to delete project")
        )


# ========== Content Endpoints ==========

@router.post("/projects/{project_id}/contents", response_model=ContentResponse, status_code=status.HTTP_201_CREATED)
async def create_content(
    project_id: str,
    content_data: ContentCreate,
    user: User = Depends(require_permission(Permission.CONTENT_CREATE)),
    db: AsyncSession = Depends(get_db),
):
    """콘텐츠 생성"""
    # project_id를 content_data에 설정
    content_data.project_id = project_id
    
    result = await content_service.create_content(db, project_id, user.id, content_data)
    
    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("error", "Failed to create content")
        )
    
    return result["content"]


@router.get("/projects/{project_id}/contents", response_model=List[ContentResponse])
async def list_contents(
    project_id: str,
    content_type: Optional[str] = Query(None, description="콘텐츠 타입 필터"),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """콘텐츠 목록 조회"""
    result = await content_service.list_contents(db, project_id, user.id, content_type)
    
    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("error", "Failed to list contents")
        )
    
    return result["contents"]


@router.get("/contents/{content_id}", response_model=ContentResponse)
async def get_content(
    content_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """콘텐츠 조회"""
    content = await content_service.get_content(db, content_id, user.id)
    
    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )
    
    return content


@router.put("/contents/{content_id}", response_model=ContentResponse)
async def update_content(
    content_id: str,
    content_data: ContentUpdate,
    user: User = Depends(require_permission(Permission.CONTENT_UPDATE)),
    db: AsyncSession = Depends(get_db),
):
    """콘텐츠 수정"""
    result = await content_service.update_content(db, content_id, user.id, content_data)
    
    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("error", "Failed to update content")
        )
    
    return result["content"]


@router.delete("/contents/{content_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_content(
    content_id: str,
    user: User = Depends(require_permission(Permission.CONTENT_DELETE)),
    db: AsyncSession = Depends(get_db),
):
    """콘텐츠 삭제"""
    result = await content_service.delete_content(db, content_id, user.id)
    
    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("error", "Failed to delete content")
        )
