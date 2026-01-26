"""
데이터베이스 모델
"""

from sqlalchemy import Column, String, Integer, Boolean, DateTime, Text, JSON, ForeignKey, Float, Table, Index
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

Base = declarative_base()


def generate_id():
    """UUID 생성"""
    return str(uuid.uuid4())


# 팔로우 관계 테이블
follows_table = Table(
    'follows',
    Base.metadata,
    Column('follower_id', String, ForeignKey('users.id'), primary_key=True),
    Column('following_id', String, ForeignKey('users.id'), primary_key=True),
    Column('created_at', DateTime, default=datetime.utcnow)
)


class User(Base):
    """사용자 모델"""
    __tablename__ = 'users'
    
    id = Column(String, primary_key=True, default=generate_id)
    email = Column(String, unique=True, nullable=False, index=True)
    username = Column(String, nullable=False, unique=True, index=True)
    password_hash = Column(String, nullable=False)
    role = Column(String, default='user')  # user, admin, moderator
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)
    
    # 프로필 정보
    bio = Column(Text, nullable=True)
    avatar_path = Column(String, nullable=True)
    cover_image_path = Column(String, nullable=True)
    
    # 구독 및 크레딧 정보
    plan = Column(String, default='free')  # free, basic, premium, enterprise
    credits = Column(Integer, default=0)
    
    # 관계
    videos = relationship('Video', back_populates='user', cascade='all, delete-orphan')
    archives = relationship('Archive', back_populates='user', cascade='all, delete-orphan')
    characters = relationship('Character', back_populates='user', cascade='all, delete-orphan')
    projects = relationship('Project', back_populates='user', cascade='all, delete-orphan')
    usage_logs = relationship('UsageLog', back_populates='user', cascade='all, delete-orphan')
    api_keys = relationship('APIKey', back_populates='user', cascade='all, delete-orphan')
    
    # 팔로우 관계
    following = relationship(
        'User',
        secondary=follows_table,
        primaryjoin=id == follows_table.c.follower_id,
        secondaryjoin=id == follows_table.c.following_id,
        backref='followers'
    )


