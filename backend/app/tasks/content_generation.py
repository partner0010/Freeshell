"""
콘텐츠 생성 Celery 태스크
"""

import uuid
import time
from typing import Dict, Any, Optional
from celery import Task
from celery.result import AsyncResult

from ..core.celery_app import celery_app
from ..services.ai_orchestrator import AIOrchestrator
from ..services.image_generator import ImageGenerator, ImageGenerationRequest, ImageStyle, ImageProvider
from ..services.audio_generator import AudioGenerator, AudioGenerationRequest, VoiceGender, EmotionTone
from ..services.video_composer import (
    VideoComposer,
    VideoCompositionRequest,
    VideoScene,
    TransitionEffect,
    VideoProvider,
)
from ..utils.logger import get_logger
from ..schemas.content import Resolution, ContentGenerationOptions

logger = get_logger(__name__)

# Redis를 사용한 진행률 저장 (간단한 구현)
try:
    import redis
    redis_url = celery_app.conf.broker_url or "redis://localhost:6379/0"
    redis_client = redis.Redis.from_url(
        redis_url,
        decode_responses=True,
    )
except Exception as e:
    logger.warning(f"Redis client not available: {e}")
    redis_client = None


def update_progress(job_id: str, progress: int, status: str, data: Optional[Dict[str, Any]] = None):
    """진행률 업데이트"""
    if redis_client:
        try:
            redis_client.setex(
                f"job:{job_id}:progress",
                3600,  # 1시간 TTL
                str(progress),
            )
            redis_client.setex(
                f"job:{job_id}:status",
                3600,
                status,
            )
            if data:
                import json
                redis_client.setex(
                    f"job:{job_id}:data",
                    3600,
                    json.dumps(data),
                )
        except Exception as e:
            logger.error(f"Failed to update progress: {e}")


def get_progress(job_id: str) -> Dict[str, Any]:
    """진행률 조회"""
    if not redis_client:
        return {"progress": 0, "status": "unknown", "data": None}
    
    try:
        progress = redis_client.get(f"job:{job_id}:progress")
        status = redis_client.get(f"job:{job_id}:status")
        data = redis_client.get(f"job:{job_id}:data")
        
        result = {
            "progress": int(progress) if progress else 0,
            "status": status if status else "unknown",
            "data": None,
        }
        
        if data:
            import json
            result["data"] = json.loads(data)
        
        return result
    except Exception as e:
        logger.error(f"Failed to get progress: {e}")
        return {"progress": 0, "status": "unknown", "data": None}


class CallbackTask(Task):
    """콜백이 있는 태스크"""
    
    def on_success(self, retval, task_id, args, kwargs):
        """성공 시 콜백"""
        logger.info(f"Task {task_id} succeeded")
    
    def on_failure(self, exc, task_id, args, kwargs, einfo):
        """실패 시 콜백"""
        logger.error(f"Task {task_id} failed: {exc}")
        update_progress(task_id, 0, "failed", {"error": str(exc)})


