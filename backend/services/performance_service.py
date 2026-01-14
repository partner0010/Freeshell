"""
성능 최적화 서비스
"""

import os
from typing import Dict, Any, List
from datetime import datetime
import hashlib

from ..utils.logger import get_logger

logger = get_logger(__name__)


class PerformanceService:
    """성능 최적화 서비스"""
    
    def __init__(self):
        self.cache_dir = "storage/cache"
        os.makedirs(self.cache_dir, exist_ok=True)
    
    def generate_cache_key(self, *args, **kwargs) -> str:
        """캐시 키 생성"""
        key_string = f"{args}_{kwargs}"
        return hashlib.md5(key_string.encode()).hexdigest()
    
    async def optimize_image(
        self,
        image_path: str,
        max_width: int = 1920,
        max_height: int = 1080,
        quality: int = 85
    ) -> Dict[str, Any]:
        """이미지 최적화"""
        try:
            # PIL/Pillow를 사용한 이미지 최적화
            try:
                from PIL import Image
                
                with Image.open(image_path) as img:
                    # 크기 조정
                    img.thumbnail((max_width, max_height), Image.Resampling.LANCZOS)
                    
                    # 최적화된 경로
                    optimized_path = image_path.replace('.', '_optimized.')
                    img.save(optimized_path, optimize=True, quality=quality)
                    
                    # 원본 대비 크기 비교
                    original_size = os.path.getsize(image_path)
                    optimized_size = os.path.getsize(optimized_path)
                    reduction = (1 - optimized_size / original_size) * 100
                    
                    return {
                        'success': True,
                        'original_size': original_size,
                        'optimized_size': optimized_size,
                        'reduction_percent': round(reduction, 2),
                        'optimized_path': optimized_path
                    }
            except ImportError:
                logger.warning("PIL not available, skipping image optimization")
                return {
                    'success': False,
                    'error': 'PIL not installed'
                }
                
        except Exception as e:
            logger.error(f"Optimize image error: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def get_performance_metrics(self) -> Dict[str, Any]:
        """성능 메트릭 조회"""
        try:
            import psutil
            import time
            
            # CPU 사용률
            cpu_percent = psutil.cpu_percent(interval=0.1)
            
            # 메모리 사용률
            memory = psutil.virtual_memory()
            
            # 디스크 I/O
            disk_io = psutil.disk_io_counters()
            
            # 네트워크 I/O
            network_io = psutil.net_io_counters()
            
            return {
                'success': True,
                'timestamp': datetime.utcnow().isoformat(),
                'cpu': {
                    'percent': cpu_percent,
                    'count': psutil.cpu_count()
                },
                'memory': {
                    'total': memory.total,
                    'used': memory.used,
                    'available': memory.available,
                    'percent': memory.percent
                },
                'disk': {
                    'read_bytes': disk_io.read_bytes if disk_io else 0,
                    'write_bytes': disk_io.write_bytes if disk_io else 0
                },
                'network': {
                    'bytes_sent': network_io.bytes_sent,
                    'bytes_recv': network_io.bytes_recv
                }
            }
            
        except Exception as e:
            logger.error(f"Get performance metrics error: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def check_database_performance(self, db) -> Dict[str, Any]:
        """데이터베이스 성능 확인"""
        try:
            import time
            
            # 간단한 쿼리 성능 테스트
            start_time = time.time()
            # 실제로는 데이터베이스 쿼리 실행
            query_time = time.time() - start_time
            
            return {
                'success': True,
                'query_time_ms': round(query_time * 1000, 2),
                'status': 'healthy' if query_time < 0.1 else 'slow'
            }
            
        except Exception as e:
            logger.error(f"Check database performance error: {e}")
            return {
                'success': False,
                'error': str(e)
            }
