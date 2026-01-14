"""
Spatial (공간형 SNS) 관리자
"""

from typing import Dict, Any, List, Optional
from datetime import datetime
import os
import json
import uuid

from ...utils.logger import get_logger

logger = get_logger(__name__)


class SpaceManager:
    """공간 관리자 (2.5D 공간형 SNS)"""
    
    def __init__(self, storage_dir: str = "storage/spaces"):
        self.storage_dir = storage_dir
        os.makedirs(storage_dir, exist_ok=True)
        self.active_rooms: Dict[str, Dict[str, Any]] = {}
    
    def create_room(
        self,
        user_id: str,
        room_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        공간 생성
        
        Args:
            user_id: 사용자 ID
            room_data: 공간 데이터
        
        Returns:
            생성 결과
        """
        room_id = str(uuid.uuid4())
        
        room = {
            'id': room_id,
            'creator_id': user_id,
            'name': room_data.get('name', 'Unnamed Space'),
            'description': room_data.get('description', ''),
            'space': {
                'type': room_data.get('space_type', '2.5d'),
                'background': room_data.get('background', 'default'),
                'layout': room_data.get('layout', 'open'),
                'capacity': room_data.get('capacity', 50)
            },
            'users': [{
                'user_id': user_id,
                'avatar': room_data.get('avatar', {}),
                'position': {'x': 0, 'y': 0, 'z': 0},
                'joined_at': datetime.now().isoformat()
            }],
            'chat': [],
            'shared_content': [],
            'settings': {
                'privacy': room_data.get('privacy', 'public'),
                'moderation': room_data.get('moderation', True)
            },
            'metadata': {
                'created_at': datetime.now().isoformat(),
                'updated_at': datetime.now().isoformat()
            }
        }
        
        # 저장
        self._save_room(room)
        self.active_rooms[room_id] = room
        
        logger.info(f"Room created: {room_id} by {user_id}")
        
        return {
            'success': True,
            'room_id': room_id,
            'room': room
        }
    
    def join_room(
        self,
        room_id: str,
        user_id: str,
        avatar: Dict[str, Any]
    ) -> Dict[str, Any]:
        """공간 입장"""
        room = self.get_room(room_id)
        
        if not room:
            return {
                'success': False,
                'error': 'Room not found'
            }
        
        # 이미 입장한 사용자 확인
        existing_user = next(
            (u for u in room['users'] if u['user_id'] == user_id),
            None
        )
        
        if existing_user:
            return {
                'success': True,
                'room': room,
                'message': 'Already in room'
            }
        
        # 입장
        room['users'].append({
            'user_id': user_id,
            'avatar': avatar,
            'position': {'x': 0, 'y': 0, 'z': 0},
            'joined_at': datetime.now().isoformat()
        })
        
        # 저장
        self._save_room(room)
        self.active_rooms[room_id] = room
        
        return {
            'success': True,
            'room': room
        }
    
    def leave_room(self, room_id: str, user_id: str) -> Dict[str, Any]:
        """공간 퇴장"""
        room = self.get_room(room_id)
        
        if not room:
            return {
                'success': False,
                'error': 'Room not found'
            }
        
        # 사용자 제거
        room['users'] = [u for u in room['users'] if u['user_id'] != user_id]
        
        # 저장
        self._save_room(room)
        if room_id in self.active_rooms:
            self.active_rooms[room_id] = room
        
        return {
            'success': True,
            'room': room
        }
    
    def send_message(
        self,
        room_id: str,
        user_id: str,
        message: str
    ) -> Dict[str, Any]:
        """메시지 전송"""
        room = self.get_room(room_id)
        
        if not room:
            return {
                'success': False,
                'error': 'Room not found'
            }
        
        # 메시지 추가
        chat_message = {
            'id': str(uuid.uuid4()),
            'user_id': user_id,
            'message': message,
            'timestamp': datetime.now().isoformat()
        }
        
        room['chat'].append(chat_message)
        
        # 최근 100개만 유지
        if len(room['chat']) > 100:
            room['chat'] = room['chat'][-100:]
        
        # 저장
        self._save_room(room)
        if room_id in self.active_rooms:
            self.active_rooms[room_id] = room
        
        return {
            'success': True,
            'message': chat_message
        }
    
    def share_content(
        self,
        room_id: str,
        user_id: str,
        content: Dict[str, Any]
    ) -> Dict[str, Any]:
        """콘텐츠 공유"""
        room = self.get_room(room_id)
        
        if not room:
            return {
                'success': False,
                'error': 'Room not found'
            }
        
        shared_item = {
            'id': str(uuid.uuid4()),
            'user_id': user_id,
            'content': content,
            'timestamp': datetime.now().isoformat()
        }
        
        room['shared_content'].append(shared_item)
        
        # 최근 50개만 유지
        if len(room['shared_content']) > 50:
            room['shared_content'] = room['shared_content'][-50:]
        
        # 저장
        self._save_room(room)
        if room_id in self.active_rooms:
            self.active_rooms[room_id] = room
        
        return {
            'success': True,
            'shared_item': shared_item
        }
    
    def get_room(self, room_id: str) -> Optional[Dict[str, Any]]:
        """공간 조회"""
        # 활성 공간에서 먼저 확인
        if room_id in self.active_rooms:
            return self.active_rooms[room_id]
        
        # 파일에서 로드
        file_path = os.path.join(self.storage_dir, f"{room_id}.json")
        
        if not os.path.exists(file_path):
            return None
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                room = json.load(f)
                self.active_rooms[room_id] = room
                return room
        except Exception as e:
            logger.error(f"Failed to load room {room_id}: {e}")
            return None
    
    def list_rooms(self, privacy: str = 'public') -> List[Dict[str, Any]]:
        """공간 목록 조회"""
        rooms = []
        
        for filename in os.listdir(self.storage_dir):
            if not filename.endswith('.json'):
                continue
            
            room_id = filename[:-5]
            room = self.get_room(room_id)
            
            if room and room['settings']['privacy'] == privacy:
                rooms.append({
                    'id': room['id'],
                    'name': room['name'],
                    'description': room['description'],
                    'user_count': len(room['users']),
                    'created_at': room['metadata']['created_at']
                })
        
        rooms.sort(key=lambda x: x['created_at'], reverse=True)
        return rooms
    
    def _save_room(self, room: Dict[str, Any]):
        """공간 저장"""
        file_path = os.path.join(self.storage_dir, f"{room['id']}.json")
        try:
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(room, f, ensure_ascii=False, indent=2)
        except Exception as e:
            logger.error(f"Failed to save room {room['id']}: {e}")
