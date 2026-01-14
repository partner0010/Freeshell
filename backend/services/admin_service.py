"""
관리자 서비스
"""

import os
import json
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta

from ..services.user_service import UserService
from ..services.monitoring_service import MonitoringService
from ..utils.logger import get_logger

logger = get_logger(__name__)


class AdminService:
    """관리자 서비스"""
    
    def __init__(self):
        self.user_service = UserService()
        self.monitoring_service = MonitoringService()
    
    def get_all_users(self, page: int = 1, page_size: int = 20) -> Dict[str, Any]:
        """모든 사용자 조회"""
        try:
            users_dir = 'storage/users'
            if not os.path.exists(users_dir):
                return {
                    'success': True,
                    'users': [],
                    'total': 0,
                    'page': page,
                    'page_size': page_size
                }
            
            users = []
            for filename in os.listdir(users_dir):
                if not filename.endswith('.json'):
                    continue
                
                user_id = filename[:-5]
                user = self.user_service.get_user(user_id)
                if user:
                    users.append(user)
            
            # 정렬 (최신순)
            users.sort(key=lambda x: x.get('created_at', ''), reverse=True)
            
            # 페이지네이션
            total = len(users)
            start = (page - 1) * page_size
            end = start + page_size
            paginated_users = users[start:end]
            
            return {
                'success': True,
                'users': paginated_users,
                'total': total,
                'page': page,
                'page_size': page_size,
                'total_pages': (total + page_size - 1) // page_size
            }
            
        except Exception as e:
            logger.error(f"Get all users error: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def update_user_role(self, user_id: str, role: str) -> Dict[str, Any]:
        """사용자 역할 변경"""
        try:
            user_data = self.user_service._load_user_with_password(user_id)
            if not user_data:
                return {
                    'success': False,
                    'error': 'User not found'
                }
            
            user_data['role'] = role
            user_data['updated_at'] = datetime.now().isoformat()
            self.user_service._save_user(user_data)
            
            logger.info(f"User role updated: {user_id} -> {role}")
            
            return {
                'success': True,
                'user_id': user_id,
                'role': role
            }
            
        except Exception as e:
            logger.error(f"Update user role error: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def deactivate_user(self, user_id: str) -> Dict[str, Any]:
        """사용자 비활성화"""
        try:
            user_data = self.user_service._load_user_with_password(user_id)
            if not user_data:
                return {
                    'success': False,
                    'error': 'User not found'
                }
            
            user_data['is_active'] = False
            user_data['deactivated_at'] = datetime.now().isoformat()
            self.user_service._save_user(user_data)
            
            logger.info(f"User deactivated: {user_id}")
            
            return {
                'success': True,
                'user_id': user_id
            }
            
        except Exception as e:
            logger.error(f"Deactivate user error: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def get_platform_dashboard(self) -> Dict[str, Any]:
        """플랫폼 대시보드 데이터"""
        try:
            # 시스템 상태
            system_status = self.monitoring_service.get_system_status()
            
            # AI 연결 상태
            ai_connections = self.monitoring_service.check_ai_connections()
            
            # 취약점 확인
            vulnerabilities = self.monitoring_service.check_vulnerabilities()
            
            # 악성 코드 탐지
            malware = self.monitoring_service.check_malware()
            
            # 서비스 헬스
            service_health = self.monitoring_service.get_service_health()
            
            # 플랫폼 통계
            platform_stats = self.monitoring_service.get_platform_stats()
            
            return {
                'success': True,
                'timestamp': datetime.now().isoformat(),
                'system': system_status,
                'ai_connections': ai_connections,
                'vulnerabilities': vulnerabilities,
                'malware': malware,
                'service_health': service_health,
                'platform_stats': platform_stats
            }
            
        except Exception as e:
            logger.error(f"Get dashboard error: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def get_recent_activities(self, limit: int = 50) -> Dict[str, Any]:
        """최근 활동 조회"""
        try:
            activities = []
            
            # 로그 파일에서 활동 추출 (간단한 구현)
            log_file = os.path.join(self.monitoring_service.log_dir, 'activity.log')
            if os.path.exists(log_file):
                with open(log_file, 'r', encoding='utf-8') as f:
                    lines = f.readlines()
                    for line in lines[-limit:]:
                        if 'INFO' in line or 'WARNING' in line:
                            activities.append({
                                'message': line.strip(),
                                'timestamp': datetime.now().isoformat()
                            })
            
            return {
                'success': True,
                'activities': activities[-limit:],
                'count': len(activities)
            }
            
        except Exception as e:
            logger.error(f"Get recent activities error: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def clear_storage(self, storage_type: str) -> Dict[str, Any]:
        """저장소 정리"""
        try:
            storage_dirs = {
                'videos': 'storage/videos',
                'temp': 'storage/videos/temp',
                'motion': 'storage/motion_videos',
                'logs': 'storage/logs'
            }
            
            if storage_type not in storage_dirs:
                return {
                    'success': False,
                    'error': f'Invalid storage type: {storage_type}'
                }
            
            target_dir = storage_dirs[storage_type]
            if os.path.exists(target_dir):
                import shutil
                for filename in os.listdir(target_dir):
                    file_path = os.path.join(target_dir, filename)
                    if os.path.isfile(file_path):
                        os.remove(file_path)
                
                logger.info(f"Storage cleared: {storage_type}")
                
                return {
                    'success': True,
                    'storage_type': storage_type,
                    'cleared_at': datetime.now().isoformat()
                }
            
            return {
                'success': False,
                'error': 'Storage directory not found'
            }
            
        except Exception as e:
            logger.error(f"Clear storage error: {e}")
            return {
                'success': False,
                'error': str(e)
            }
