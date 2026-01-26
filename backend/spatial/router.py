"""
Spatial 모듈 - API 라우터
가벼운 Web 메타공간 API
"""
from fastapi import APIRouter, HTTPException, Depends, status, Query, WebSocket, WebSocketDisconnect
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List
from datetime import datetime
import json

from backend.core import get_db, get_current_user, get_current_user_optional
from backend.database.models import User
from backend.utils.logger import get_logger
from .service import SpatialService
from .schemas import (
    SpaceCreate,
    SpaceUpdate,
    SpaceResponse,
    SpaceListResponse,
    SpaceChatRequest,
    SpaceChatResponse,
    SpaceParticipantResponse,
)
from backend.services.websocket_service import ConnectionManager

router = APIRouter(prefix="/api/v1/spatial", tags=["spatial"])
spatial_service = SpatialService()
connection_manager = ConnectionManager()
logger = get_logger(__name__)


# ========== Space Endpoints ==========

@router.post("/spaces", response_model=SpaceResponse, status_code=status.HTTP_201_CREATED)
async def create_space(
    space_data: SpaceCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    공간 생성 (가벼운 Web 메타공간)
    
    목적: 만남 + 대화 + 이벤트
    """
    result = await spatial_service.create_space(db, user.id, space_data)
    
    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("error", "Failed to create space")
        )
    
    space = result["space"]
    
    # Space 모델에서 metadata 추출
    space_type = space_data.type
    space_theme = space_data.theme
    if hasattr(space, 'metadata') and space.metadata:
        space_type = space.metadata.get("type", space_data.type)
        space_theme = space.metadata.get("theme", space_data.theme)
    
    return SpaceResponse(
        space_id=space.id,
        name=space.name,
        description=space.description,
        type=space_type,
        owner_id=space.owner_id,
        is_public=space.is_public,
        max_users=space.max_users,
        current_users=space.current_users,
        participants=[],
        theme=space_theme,
        created_at=space.created_at,
        updated_at=space.updated_at
    )


@router.get("/spaces", response_model=SpaceListResponse)
async def list_spaces(
    space_type: Optional[str] = Query(None, description="공간 타입 필터"),
    is_public: Optional[bool] = Query(None, description="공개 여부 필터"),
    page: int = Query(1, ge=1, description="페이지 번호"),
    page_size: int = Query(20, ge=1, le=100, description="페이지 크기"),
    user: Optional[User] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db),
):
    """공간 목록 조회"""
    user_id = user.id if user else None
    result = await spatial_service.list_spaces(
        db, user_id, space_type, is_public, page, page_size
    )
    
    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get("error", "Failed to list spaces")
        )
    
    # 응답 변환
    spaces = []
    for s in result["spaces"]:
        # Space 모델에서 metadata 추출
        s_type = "lounge"
        s_theme = None
        if hasattr(s, 'metadata') and s.metadata:
            s_type = s.metadata.get("type", "lounge")
            s_theme = s.metadata.get("theme")
        
        spaces.append(SpaceResponse(
            space_id=s.id,
            name=s.name,
            description=s.description,
            type=s_type,
            owner_id=s.owner_id,
            is_public=s.is_public,
            max_users=s.max_users,
            current_users=s.current_users,
            participants=[],
            theme=s_theme,
            created_at=s.created_at,
            updated_at=s.updated_at
        ))
    
    return SpaceListResponse(
        spaces=spaces,
        total=result["total"],
        page=result["page"],
        page_size=result["page_size"]
    )


@router.get("/spaces/{space_id}", response_model=SpaceResponse)
async def get_space(
    space_id: str,
    user: Optional[User] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db),
):
    """공간 조회"""
    user_id = user.id if user else None
    space = await spatial_service.get_space(db, space_id, user_id)
    
    if not space:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Space not found"
        )
    
    # 응답 변환
    # Space 모델에 metadata 필드가 있다면 사용, 없으면 기본값
    space_type = "lounge"
    theme = None
    if hasattr(space, 'metadata') and space.metadata:
        space_type = space.metadata.get("type", "lounge")
        theme = space.metadata.get("theme")
    
    return SpaceResponse(
        space_id=space.id,
        name=space.name,
        description=space.description,
        type=space_type,
        owner_id=space.owner_id,
        is_public=space.is_public,
        max_users=space.max_users,
        current_users=space.current_users,
        participants=[],
        theme=theme,
        created_at=space.created_at,
        updated_at=space.updated_at
    )


@router.post("/spaces/{space_id}/join", response_model=SpaceParticipantResponse)
async def join_space(
    space_id: str,
    character_id: Optional[str] = Query(None, description="사용할 캐릭터 ID"),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """공간 입장"""
    result = await spatial_service.join_space(db, space_id, user.id, character_id)
    
    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("error", "Failed to join space")
        )
    
    participant = result["participant"]
    return SpaceParticipantResponse(
        user_id=participant["user_id"],
        character_id=participant.get("character_id"),
        position={"x": 0, "y": 0, "z": 0},
        joined_at=datetime.fromisoformat(participant["joined_at"])
    )


@router.post("/spaces/{space_id}/leave", status_code=status.HTTP_204_NO_CONTENT)
async def leave_space(
    space_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """공간 퇴장"""
    result = await spatial_service.leave_space(db, space_id, user.id)
    
    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("error", "Failed to leave space")
        )


# ========== Chat Endpoints ==========

@router.post("/spaces/{space_id}/chat", response_model=SpaceChatResponse)
async def send_chat(
    space_id: str,
    chat_request: SpaceChatRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    공간 채팅 전송 + 캐릭터 반응
    
    채팅 메시지를 보내고, 캐릭터가 반응합니다.
    """
    result = await spatial_service.process_chat(
        db=db,
        space_id=space_id,
        user_id=user.id,
        chat_request=chat_request
    )
    
    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("error", "Failed to process chat")
        )
    
    return SpaceChatResponse(
        space_id=result["space_id"],
        user_id=result["user_id"],
        character_id=result.get("character_id"),
        message=result["message"],
        character_reply=result.get("character_reply"),
        emotion=result.get("emotion"),
        timestamp=result["timestamp"]
    )


