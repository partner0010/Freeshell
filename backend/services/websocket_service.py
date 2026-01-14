"""
WebSocket 서비스 (실시간 채팅)
"""

from typing import Dict, Any, List, Set
from fastapi import WebSocket, WebSocketDisconnect
from datetime import datetime
import json
import asyncio

from ..utils.logger import get_logger

logger = get_logger(__name__)


class ConnectionManager:
    """WebSocket 연결 관리자"""
    
    def __init__(self):
        # space_id -> Set[WebSocket]
        self.active_connections: Dict[str, Set[WebSocket]] = {}
        # WebSocket -> user_id
        self.connection_users: Dict[WebSocket, str] = {}
    
    async def connect(self, websocket: WebSocket, space_id: str, user_id: str):
        """연결 수락"""
        await websocket.accept()
        
        if space_id not in self.active_connections:
            self.active_connections[space_id] = set()
        
        self.active_connections[space_id].add(websocket)
        self.connection_users[websocket] = user_id
        
        # 입장 알림 브로드캐스트
        await self.broadcast_message(
            space_id,
            {
                'type': 'user_joined',
                'user_id': user_id,
                'timestamp': datetime.utcnow().isoformat()
            },
            exclude=websocket
        )
        
        logger.info(f"User {user_id} connected to space {space_id}")
    
    def disconnect(self, websocket: WebSocket, space_id: str):
        """연결 해제"""
        if space_id in self.active_connections:
            self.active_connections[space_id].discard(websocket)
        
        user_id = self.connection_users.pop(websocket, None)
        
        if user_id:
            # 퇴장 알림 브로드캐스트
            asyncio.create_task(self.broadcast_message(
                space_id,
                {
                    'type': 'user_left',
                    'user_id': user_id,
                    'timestamp': datetime.utcnow().isoformat()
                }
            ))
        
        logger.info(f"User {user_id} disconnected from space {space_id}")
    
    async def broadcast_message(self, space_id: str, message: Dict[str, Any], exclude: WebSocket = None):
        """메시지 브로드캐스트"""
        if space_id not in self.active_connections:
            return
        
        disconnected = []
        for connection in self.active_connections[space_id]:
            if connection == exclude:
                continue
            
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.error(f"Broadcast error: {e}")
                disconnected.append(connection)
        
        # 연결 끊어진 소켓 제거
        for connection in disconnected:
            self.disconnect(connection, space_id)
    
    async def send_personal_message(self, websocket: WebSocket, message: Dict[str, Any]):
        """개인 메시지 전송"""
        try:
            await websocket.send_json(message)
        except Exception as e:
            logger.error(f"Send personal message error: {e}")
    
    def get_connected_users(self, space_id: str) -> List[str]:
        """연결된 사용자 목록"""
        if space_id not in self.active_connections:
            return []
        
        return [
            self.connection_users[conn]
            for conn in self.active_connections[space_id]
            if conn in self.connection_users
        ]


# 전역 연결 관리자
connection_manager = ConnectionManager()


async def websocket_chat_endpoint(websocket: WebSocket, space_id: str, user_id: str):
    """WebSocket 채팅 엔드포인트"""
    await connection_manager.connect(websocket, space_id, user_id)
    
    try:
        while True:
            # 메시지 수신
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            # 채팅 메시지 브로드캐스트
            await connection_manager.broadcast_message(
                space_id,
                {
                    'type': 'chat_message',
                    'user_id': user_id,
                    'message': message_data.get('message', ''),
                    'timestamp': datetime.utcnow().isoformat()
                },
                exclude=websocket
            )
            
    except WebSocketDisconnect:
        connection_manager.disconnect(websocket, space_id)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        connection_manager.disconnect(websocket, space_id)
