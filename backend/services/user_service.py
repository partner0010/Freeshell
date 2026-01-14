"""
사용자 서비스
"""

import os
import json
from typing import Optional, Dict, Any
from datetime import datetime
import uuid

from ..models.user import User, UserRole
from ..utils.security import SecurityManager
from ..utils.logger import get_logger

logger = get_logger(__name__)


class UserService:
    """사용자 서비스"""
    
    def __init__(self, storage_dir: str = "storage/users"):
        self.storage_dir = storage_dir
        os.makedirs(storage_dir, exist_ok=True)
        self.security_manager = SecurityManager()
    
    def create_user(self, email: str, username: str, password: str, role: UserRole = UserRole.USER) -> Dict[str, Any]:
        """사용자 생성"""
        try:
            # 이메일 중복 확인
            if self.get_user_by_email(email):
                return {
                    'success': False,
                    'error': 'Email already exists'
                }
            
            # 사용자 생성
            user_id = str(uuid.uuid4())
            hashed_password = self.security_manager.hash_password(password)
            
            user = {
                'id': user_id,
                'email': email,
                'username': username,
                'password_hash': hashed_password,
                'role': role.value,
                'created_at': datetime.now().isoformat(),
                'last_login': None,
                'is_active': True
            }
            
            # 저장
            self._save_user(user)
            
            logger.info(f"User created: {user_id} ({email})")
            
            return {
                'success': True,
                'user_id': user_id,
                'user': {
                    'id': user_id,
                    'email': email,
                    'username': username,
                    'role': role.value
                }
            }
            
        except Exception as e:
            logger.error(f"User creation error: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def authenticate_user(self, email: str, password: str) -> Optional[Dict[str, Any]]:
        """사용자 인증"""
        try:
            user_data = self.get_user_by_email(email)
            if not user_data:
                return None
            
            # 비밀번호 검증
            if not self.security_manager.verify_password(password, user_data['password_hash']):
                return None
            
            # 마지막 로그인 업데이트
            user_data['last_login'] = datetime.now().isoformat()
            self._save_user(user_data)
            
            # 토큰 생성
            token = self.security_manager.create_access_token({
                'sub': user_data['id'],
                'email': user_data['email'],
                'role': user_data['role']
            })
            
            return {
                'user_id': user_data['id'],
                'email': user_data['email'],
                'username': user_data['username'],
                'role': user_data['role'],
                'access_token': token
            }
            
        except Exception as e:
            logger.error(f"Authentication error: {e}")
            return None
    
    def get_user(self, user_id: str) -> Optional[Dict[str, Any]]:
        """사용자 조회"""
        file_path = os.path.join(self.storage_dir, f"{user_id}.json")
        
        if not os.path.exists(file_path):
            return None
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                user_data = json.load(f)
                # 비밀번호 해시 제거
                user_data.pop('password_hash', None)
                return user_data
        except Exception as e:
            logger.error(f"Failed to load user {user_id}: {e}")
            return None
    
    def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """이메일로 사용자 조회"""
        for filename in os.listdir(self.storage_dir):
            if not filename.endswith('.json'):
                continue
            
            user_id = filename[:-5]
            user_data = self.get_user(user_id)
            
            if user_data and user_data.get('email') == email:
                return self._load_user_with_password(user_id)
        
        return None
    
    def is_admin(self, user_id: str) -> bool:
        """관리자 여부 확인"""
        user = self.get_user(user_id)
        if not user:
            return False
        return user.get('role') == UserRole.ADMIN.value
    
    def _load_user_with_password(self, user_id: str) -> Optional[Dict[str, Any]]:
        """비밀번호 포함 사용자 로드"""
        file_path = os.path.join(self.storage_dir, f"{user_id}.json")
        
        if not os.path.exists(file_path):
            return None
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Failed to load user {user_id}: {e}")
            return None
    
    def _save_user(self, user_data: Dict[str, Any]):
        """사용자 저장"""
        file_path = os.path.join(self.storage_dir, f"{user_data['id']}.json")
        try:
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(user_data, f, ensure_ascii=False, indent=2)
        except Exception as e:
            logger.error(f"Failed to save user {user_data['id']}: {e}")
