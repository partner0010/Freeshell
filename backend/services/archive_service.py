"""
Archive 서비스
"""
import os
import shutil
from typing import Dict, Any, Optional
from datetime import datetime
from pathlib import Path

from backend.utils.logger import get_logger

logger = get_logger(__name__)


class ArchiveService:
    """Archive 서비스"""
    
    def __init__(self):
        """Archive 서비스 초기화"""
        self.archive_dir = os.getenv("ARCHIVE_DIR", "storage/archive")
        os.makedirs(self.archive_dir, exist_ok=True)
        
        # S3 또는 클라우드 스토리지 설정 (선택적)
        self.use_s3 = os.getenv("ARCHIVE_USE_S3", "false").lower() == "true"
        self.s3_bucket = os.getenv("ARCHIVE_S3_BUCKET", "")
    
    async def save_to_archive(
        self,
        video_path: str,
        character_id: str,
        user_id: str,
        script_data: Optional[Dict[str, Any]] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Archive에 저장
        
        Args:
            video_path: 저장할 비디오 파일 경로
            character_id: 캐릭터 ID
            user_id: 사용자 ID
            script_data: 스크립트 데이터
            metadata: 추가 메타데이터
        
        Returns:
            {
                "success": bool,
                "archive_id": str,
                "archive_path": str,
                "url": str
            }
        """
        try:
            archive_id = f"archive_{character_id}_{hash(video_path) % 1000000}_{int(datetime.utcnow().timestamp())}"
            
            # Archive 디렉토리 구조: archive/{user_id}/{character_id}/{archive_id}/
            archive_user_dir = os.path.join(self.archive_dir, user_id)
            archive_char_dir = os.path.join(archive_user_dir, character_id)
            archive_item_dir = os.path.join(archive_char_dir, archive_id)
            os.makedirs(archive_item_dir, exist_ok=True)
            
            # 비디오 파일 복사
            video_filename = os.path.basename(video_path)
            archive_video_path = os.path.join(archive_item_dir, video_filename)
            
            if os.path.exists(video_path):
                shutil.copy2(video_path, archive_video_path)
                logger.info(f"Video archived: {archive_video_path}")
            else:
                logger.warning(f"Video file not found: {video_path}")
                return {
                    "success": False,
                    "error": "Video file not found"
                }
            
            # 메타데이터 저장
            archive_metadata = {
                "archive_id": archive_id,
                "character_id": character_id,
                "user_id": user_id,
                "video_path": archive_video_path,
                "original_path": video_path,
                "script_data": script_data,
                "metadata": metadata or {},
                "created_at": datetime.utcnow().isoformat()
            }
            
            import json
            metadata_path = os.path.join(archive_item_dir, "metadata.json")
            with open(metadata_path, "w", encoding="utf-8") as f:
                json.dump(archive_metadata, f, ensure_ascii=False, indent=2)
            
            # S3 업로드 (설정된 경우)
            archive_url = archive_video_path
            if self.use_s3 and self.s3_bucket:
                archive_url = await self._upload_to_s3(archive_video_path, archive_id, user_id, character_id)
            
            return {
                "success": True,
                "archive_id": archive_id,
                "archive_path": archive_video_path,
                "url": archive_url,
                "metadata": archive_metadata
            }
        
        except Exception as e:
            logger.error(f"Failed to save to archive: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def _upload_to_s3(
        self,
        file_path: str,
        archive_id: str,
        user_id: str,
        character_id: str
    ) -> str:
        """S3에 업로드 (선택적)"""
        try:
            import boto3
            from botocore.exceptions import ClientError
            
            s3_client = boto3.client('s3')
            s3_key = f"archive/{user_id}/{character_id}/{archive_id}/{os.path.basename(file_path)}"
            
            s3_client.upload_file(
                file_path,
                self.s3_bucket,
                s3_key
            )
            
            url = f"https://{self.s3_bucket}.s3.amazonaws.com/{s3_key}"
            logger.info(f"Uploaded to S3: {url}")
            return url
        
        except Exception as e:
            logger.warning(f"S3 upload failed: {e}")
            return file_path
    
    async def get_archive(
        self,
        archive_id: str,
        user_id: str
    ) -> Optional[Dict[str, Any]]:
        """Archive 조회"""
        try:
            # Archive 디렉토리에서 찾기
            archive_user_dir = os.path.join(self.archive_dir, user_id)
            
            for char_dir in os.listdir(archive_user_dir):
                char_path = os.path.join(archive_user_dir, char_dir)
                if not os.path.isdir(char_path):
                    continue
                
                for item_dir in os.listdir(char_path):
                    if item_dir == archive_id:
                        item_path = os.path.join(char_path, item_dir)
                        metadata_path = os.path.join(item_path, "metadata.json")
                        
                        if os.path.exists(metadata_path):
                            import json
                            with open(metadata_path, "r", encoding="utf-8") as f:
                                metadata = json.load(f)
                            
                            # 사용자 확인
                            if metadata.get("user_id") != user_id:
                                return None
                            
                            return metadata
            
            return None
        
        except Exception as e:
            logger.error(f"Failed to get archive: {e}")
            return None
    
    async def list_archives(
        self,
        user_id: str,
        character_id: Optional[str] = None,
        page: int = 1,
        page_size: int = 20
    ) -> Dict[str, Any]:
        """Archive 목록 조회"""
        try:
            archives = []
            archive_user_dir = os.path.join(self.archive_dir, user_id)
            
            if not os.path.exists(archive_user_dir):
                return {
                    "success": True,
                    "archives": [],
                    "total": 0,
                    "page": page,
                    "page_size": page_size
                }
            
            # 캐릭터별로 검색
            char_dirs = [character_id] if character_id else os.listdir(archive_user_dir)
            
            for char_dir in char_dirs:
                char_path = os.path.join(archive_user_dir, char_dir)
                if not os.path.isdir(char_path):
                    continue
                
                for item_dir in os.listdir(char_path):
                    item_path = os.path.join(char_path, item_dir)
                    metadata_path = os.path.join(item_path, "metadata.json")
                    
                    if os.path.exists(metadata_path):
                        import json
                        with open(metadata_path, "r", encoding="utf-8") as f:
                            metadata = json.load(f)
                        archives.append(metadata)
            
            # 정렬 (최신순)
            archives.sort(key=lambda x: x.get("created_at", ""), reverse=True)
            
            # 페이지네이션
            total = len(archives)
            offset = (page - 1) * page_size
            archives = archives[offset:offset + page_size]
            
            return {
                "success": True,
                "archives": archives,
                "total": total,
                "page": page,
                "page_size": page_size
            }
        
        except Exception as e:
            logger.error(f"Failed to list archives: {e}")
            return {
                "success": False,
                "error": str(e)
            }
