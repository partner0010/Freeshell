"""
로거 유틸리티
파일 로그, 콘솔 출력, 레벨별 분리
"""

import logging
import sys
import os
from logging.handlers import RotatingFileHandler
from pathlib import Path
from typing import Optional


# 로그 디렉토리 생성
LOG_DIR = Path("logs")
LOG_DIR.mkdir(exist_ok=True)

# 로그 파일 경로
APP_LOG_FILE = LOG_DIR / "app.log"
ERROR_LOG_FILE = LOG_DIR / "error.log"
DEBUG_LOG_FILE = LOG_DIR / "debug.log"


def setup_logging(
    level: Optional[str] = None,
    enable_file_logging: bool = True,
    enable_console_logging: bool = True,
):
    """
    로깅 시스템 초기화
    
    Args:
        level: 로그 레벨 (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        enable_file_logging: 파일 로깅 활성화
        enable_console_logging: 콘솔 로깅 활성화
    """
    # 환경 변수에서 로그 레벨 읽기
    log_level = level or os.getenv("LOG_LEVEL", "INFO").upper()
    log_level = getattr(logging, log_level, logging.INFO)

    # 루트 로거 설정
    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)

    # 기존 핸들러 제거
    root_logger.handlers.clear()

    # 포맷터 설정
    detailed_formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(filename)s:%(lineno)d - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    simple_formatter = logging.Formatter(
        '%(asctime)s - %(levelname)s - %(message)s',
        datefmt='%H:%M:%S'
    )

    # 콘솔 핸들러
    if enable_console_logging:
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(log_level)
        console_handler.setFormatter(simple_formatter)
        root_logger.addHandler(console_handler)

    # 파일 핸들러
    if enable_file_logging:
        # 전체 로그 파일 (INFO 이상)
        app_handler = RotatingFileHandler(
            APP_LOG_FILE,
            maxBytes=10 * 1024 * 1024,  # 10MB
            backupCount=5,
            encoding='utf-8'
        )
        app_handler.setLevel(logging.INFO)
        app_handler.setFormatter(detailed_formatter)
        root_logger.addHandler(app_handler)

        # 에러 로그 파일 (ERROR 이상)
        error_handler = RotatingFileHandler(
            ERROR_LOG_FILE,
            maxBytes=10 * 1024 * 1024,  # 10MB
            backupCount=5,
            encoding='utf-8'
        )
        error_handler.setLevel(logging.ERROR)
        error_handler.setFormatter(detailed_formatter)
        root_logger.addHandler(error_handler)

        # 디버그 로그 파일 (DEBUG 이상, 개발 환경에서만)
        if log_level == logging.DEBUG:
            debug_handler = RotatingFileHandler(
                DEBUG_LOG_FILE,
                maxBytes=10 * 1024 * 1024,  # 10MB
                backupCount=3,
                encoding='utf-8'
            )
            debug_handler.setLevel(logging.DEBUG)
            debug_handler.setFormatter(detailed_formatter)
            root_logger.addHandler(debug_handler)

    # 외부 라이브러리 로그 레벨 조정
    logging.getLogger("uvicorn").setLevel(logging.WARNING)
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("fastapi").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.WARNING)


def get_logger(name: str) -> logging.Logger:
    """
    로거 생성
    
    Args:
        name: 로거 이름 (보통 __name__)
        
    Returns:
        Logger 인스턴스
    """
    logger = logging.getLogger(name)
    return logger
