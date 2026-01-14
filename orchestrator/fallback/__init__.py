"""
Fallback Module
"""

from .fallback_manager import FallbackManager
from .chain import FallbackChain

__all__ = [
    'FallbackManager',
    'FallbackChain',
]
