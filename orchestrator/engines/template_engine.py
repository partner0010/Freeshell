"""
Template Engine 구현
"""

import json
import os
from typing import Dict, Any, Optional
from datetime import datetime

from ..core.engine import Engine, EngineType, EngineResult
from ..utils.logger import get_logger

logger = get_logger(__name__)


class TemplateEngine(Engine):
    """Template Engine - 템플릿 기반 생성"""
    
    def __init__(self, name: str = "template_engine", priority: int = 20, template_dir: str = "templates"):
        super().__init__(name, EngineType.TEMPLATE, priority)
        self.template_dir = template_dir
        self.templates = self._load_templates()
    
    def _load_templates(self) -> Dict[str, Any]:
        """템플릿 로드"""
        templates = {}
        
        # 템플릿 디렉토리에서 로드
        if os.path.exists(self.template_dir):
            for filename in os.listdir(self.template_dir):
                if filename.endswith('.json'):
                    try:
                        with open(os.path.join(self.template_dir, filename), 'r', encoding='utf-8') as f:
                            template_data = json.load(f)
                            template_id = template_data.get('id', filename[:-5])
                            templates[template_id] = template_data
                    except Exception as e:
                        logger.warning(f"Failed to load template {filename}: {e}")
        
        # 기본 템플릿
        if not templates:
            templates = self._get_default_templates()
        
        return templates
    
    def _get_default_templates(self) -> Dict[str, Any]:
        """기본 템플릿"""
        return {
            'blog_post': {
                'id': 'blog_post',
                'name': '블로그 포스트',
                'type': 'text',
                'template': '''# {title}

## 소개
{topic}에 대해 알아보겠습니다.

## 본문
{content}

## 결론
{conclusion}'''
            },
            'social_post': {
                'id': 'social_post',
                'name': '소셜 미디어 포스트',
                'type': 'text',
                'template': '{content}\n\n#{hashtags}'
            },
            'email': {
                'id': 'email',
                'name': '이메일 템플릿',
                'type': 'text',
                'template': '''제목: {subject}

{greeting}

{body}

{closing}'''
            }
        }
    
    async def execute(self, input_data: Dict[str, Any]) -> EngineResult:
        """Template 실행"""
        start_time = datetime.now()
        template_id = input_data.get('template_id')
        content_type = input_data.get('type', 'text')
        
        # 템플릿 선택
        template = None
        if template_id and template_id in self.templates:
            template = self.templates[template_id]
        else:
            # 타입으로 템플릿 찾기
            for t in self.templates.values():
                if t.get('type') == content_type:
                    template = t
                    break
        
        if not template:
            execution_time = (datetime.now() - start_time).total_seconds()
            return EngineResult(
                success=False,
                data=None,
                engine_name=self.name,
                engine_type=self.engine_type,
                execution_time=execution_time,
                error="Template not found",
                fallback_available=True
            )
        
        # 템플릿 적용
        try:
            result = self._apply_template(template, input_data)
            execution_time = (datetime.now() - start_time).total_seconds()
            return EngineResult(
                success=True,
                data=result,
                engine_name=self.name,
                engine_type=self.engine_type,
                execution_time=execution_time,
                metadata={'template_id': template['id']},
                fallback_available=False
            )
        except Exception as e:
            execution_time = (datetime.now() - start_time).total_seconds()
            return EngineResult(
                success=False,
                data=None,
                engine_name=self.name,
                engine_type=self.engine_type,
                execution_time=execution_time,
                error=str(e),
                fallback_available=True
            )
    
    def _apply_template(self, template: Dict[str, Any], input_data: Dict[str, Any]) -> str:
        """템플릿 적용"""
        template_str = template.get('template', '')
        result = template_str
        
        # 변수 치환
        for key, value in input_data.items():
            if isinstance(value, str):
                result = result.replace(f'{{{key}}}', value)
        
        # 기본값 처리
        defaults = {
            'title': input_data.get('title', '제목 없음'),
            'topic': input_data.get('topic', '주제'),
            'content': input_data.get('content', '내용'),
            'conclusion': input_data.get('conclusion', '결론'),
            'subject': input_data.get('subject', '제목'),
            'greeting': input_data.get('greeting', '안녕하세요'),
            'body': input_data.get('body', '본문'),
            'closing': input_data.get('closing', '감사합니다'),
            'hashtags': input_data.get('hashtags', '')
        }
        
        for key, default_value in defaults.items():
            if f'{{{key}}}' in result:
                result = result.replace(f'{{{key}}}', str(default_value))
        
        return result
    
    def can_handle(self, intent: str, context: Dict[str, Any]) -> bool:
        """처리 가능 여부"""
        # 템플릿은 항상 사용 가능
        return True