class Video(Base):
    """비디오 모델"""
    __tablename__ = 'videos'
    
    id = Column(String, primary_key=True, default=generate_id)
    user_id = Column(String, ForeignKey('users.id'), nullable=False, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    file_path = Column(String, nullable=False)
    file_size = Column(Integer, nullable=True)
    duration = Column(Float, nullable=True)
    thumbnail_path = Column(String, nullable=True)
    scene_json = Column(JSON, nullable=True)
    status = Column(String, default='completed')  # processing, completed, failed
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 공유 및 통계
    share_count = Column(Integer, default=0)
    view_count = Column(Integer, default=0)
    is_public = Column(Boolean, default=True)
    
    # 관계
    user = relationship('User', back_populates='videos')
    likes = relationship('VideoLike', back_populates='video', cascade='all, delete-orphan')
    comments = relationship('VideoComment', back_populates='video', cascade='all, delete-orphan')
    shares = relationship('VideoShare', back_populates='video', cascade='all, delete-orphan')
    shares = relationship('VideoShare', back_populates='video', cascade='all, delete-orphan')


class VideoLike(Base):
    """비디오 좋아요"""
    __tablename__ = 'video_likes'
    
    id = Column(String, primary_key=True, default=generate_id)
    video_id = Column(String, ForeignKey('videos.id'), nullable=False, index=True)
    user_id = Column(String, ForeignKey('users.id'), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # 관계
    video = relationship('Video', back_populates='likes')
    
    __table_args__ = (
        {'sqlite_autoincrement': True},
    )


class VideoComment(Base):
    """비디오 댓글"""
    __tablename__ = 'video_comments'
    
    id = Column(String, primary_key=True, default=generate_id)
    video_id = Column(String, ForeignKey('videos.id'), nullable=False, index=True)
    user_id = Column(String, ForeignKey('users.id'), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 관계
    video = relationship('Video', back_populates='comments')


class VideoShare(Base):
    """비디오 공유"""
    __tablename__ = 'video_shares'
    
    id = Column(String, primary_key=True, default=generate_id)
    video_id = Column(String, ForeignKey('videos.id'), nullable=False, index=True)
    user_id = Column(String, ForeignKey('users.id'), nullable=True)
    share_type = Column(String, default='link')  # link, embed, social
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # 관계
    video = relationship('Video', back_populates='shares')


class Archive(Base):
    """아카이브 모델"""
    __tablename__ = 'archives'
    
    id = Column(String, primary_key=True, default=generate_id)
    user_id = Column(String, ForeignKey('users.id'), nullable=False, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    content = Column(JSON, nullable=False)
    consent_data = Column(JSON, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 관계
    user = relationship('User', back_populates='archives')


class Character(Base):
    """캐릭터 IP 모델"""
    __tablename__ = 'characters'
    
    id = Column(String, primary_key=True, default=generate_id)
    user_id = Column(String, ForeignKey('users.id'), nullable=False, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    image_path = Column(String, nullable=True)
    metadata = Column(JSON, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 관계
    user = relationship('User', back_populates='characters')


class Space(Base):
    """공간/방 모델"""
    __tablename__ = 'spaces'
    
    id = Column(String, primary_key=True, default=generate_id)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    owner_id = Column(String, ForeignKey('users.id'), nullable=False, index=True)
    is_public = Column(Boolean, default=False)
    max_users = Column(Integer, default=50)
    current_users = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 관계
    owner = relationship('User')


class ActivityLog(Base):
    """활동 로그"""
    __tablename__ = 'activity_logs'
    
    id = Column(String, primary_key=True, default=generate_id)
    user_id = Column(String, ForeignKey('users.id'), nullable=True, index=True)
    action = Column(String, nullable=False)  # create_video, login, etc.
    resource_type = Column(String, nullable=True)  # video, user, etc.
    resource_id = Column(String, nullable=True)
    metadata = Column(JSON, nullable=True)
    ip_address = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)


class NotificationRead(Base):
    """알림 읽음 상태"""
    __tablename__ = 'notification_reads'
    
    id = Column(String, primary_key=True, default=generate_id)
    user_id = Column(String, ForeignKey('users.id'), nullable=False, index=True)
    activity_id = Column(String, ForeignKey('activity_logs.id'), nullable=False, index=True)
    read_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    __table_args__ = (
        Index('idx_notification_reads_user_activity', 'user_id', 'activity_id', unique=True),
    )


class Plan(Base):
    """플랜 모델"""
    __tablename__ = 'plans'
    
    id = Column(String, primary_key=True, default=generate_id)
    name = Column(String, nullable=False, unique=True)
    type = Column(String, nullable=False, unique=True)  # free, pro, business
    price = Column(Float, default=0.0)
    currency = Column(String, default='USD')
    video_limit = Column(Integer, nullable=True)  # None = 무제한
    max_resolution = Column(String, default='720p')  # 720p, 1080p, 4K
    watermark = Column(Boolean, default=True)
    priority_processing = Column(Boolean, default=False)
    api_access = Column(Boolean, default=False)
    dedicated_support = Column(Boolean, default=False)
    features = Column(JSON, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 관계
    subscriptions = relationship('Subscription', back_populates='plan')


class Subscription(Base):
    """구독 모델"""
    __tablename__ = 'subscriptions'
    
    id = Column(String, primary_key=True, default=generate_id)
    user_id = Column(String, ForeignKey('users.id'), nullable=False, index=True)
    plan_id = Column(String, ForeignKey('plans.id'), nullable=False, index=True)
    status = Column(String, default='active')  # active, cancelled, expired
    started_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 관계
    user = relationship('User')
    plan = relationship('Plan', back_populates='subscriptions')


class CreditTransaction(Base):
    """크레딧 거래"""
    __tablename__ = 'credit_transactions'
    
    id = Column(String, primary_key=True, default=generate_id)
    user_id = Column(String, ForeignKey('users.id'), nullable=False, index=True)
    amount = Column(Integer, nullable=False)  # 양수: 충전, 음수: 사용
    transaction_type = Column(String, nullable=False)  # purchase, usage, refund
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    # 관계
    user = relationship('User')


class Project(Base):
    """프로젝트 모델"""
    __tablename__ = 'projects'
    
    id = Column(String, primary_key=True, default=generate_id)
    user_id = Column(String, ForeignKey('users.id'), nullable=False, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String, default='active')  # active, archived, deleted
    type = Column(String, nullable=True)  # project type
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    # 관계
    user = relationship('User', back_populates='projects')
    contents = relationship('Content', back_populates='project', cascade='all, delete-orphan')
    prompts = relationship('Prompt', back_populates='project', cascade='all, delete-orphan')
    
    __table_args__ = (
        Index('idx_projects_user_status', 'user_id', 'status'),
        Index('idx_projects_created', 'created_at'),
    )


class Prompt(Base):
    """프롬프트 모델"""
    __tablename__ = 'prompts'
    
    id = Column(String, primary_key=True, default=generate_id)
    project_id = Column(String, ForeignKey('projects.id'), nullable=False, index=True)
    raw_input = Column(Text, nullable=False)
    analyzed_data = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # 관계
    project = relationship('Project', back_populates='prompts')


class Content(Base):
    """콘텐츠 모델"""
    __tablename__ = 'contents'
    
    id = Column(String, primary_key=True, default=generate_id)
    project_id = Column(String, ForeignKey('projects.id'), nullable=False, index=True)
    type = Column(String, nullable=False)  # video, image, audio, text, etc.
    url = Column(String, nullable=True)
    metadata = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    # 관계
    project = relationship('Project', back_populates='contents')
    
    __table_args__ = (
        Index('idx_contents_project_type', 'project_id', 'type'),
        Index('idx_contents_created', 'created_at'),
    )


class UsageLog(Base):
    """사용량 로그 모델"""
    __tablename__ = 'usage_logs'
    
    id = Column(String, primary_key=True, default=generate_id)
    user_id = Column(String, ForeignKey('users.id'), nullable=False, index=True)
    action = Column(String, nullable=False)  # action type
    cost = Column(Float, default=0.0)  # cost in credits
    metadata = Column(JSON, nullable=True)  # 추가 정보 (API 이름, 모델 등)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    # 관계
    user = relationship('User', back_populates='usage_logs')
    
    __table_args__ = (
        Index('idx_usage_logs_user_created', 'user_id', 'created_at'),
        {'sqlite_autoincrement': True},
    )


class DailyCost(Base):
    """일일 비용 집계 모델"""
    __tablename__ = 'daily_costs'
    
    id = Column(String, primary_key=True, default=generate_id)
    date = Column(DateTime, nullable=False, index=True, unique=True)
    total_cost = Column(Float, default=0.0)
    breakdown = Column(JSON, nullable=True)  # {action: cost, ...}
    user_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    __table_args__ = (
        Index('idx_daily_costs_date', 'date'),
    )


class APIKey(Base):
    """API 키 모델"""
    __tablename__ = 'api_keys'
    
    id = Column(String, primary_key=True, default=generate_id)
    user_id = Column(String, ForeignKey('users.id'), nullable=False, index=True)
    service = Column(String, nullable=False)  # service name
    key_encrypted = Column(String, nullable=False)  # encrypted API key
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # 관계
    user = relationship('User', back_populates='api_keys')
