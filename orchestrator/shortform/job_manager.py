"""
Job 관리자
"""

from typing import Dict, Any, Optional
from datetime import datetime
from dataclasses import dataclass, field, asdict
import json
import os

from ..utils.logger import get_logger

logger = get_logger(__name__)


@dataclass
class Job:
    """작업 정보"""
    job_id: str
    user_id: str
    prompt: str
    duration: int
    style: str
    status: str = "pending"  # pending, processing, completed, failed
    progress: float = 0.0
    message: Optional[str] = None
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)
    
    def to_dict(self) -> Dict[str, Any]:
        """딕셔너리로 변환"""
        data = asdict(self)
        data['created_at'] = self.created_at.isoformat()
        data['updated_at'] = self.updated_at.isoformat()
        return data


class JobManager:
    """Job 관리자"""
    
    def __init__(self, storage_path: str = "storage/jobs"):
        self.storage_path = storage_path
        self.jobs: Dict[str, Job] = {}
        os.makedirs(storage_path, exist_ok=True)
    
    def create_job(
        self,
        job_id: str,
        user_id: str,
        prompt: str,
        duration: int,
        style: str
    ) -> Job:
        """작업 생성"""
        job = Job(
            job_id=job_id,
            user_id=user_id,
            prompt=prompt,
            duration=duration,
            style=style
        )
        
        self.jobs[job_id] = job
        self._save_job(job)
        
        logger.info(f"Job created: {job_id}")
        return job
    
    def get_job(self, job_id: str) -> Optional[Dict[str, Any]]:
        """작업 조회"""
        if job_id in self.jobs:
            return self.jobs[job_id].to_dict()
        
        # 파일에서 로드 시도
        job = self._load_job(job_id)
        if job:
            self.jobs[job_id] = job
            return job.to_dict()
        
        return None
    
    def update_job_status(
        self,
        job_id: str,
        status: str,
        progress: float,
        message: Optional[str] = None,
        result: Optional[Dict[str, Any]] = None,
        error: Optional[str] = None
    ):
        """작업 상태 업데이트"""
        if job_id not in self.jobs:
            logger.warning(f"Job not found: {job_id}")
            return
        
        job = self.jobs[job_id]
        job.status = status
        job.progress = progress
        job.message = message
        job.result = result
        job.error = error
        job.updated_at = datetime.now()
        
        self._save_job(job)
        logger.info(f"Job {job_id} updated: {status} ({progress}%)")
    
    def _save_job(self, job: Job):
        """작업 저장"""
        file_path = os.path.join(self.storage_path, f"{job.job_id}.json")
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(job.to_dict(), f, ensure_ascii=False, indent=2)
    
    def _load_job(self, job_id: str) -> Optional[Job]:
        """작업 로드"""
        file_path = os.path.join(self.storage_path, f"{job_id}.json")
        if not os.path.exists(file_path):
            return None
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            job = Job(
                job_id=data['job_id'],
                user_id=data['user_id'],
                prompt=data['prompt'],
                duration=data['duration'],
                style=data['style'],
                status=data['status'],
                progress=data['progress'],
                message=data.get('message'),
                result=data.get('result'),
                error=data.get('error'),
                created_at=datetime.fromisoformat(data['created_at']),
                updated_at=datetime.fromisoformat(data['updated_at'])
            )
            
            return job
        except Exception as e:
            logger.error(f"Error loading job {job_id}: {e}")
            return None
