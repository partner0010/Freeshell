"""
쿠폰 모델
기존 database.models의 Base를 사용
"""
from sqlalchemy import Column, String, Integer, Boolean, DateTime, Text, JSON, ForeignKey, Float
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

# 기존 Base import 시도
try:
    from ..database.models import Base, generate_id
except ImportError:
    # Fallback: 별도 Base 생성
    from sqlalchemy.ext.declarative import declarative_base
    Base = declarative_base()
    
    def generate_id():
        """UUID 생성"""
        return str(uuid.uuid4())


class Coupon(Base):
    """쿠폰 모델"""
    __tablename__ = 'coupons'
    
    id = Column(String, primary_key=True, default=generate_id)
    code = Column(String, unique=True, nullable=False, index=True)  # 쿠폰 코드
    name = Column(String, nullable=False)  # 쿠폰 이름
    description = Column(Text, nullable=True)  # 설명
    
    # 쿠폰 타입 및 값
    type = Column(String, nullable=False)  # subscription_days, credit, discount_percent, discount_amount, plan_upgrade
    value = Column(Float, nullable=False)  # 값 (일수, 크레딧, 할인율, 할인금액)
    
    # 사용 제한
    max_users = Column(Integer, nullable=True)  # 최대 사용 인원수 (None = 무제한)
    max_uses_per_user = Column(Integer, default=1)  # 사용자당 최대 사용 횟수
    current_users = Column(Integer, default=0)  # 현재 사용 인원수
    
    # 기간 및 활성화
    expires_at = Column(DateTime, nullable=True)  # 만료일 (None = 만료 없음)
    is_active = Column(Boolean, default=True)  # 활성화 여부
    
    # 제한 사항
    plan_restriction = Column(String, nullable=True)  # 특정 플랜에만 적용 (None = 모든 플랜)
    min_purchase = Column(Float, nullable=True)  # 최소 구매 금액 (None = 제한 없음)
    
    # 생성 정보
    created_by = Column(String, ForeignKey('users.id'), nullable=False)  # 생성한 관리자
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 추가 옵션 (JSON)
    options = Column(JSON, nullable=True)  # 추가 옵션들 (예: target_plan, additional_features 등)
    
    # 관계
    creator = relationship('User', foreign_keys=[created_by], lazy='select')
    usages = relationship('CouponUsage', back_populates='coupon', cascade='all, delete-orphan')


class CouponUsage(Base):
    """쿠폰 사용 내역"""
    __tablename__ = 'coupon_usages'
    
    id = Column(String, primary_key=True, default=generate_id)
    coupon_id = Column(String, ForeignKey('coupons.id'), nullable=False, index=True)
    user_id = Column(String, ForeignKey('users.id'), nullable=False, index=True)
    
    # 사용 정보
    used_at = Column(DateTime, default=datetime.utcnow)
    applied_value = Column(Float, nullable=False)  # 실제 적용된 값
    
    # 결과 정보
    result_type = Column(String, nullable=False)  # subscription_extended, credit_added, discount_applied, plan_upgraded
    result_data = Column(JSON, nullable=True)  # 결과 상세 데이터
    
    # 관계
    coupon = relationship('Coupon', back_populates='usages', lazy='select')
    user = relationship('User', lazy='select')
