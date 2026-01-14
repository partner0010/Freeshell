"""
작업 관리 모듈
작업 상태 저장 및 조회
"""

from typing import Dict, Any, Optional
import json
import os
from datetime import datetime, timedelta
from ..config import settings

class JobManager:
    def __init__(self):
        self.jobs: Dict[str, Dict[str, Any]] = {}
        self.job_storage_path = settings.JOB_STORAGE_PATH
        os.makedirs(self.job_storage_path, exist_ok=True)
        self._load_jobs()
    
    def _load_jobs(self):
        """저장된 작업 로드"""
        if not os.path.exists(self.job_storage_path):
            return
        
        for filename in os.listdir(self.job_storage_path):
            if filename.endswith('.json'):
                job_id = filename[:-5]
                job_file = os.path.join(self.job_storage_path, filename)
                try:
                    with open(job_file, 'r') as f:
                        job = json.load(f)
                        self.jobs[job_id] = job
                except Exception as e:
                    print(f"Error loading job {job_id}: {e}")
    
    def create_job(self, job_id: str, initial_data: Dict[str, Any]):
        """작업 생성"""
        job = {
            'id': job_id,
            'status': 'pending',
            'progress': 0,
            'createdAt': datetime.now().isoformat(),
            'updatedAt': datetime.now().isoformat(),
            **initial_data
        }
        
        self.jobs[job_id] = job
        self._save_job(job_id, job)
    
    def get_job(self, job_id: str) -> Optional[Dict[str, Any]]:
        """작업 조회"""
        if job_id in self.jobs:
            return self.jobs[job_id]
        
        # 파일에서 로드 시도
        job_file = os.path.join(self.job_storage_path, f"{job_id}.json")
        if os.path.exists(job_file):
            try:
                with open(job_file, 'r') as f:
                    job = json.load(f)
                    self.jobs[job_id] = job
                    return job
            except Exception as e:
                print(f"Error loading job {job_id}: {e}")
        
        return None
    
    def update_job(self, job_id: str, updates: Dict[str, Any]):
        """작업 업데이트"""
        if job_id not in self.jobs:
            return
        
        self.jobs[job_id].update(updates)
        self.jobs[job_id]['updatedAt'] = datetime.now().isoformat()
        self._save_job(job_id, self.jobs[job_id])
    
    def _save_job(self, job_id: str, job: Dict[str, Any]):
        """작업을 파일에 저장"""
        job_file = os.path.join(self.job_storage_path, f"{job_id}.json")
        try:
            with open(job_file, 'w') as f:
                json.dump(job, f, indent=2)
        except Exception as e:
            print(f"Error saving job {job_id}: {e}")
    
    def cleanup_old_jobs(self, days: int = 7):
        """오래된 작업 정리"""
        cutoff = datetime.now() - timedelta(days=days)
        
        for job_id, job in list(self.jobs.items()):
            created_at_str = job.get('createdAt', '')
            if not created_at_str:
                continue
            
            try:
                created_at = datetime.fromisoformat(created_at_str)
                if created_at < cutoff:
                    del self.jobs[job_id]
                    
                    job_file = os.path.join(self.job_storage_path, f"{job_id}.json")
                    if os.path.exists(job_file):
                        os.remove(job_file)
                    
                    # 비디오 파일도 삭제
                    video_path = job.get('videoPath')
                    if video_path and os.path.exists(video_path):
                        try:
                            os.remove(video_path)
                        except Exception:
                            pass
            except Exception as e:
                print(f"Error cleaning up job {job_id}: {e}")

# 싱글톤 인스턴스
_manager_instance: Optional[JobManager] = None

def get_job_manager() -> JobManager:
    """Job Manager 인스턴스 반환"""
    global _manager_instance
    if _manager_instance is None:
        _manager_instance = JobManager()
    return _manager_instance
