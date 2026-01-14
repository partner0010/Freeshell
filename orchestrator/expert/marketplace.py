"""
마켓플레이스 시스템
"""

from typing import Dict, Any, List, Optional
from dataclasses import dataclass, field
from enum import Enum
from datetime import datetime
import uuid

from .expert_schema import Expert
from .revenue_model import RevenueCalculator, RevenueSplit
from ..utils.logger import get_logger

logger = get_logger(__name__)


class ProductType(Enum):
    """제품 타입"""
    EBOOK = "ebook"
    COURSE = "course"
    TEMPLATE = "template"
    CONSULTING = "consulting"


class ProductStatus(Enum):
    """제품 상태"""
    DRAFT = "draft"
    PENDING_REVIEW = "pending_review"
    APPROVED = "approved"
    REJECTED = "rejected"
    SUSPENDED = "suspended"


@dataclass
class MarketplaceProduct:
    """마켓플레이스 제품"""
    id: str
    expert_id: str
    product_type: ProductType
    title: str
    description: str
    price: float
    status: ProductStatus = ProductStatus.DRAFT
    category: str = ""
    tags: List[str] = field(default_factory=list)
    file_path: Optional[str] = None  # 파일 경로
    preview_url: Optional[str] = None  # 미리보기 URL
    sales_count: int = 0
    rating: float = 0.0
    total_reviews: int = 0
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'id': self.id,
            'expert_id': self.expert_id,
            'product_type': self.product_type.value,
            'title': self.title,
            'description': self.description,
            'price': self.price,
            'status': self.status.value,
            'category': self.category,
            'tags': self.tags,
            'file_path': self.file_path,
            'preview_url': self.preview_url,
            'sales_count': self.sales_count,
            'rating': self.rating,
            'total_reviews': self.total_reviews,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }


class Marketplace:
    """마켓플레이스"""
    
    def __init__(self):
        self.products: Dict[str, MarketplaceProduct] = {}
        self.revenue_calculator = RevenueCalculator()
    
    def create_product(
        self,
        expert_id: str,
        product_type: ProductType,
        title: str,
        description: str,
        price: float
    ) -> MarketplaceProduct:
        """제품 생성"""
        product = MarketplaceProduct(
            id=str(uuid.uuid4()),
            expert_id=expert_id,
            product_type=product_type,
            title=title,
            description=description,
            price=price
        )
        
        self.products[product.id] = product
        logger.info(f"Product created: {product.id} by expert {expert_id}")
        return product
    
    def get_products(
        self,
        category: Optional[str] = None,
        product_type: Optional[ProductType] = None,
        limit: int = 20
    ) -> List[MarketplaceProduct]:
        """제품 목록 조회"""
        products = list(self.products.values())
        
        # 상태 필터 (승인된 것만)
        products = [p for p in products if p.status == ProductStatus.APPROVED]
        
        # 카테고리 필터
        if category:
            products = [p for p in products if p.category == category]
        
        # 타입 필터
        if product_type:
            products = [p for p in products if p.product_type == product_type]
        
        # 인기순 정렬 (판매량 + 평점)
        products.sort(key=lambda p: (p.sales_count, p.rating), reverse=True)
        
        return products[:limit]
    
    def purchase_product(
        self,
        product_id: str,
        user_id: str
    ) -> Dict[str, Any]:
        """제품 구매"""
        product = self.products.get(product_id)
        if not product:
            return {'success': False, 'error': 'Product not found'}
        
        if product.status != ProductStatus.APPROVED:
            return {'success': False, 'error': 'Product not available'}
        
        # 수익 계산
        revenue_split = self.revenue_calculator.calculate_marketplace_revenue(
            product.price,
            product.product_type.value
        )
        
        # 판매 기록
        product.sales_count += 1
        
        return {
            'success': True,
            'product_id': product_id,
            'price': product.price,
            'revenue_split': revenue_split.to_dict(),
            'download_url': product.file_path  # 실제로는 보안 URL 생성
        }
    
    def get_product(self, product_id: str) -> Optional[MarketplaceProduct]:
        """제품 조회"""
        return self.products.get(product_id)
