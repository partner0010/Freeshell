"""
모니터링 서비스
"""

import os
import subprocess
import psutil
from typing import Dict, Any, List
from datetime import datetime
import json

from ..utils.logger import get_logger

logger = get_logger(__name__)


class MonitoringService:
    """플랫폼 모니터링 서비스"""
    
    def __init__(self):
        self.log_dir = "storage/logs"
        os.makedirs(self.log_dir, exist_ok=True)
    
    def get_system_status(self) -> Dict[str, Any]:
        """시스템 상태 조회"""
        try:
            # CPU 사용률
            cpu_percent = psutil.cpu_percent(interval=1)
            
            # 메모리 사용률
            memory = psutil.virtual_memory()
            
            # 디스크 사용률
            disk = psutil.disk_usage('/')
            
            # 네트워크 상태
            network = psutil.net_io_counters()
            
            return {
                'success': True,
                'timestamp': datetime.now().isoformat(),
                'cpu': {
                    'percent': cpu_percent,
                    'count': psutil.cpu_count()
                },
                'memory': {
                    'total': memory.total,
                    'available': memory.available,
                    'percent': memory.percent,
                    'used': memory.used
                },
                'disk': {
                    'total': disk.total,
                    'used': disk.used,
                    'free': disk.free,
                    'percent': (disk.used / disk.total) * 100
                },
                'network': {
                    'bytes_sent': network.bytes_sent,
                    'bytes_recv': network.bytes_recv
                }
            }
        except Exception as e:
            logger.error(f"System status error: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def check_ai_connections(self) -> Dict[str, Any]:
        """AI 연결 상태 확인"""
        connections = {
            'ollama': False,
            'huggingface': False,
            'openai': False
        }
        
        # Ollama 확인
        try:
            import httpx
            with httpx.Client() as client:
                response = client.get('http://localhost:11434/api/tags', timeout=2)
                if response.status_code == 200:
                    connections['ollama'] = True
        except:
            pass
        
        # HuggingFace 확인
        try:
            import httpx
            with httpx.Client() as client:
                response = client.get('https://api-inference.huggingface.co', timeout=2)
                if response.status_code in [200, 401, 403]:  # 연결은 되지만 인증 필요
                    connections['huggingface'] = True
        except:
            pass
        
        return {
            'success': True,
            'connections': connections,
            'timestamp': datetime.now().isoformat()
        }
    
    def check_vulnerabilities(self) -> Dict[str, Any]:
        """취약점 확인"""
        vulnerabilities = []
        
        # 1. 환경 변수 노출 확인
        if os.getenv('SECRET_KEY') == 'default_secret':
            vulnerabilities.append({
                'type': 'security',
                'severity': 'high',
                'message': 'Default SECRET_KEY is being used'
            })
        
        # 2. 디렉토리 권한 확인
        storage_dirs = ['storage/videos', 'storage/users', 'storage/archive']
        for dir_path in storage_dirs:
            if os.path.exists(dir_path):
                stat = os.stat(dir_path)
                if stat.st_mode & 0o777 == 0o777:  # 모든 권한
                    vulnerabilities.append({
                        'type': 'permission',
                        'severity': 'medium',
                        'message': f'Directory {dir_path} has overly permissive permissions'
                    })
        
        # 3. FFmpeg 설치 확인
        try:
            subprocess.run(['ffmpeg', '-version'], capture_output=True, timeout=2)
        except:
            vulnerabilities.append({
                'type': 'dependency',
                'severity': 'high',
                'message': 'FFmpeg is not installed or not in PATH'
            })
        
        return {
            'success': True,
            'vulnerabilities': vulnerabilities,
            'count': len(vulnerabilities),
            'timestamp': datetime.now().isoformat()
        }
    
    def check_malware(self) -> Dict[str, Any]:
        """악성 코드 탐지 (기본 검사)"""
        threats = []
        
        # 1. 의심스러운 파일 패턴 확인
        suspicious_patterns = ['.exe', '.bat', '.sh', '.pyc']
        storage_dir = 'storage'
        
        if os.path.exists(storage_dir):
            for root, dirs, files in os.walk(storage_dir):
                for file in files:
                    if any(file.endswith(pattern) for pattern in suspicious_patterns):
                        threats.append({
                            'type': 'suspicious_file',
                            'severity': 'low',
                            'file': os.path.join(root, file),
                            'message': f'Suspicious file found: {file}'
                        })
        
        return {
            'success': True,
            'threats': threats,
            'count': len(threats),
            'timestamp': datetime.now().isoformat()
        }
    
    def get_service_health(self) -> Dict[str, Any]:
        """서비스 헬스 체크"""
        services = {
            'shortform_service': True,
            'orchestrator': True,
            'motion_service': True
        }
        
        # 각 서비스 파일 존재 확인
        service_files = {
            'shortform_service': 'backend/services/shortform_service.py',
            'orchestrator': 'backend/orchestrator/orchestrator.py',
            'motion_service': 'backend/services/motion_service.py'
        }
        
        for service, file_path in service_files.items():
            if not os.path.exists(file_path):
                services[service] = False
        
        return {
            'success': True,
            'services': services,
            'all_healthy': all(services.values()),
            'timestamp': datetime.now().isoformat()
        }
    
    def get_platform_stats(self) -> Dict[str, Any]:
        """플랫폼 통계"""
        stats = {
            'total_users': 0,
            'total_videos': 0,
            'total_archives': 0,
            'total_characters': 0
        }
        
        # 사용자 수
        users_dir = 'storage/users'
        if os.path.exists(users_dir):
            stats['total_users'] = len([f for f in os.listdir(users_dir) if f.endswith('.json')])
        
        # 비디오 수
        videos_dir = 'storage/videos'
        if os.path.exists(videos_dir):
            stats['total_videos'] = len([f for f in os.listdir(videos_dir) if f.endswith('.mp4')])
        
        # Archive 수
        archive_dir = 'storage/archive'
        if os.path.exists(archive_dir):
            stats['total_archives'] = len([f for f in os.listdir(archive_dir) if f.endswith('.json')])
        
        # 캐릭터 수
        characters_dir = 'storage/characters'
        if os.path.exists(characters_dir):
            stats['total_characters'] = len([f for f in os.listdir(characters_dir) if f.endswith('.json')])
        
        return {
            'success': True,
            'stats': stats,
            'timestamp': datetime.now().isoformat()
        }
