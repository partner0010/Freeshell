"""
Celery 앱 설정
"""

import os
from celery import Celery
from ..utils.logger import get_logger

logger = get_logger(__name__)

# Redis URL (환경 변수 또는 기본값)
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

# Celery 앱 생성
celery_app = Celery(
    "content_generation",
    broker=REDIS_URL,
    backend=REDIS_URL,
    include=["app.tasks.content_generation"],
)

# Celery 설정
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=3600,  # 1시간
    task_soft_time_limit=3300,  # 55분
    worker_prefetch_multiplier=1,
    worker_max_tasks_per_child=50,
    result_expires=3600,  # 1시간
)

logger.info(f"Celery app initialized with broker: {REDIS_URL}")
