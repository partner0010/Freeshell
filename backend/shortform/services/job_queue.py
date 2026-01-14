"""
Job Queue 구조
비동기 작업 큐 관리
"""

import asyncio
import logging
from typing import Dict, Any, Optional
from datetime import datetime
import os

from ..services.prompt_refiner import refine_prompt
from ..services.script_generator import generate_script
from ..services.scene_generator import generate_scene_json
from ..services.character_generator import generate_characters
from ..services.tts_generator import generate_voices
from ..services.subtitle_generator import generate_subtitles
from ..services.video_renderer import render_video
from ..services.job_manager import JobManager, get_job_manager
from ..config import settings

logger = logging.getLogger(__name__)

class JobQueue:
    def __init__(self):
        self.queue: asyncio.Queue = asyncio.Queue()
        self.processing: set[str] = set()
        self.max_concurrent = settings.MAX_CONCURRENT_JOBS
        self.worker_task: Optional[asyncio.Task] = None
        self._worker_started = False
    
    def start_worker(self):
        """워커 태스크 시작 (FastAPI startup에서 호출)"""
        if not self._worker_started:
            self.worker_task = asyncio.create_task(self._worker_loop())
            self._worker_started = True
            logger.info("Job queue worker started")
    
    async def _worker_loop(self):
        """워커 루프"""
        while True:
            try:
                # 큐에서 작업 가져오기
                if self.queue.empty():
                    await asyncio.sleep(1)
                    continue
                
                # 동시 처리 제한 확인
                if len(self.processing) >= self.max_concurrent:
                    await asyncio.sleep(1)
                    continue
                
                # 작업 가져오기
                job_data = await asyncio.wait_for(self.queue.get(), timeout=1.0)
                job_id = job_data['jobId']
                
                # 처리 시작
                self.processing.add(job_id)
                asyncio.create_task(self._process_job(job_id, job_data))
                
            except asyncio.TimeoutError:
                continue
            except Exception as e:
                logger.error(f"Worker loop error: {e}")
                await asyncio.sleep(1)
    
    async def _process_job(self, job_id: str, job_data: Dict[str, Any]):
        """작업 처리"""
        manager = get_job_manager()
        
        try:
            logger.info(f"Processing job {job_id}")
            
            # 단계 2: 프롬프트 정제
            manager.update_job(job_id, {
                'status': 'processing',
                'progress': 10,
                'currentStep': 'refining-prompt'
            })
            refined_prompt = refine_prompt(
                job_data['userPrompt'],
                job_data['style'],
                job_data['duration']
            )
            
            # 단계 3: 스크립트 생성
            manager.update_job(job_id, {
                'progress': 20,
                'currentStep': 'generating-script'
            })
            script = await generate_script(refined_prompt)
            
            # 단계 4: Scene JSON 생성
            manager.update_job(job_id, {
                'progress': 30,
                'currentStep': 'generating-scenes'
            })
            scenes = await generate_scene_json(script, job_data['style'], job_data['duration'])
            
            # 단계 5: 캐릭터 메타 생성
            manager.update_job(job_id, {
                'progress': 40,
                'currentStep': 'generating-characters'
            })
            characters = await generate_characters(scenes, job_data['style'])
            
            # 단계 6: TTS 음성 생성
            manager.update_job(job_id, {
                'progress': 50,
                'currentStep': 'generating-voices'
            })
            voice_files = await generate_voices(scenes, characters)
            
            # 단계 7: 자막 생성
            manager.update_job(job_id, {
                'progress': 60,
                'currentStep': 'generating-subtitles'
            })
            subtitles = await generate_subtitles(scenes)
            
            # 단계 8: FFmpeg 렌더링
            manager.update_job(job_id, {
                'progress': 70,
                'currentStep': 'rendering-video'
            })
            video_path = await render_video(scenes, characters, voice_files, subtitles, job_id, job_data['style'])
            
            # 단계 9: 결과 저장
            manager.update_job(job_id, {
                'status': 'completed',
                'progress': 100,
                'currentStep': 'completed',
                'videoPath': video_path,
                'completedAt': datetime.now().isoformat()
            })
            
            logger.info(f"Job {job_id} completed")
            
        except Exception as e:
            logger.error(f"Job {job_id} failed: {e}")
            manager.update_job(job_id, {
                'status': 'failed',
                'error': str(e),
                'failedAt': datetime.now().isoformat()
            })
        finally:
            self.processing.discard(job_id)
    
    async def enqueue(self, job_id: str, job_data: Dict[str, Any]):
        """작업을 큐에 추가"""
        await self.queue.put({
            'jobId': job_id,
            **job_data
        })
        logger.info(f"Job {job_id} enqueued")
    
    def get_queue_size(self) -> int:
        """큐 크기 반환"""
        return self.queue.qsize()
    
    def get_processing_count(self) -> int:
        """처리 중인 작업 수 반환"""
        return len(self.processing)

# 싱글톤 인스턴스
_queue_instance: Optional[JobQueue] = None

def get_job_queue() -> JobQueue:
    """Job Queue 인스턴스 반환"""
    global _queue_instance
    if _queue_instance is None:
        _queue_instance = JobQueue()
    return _queue_instance