@celery_app.task(
    bind=True,
    base=CallbackTask,
    name="generate_content",
)
def generate_content_task(
    self,
    project_id: str,
    prompt_analysis_id: str,
    options: Dict[str, Any],
) -> Dict[str, Any]:
    """
    콘텐츠 생성 태스크
    
    Args:
        self: Celery 태스크 인스턴스
        project_id: 프로젝트 ID
        prompt_analysis_id: 프롬프트 분석 ID
        options: 생성 옵션
        
    Returns:
        생성 결과
    """
    job_id = self.request.id
    logger.info(f"Starting content generation task {job_id}")
    
    try:
        # 옵션 파싱
        gen_options = ContentGenerationOptions(**options)
        
        # 해상도 설정
        if gen_options.resolution == Resolution.P720:
            width, height = 1280, 720
        else:
            width, height = 1920, 1080
        
        # 진행률 업데이트
        update_progress(job_id, 5, "processing", {"stage": "initializing"})
        
        # 1. 프롬프트 분석 데이터 조회 (실제로는 DB에서 조회)
        # 여기서는 예시로 AI Orchestrator 사용
        orchestrator = AIOrchestrator()
        
        # 분석 데이터는 이미 있다고 가정하고, 계획과 스크립트만 생성
        # 실제로는 DB에서 prompt_analysis_id로 조회
        
        update_progress(job_id, 10, "processing", {"stage": "analyzing_prompt"})
        
        # 2. 이미지 생성
        update_progress(job_id, 20, "processing", {"stage": "generating_images"})
        
        image_generator = ImageGenerator()
        image_results = []
        
        # 예시: 3개 씬 이미지 생성
        scene_prompts = [
            "카페 외관, 따뜻한 조명",
            "카페 내부, 아늑한 분위기",
            "커피 제조 과정, 전문적",
        ]
        
        for i, prompt in enumerate(scene_prompts):
            img_request = ImageGenerationRequest(
                prompt=prompt,
                style=ImageStyle.REALISTIC,
                width=width,
                height=height,
                num_images=1,
            )
            
            try:
                img_result = image_generator.generate(
                    img_request,
                    provider=ImageProvider.REPLICATE,
                    upload_to_s3=True,
                )
                image_results.extend(img_result)
                update_progress(
                    job_id,
                    20 + (i + 1) * 20 // len(scene_prompts),
                    "processing",
                    {"stage": "generating_images", "current": i + 1, "total": len(scene_prompts)},
                )
            except Exception as e:
                logger.error(f"Failed to generate image {i + 1}: {e}")
                raise
        
        # 3. 오디오 생성
        if gen_options.with_audio:
            update_progress(job_id, 60, "processing", {"stage": "generating_audio"})
            
            audio_generator = AudioGenerator()
            
            # 예시: 내레이션 텍스트
            narration_texts = [
                "안녕하세요. 오늘은 특별한 카페를 소개합니다.",
                "따뜻한 조명과 아늑한 분위기가 인상적입니다.",
                "전문 바리스타가 만든 커피를 맛보세요.",
            ]
            
            audio_results = []
            for i, text in enumerate(narration_texts):
                audio_request = AudioGenerationRequest(
                    text=text,
                    gender=VoiceGender.FEMALE,
                    emotion=EmotionTone.FRIENDLY,
                )
                
                try:
                    audio_result = audio_generator.generate(
                        audio_request,
                        upload_to_s3=True,
                    )
                    audio_results.append(audio_result)
                    update_progress(
                        job_id,
                        60 + (i + 1) * 10 // len(narration_texts),
                        "processing",
                        {"stage": "generating_audio", "current": i + 1, "total": len(narration_texts)},
                    )
                except Exception as e:
                    logger.error(f"Failed to generate audio {i + 1}: {e}")
                    raise
            
            # 오디오 결합 (간단히 첫 번째 오디오 사용)
            final_audio_url = audio_results[0].audio_url if audio_results else None
        else:
            final_audio_url = None
        
        # 4. 비디오 합성
        update_progress(job_id, 80, "processing", {"stage": "composing_video"})
        
        video_composer = VideoComposer()
        
        # 씬 구성
        scenes = []
        for i, img_result in enumerate(image_results):
            scenes.append(
                VideoScene(
                    image_url=img_result.image_url,
                    duration=5.0,  # 각 씬 5초
                    transition=TransitionEffect.FADE if i > 0 else TransitionEffect.NONE,
                    transition_duration=0.5,
                    subtitle=scene_prompts[i] if gen_options.with_subtitles else None,
                    subtitle_position="bottom",
                )
            )
        
        video_request = VideoCompositionRequest(
            scenes=scenes,
            audio_url=final_audio_url,
            output_width=width,
            output_height=height,
            fps=30,
        )
        
        try:
            video_result = video_composer.compose(
                video_request,
                provider=VideoProvider.FFMPEG,
                upload_to_s3=True,
            )
            
            update_progress(job_id, 95, "processing", {"stage": "finalizing"})
            
            # 최종 결과
            result = {
                "video_url": video_result.video_url,
                "thumbnail_url": image_results[0].image_url if image_results else None,
                "duration": video_result.duration,
            }
            
            update_progress(job_id, 100, "completed", result)
            
            logger.info(f"Content generation task {job_id} completed successfully")
            return result
            
        except Exception as e:
            logger.error(f"Video composition failed: {e}")
            raise
        
    except Exception as e:
        logger.error(f"Content generation task {job_id} failed: {e}")
        update_progress(job_id, 0, "failed", {"error": str(e)})
        raise


def get_task_status(job_id: str) -> Dict[str, Any]:
    """태스크 상태 조회"""
    try:
        result = AsyncResult(job_id, app=celery_app)
        
        # Redis에서 진행률 조회
        progress_data = get_progress(job_id)
        
        status_map = {
            "PENDING": "pending",
            "STARTED": "processing",
            "SUCCESS": "completed",
            "FAILURE": "failed",
            "REVOKED": "failed",
        }
        
        celery_status = status_map.get(result.state, "unknown")
        
        # Redis 진행률이 더 정확하면 사용
        if progress_data["status"] != "unknown":
            status = progress_data["status"]
            progress = progress_data["progress"]
        else:
            status = celery_status
            progress = 0 if status == "pending" else 50 if status == "processing" else 100 if status == "completed" else 0
        
        response = {
            "status": status,
            "progress": progress,
        }
        
        if status == "completed" and result.successful():
            response["result"] = result.result
        elif status == "failed":
            response["error"] = str(result.info) if result.info else "Unknown error"
            if progress_data.get("data", {}).get("error"):
                response["error"] = progress_data["data"]["error"]
        
        return response
        
    except Exception as e:
        logger.error(f"Failed to get task status: {e}")
        return {
            "status": "unknown",
            "progress": 0,
            "error": str(e),
        }