# ========== WebSocket Endpoints ==========

@router.websocket("/spaces/{space_id}/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    space_id: str,
    token: Optional[str] = Query(None),
    character_id: Optional[str] = Query(None)
):
    """
    WebSocket 실시간 채팅
    
    실시간으로 채팅 메시지를 주고받고, 캐릭터 반응을 받습니다.
    """
    # 토큰 검증
    if not token:
        await websocket.close(code=1008, reason="Authentication required")
        return
    
    # 토큰에서 user_id 추출
    from backend.utils.security import SecurityManager
    security_manager = SecurityManager()
    payload = security_manager.verify_token(token)
    
    if not payload:
        await websocket.close(code=1008, reason="Invalid token")
        return
    
    user_id = payload.get('sub')
    if not user_id:
        await websocket.close(code=1008, reason="Invalid token")
        return
    
    # WebSocket 연결
    await connection_manager.connect(websocket, space_id, user_id)
    
    try:
        while True:
            # 메시지 수신
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            # 채팅 메시지 처리
            if message_data.get("type") == "chat":
                message = message_data.get("message", "")
                char_id = message_data.get("character_id") or character_id
                
                # 캐릭터 반응 생성
                from .chat_handler import space_chat
                chat_result = await space_chat(
                    user_id=user_id,
                    message=message,
                    character_id=char_id,
                    space_id=space_id
                )
                
                # 브로드캐스트
                await connection_manager.broadcast_message(
                    space_id,
                    {
                        "type": "chat_message",
                        "user_id": user_id,
                        "character_id": char_id,
                        "message": message,
                        "character_reply": chat_result.get("character_reply"),
                        "emotion": chat_result.get("emotion"),
                        "timestamp": datetime.utcnow().isoformat()
                    },
                    exclude=websocket
                )
            
            # 위치 업데이트 (Three.js에서)
            elif message_data.get("type") == "position":
                await connection_manager.broadcast_message(
                    space_id,
                    {
                        "type": "position_update",
                        "user_id": user_id,
                        "position": message_data.get("position", {}),
                        "timestamp": datetime.utcnow().isoformat()
                    },
                    exclude=websocket
                )
    
    except WebSocketDisconnect:
        connection_manager.disconnect(websocket, space_id)
        logger.info(f"User {user_id} disconnected from space {space_id}")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        connection_manager.disconnect(websocket, space_id)
