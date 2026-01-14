"""
Engine 인터페이스
"""

from typing import Dict, Any, Optional
from dataclasses import dataclass
from abc import ABC, abstractmethod


@dataclass
class EngineResult:
    """Engine 실행 결과"""
    success: bool
    data: Any = None
    error: Optional[str] = None
    fallback_available: bool = True
    
    def __init__(self, success: bool, data: Any = None, error: Optional[str] = None, fallback_available: bool = True):
        self.success = success
        self.data = data
        self.error = error
        self.fallback_available = fallback_available


class BaseEngine(ABC):
    """Engine 기본 클래스"""
    
    def __init__(self, name: str = "base_engine"):
        self.name = name
    
    @abstractmethod
    def run(self, task_name: str, parameters: Dict[str, Any]) -> EngineResult:
        """
        Engine 실행
        
        Args:
            task_name: 작업 이름
            parameters: 파라미터
            
        Returns:
            EngineResult: 실행 결과
        """
        raise NotImplementedError
