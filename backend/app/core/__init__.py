"""
Core 모듈 초기화
로깅 및 Sentry 설정
"""

import os
from .sentry import init_sentry
from ..utils.logger import setup_logging

# 로깅 초기화
log_level = os.getenv("LOG_LEVEL", "INFO")
setup_logging(
    level=log_level,
    enable_file_logging=os.getenv("ENABLE_FILE_LOGGING", "true").lower() == "true",
    enable_console_logging=True,
)

# Sentry 초기화
init_sentry(
    dsn=os.getenv("SENTRY_DSN"),
    environment=os.getenv("ENVIRONMENT", "development"),
    traces_sample_rate=float(os.getenv("SENTRY_TRACES_SAMPLE_RATE", "0.1")),
    profiles_sample_rate=float(os.getenv("SENTRY_PROFILES_SAMPLE_RATE", "0.1")),
)
