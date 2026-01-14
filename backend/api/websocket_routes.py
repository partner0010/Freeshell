"""
WebSocket API 라우트 (실시간 채팅)
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Query, Header
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession

from ..database.connection import get_db
from ..services.websocket_service import connection_manager, websocket_chat_endpoint
from ..utils.security import SecurityManager
from ..utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter()
security_manager = SecurityManager()


def get_user_id_from_token(token: str) -> Optional[str]:
    """토큰에서 사용자 ID 추출"""
    payload = security_manager.verify_token(token)
    if payload:
        return payload.get('sub')
    return None


@router.websocket("/chat/{space_id}")
async def websocket_chat(
    websocket: WebSocket,
    space_id: str,
    token: Optional[str] = Query(None)
):
    """WebSocket 실시간 채팅"""
    # 토큰 검증
    if not token:
        await websocket.close(code=1008, reason="Authentication required")
        return
    
    user_id = get_user_id_from_token(token)
    if not user_id:
        await websocket.close(code=1008, reason="Invalid token")
        return
    
    # WebSocket 연결 처리
    await websocket_chat_endpoint(websocket, space_id, user_id)


@router.get("/users/{space_id}")
async def get_connected_users(
    space_id: str
):
    """연결된 사용자 목록 조회"""
    users = connection_manager.get_connected_users(space_id)
    return {
        'success': True,
        'space_id': space_id,
        'connected_users': users,
        'count': len(users)
    }
