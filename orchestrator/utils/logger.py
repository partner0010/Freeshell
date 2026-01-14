"""
로깅 유틸리티
"""

import logging
import sys
from typing import Optional


def setup_logging(level: int = logging.INFO):
    """로깅 설정"""
    logging.basicConfig(
        level=level,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.StreamHandler(sys.stdout)
        ]
    )


def get_logger(name: str) -> logging.Logger:
    """Logger 반환"""
    return logging.getLogger(name)
