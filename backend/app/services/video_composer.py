"""
비디오 합성 서비스
이미지 시퀀스 + 오디오 결합, 전환 효과, 자막 삽입, FFmpeg 렌더링
"""

import os
import time
import subprocess
import tempfile
from typing import Optional, List, Dict, Any, Tuple
from enum import Enum
from dataclasses import dataclass
from pathlib import Path

try:
    import boto3
    from botocore.exceptions import ClientError
    BOTO3_AVAILABLE = True
except ImportError:
    BOTO3_AVAILABLE = False

try:
    from PIL import Image, ImageDraw, ImageFont
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False

try:
    from pydub import AudioSegment
    PYDUB_AVAILABLE = True
except ImportError:
    PYDUB_AVAILABLE = False

import httpx

from ..utils.logger import get_logger

logger = get_logger(__name__)


class TransitionEffect(str, Enum):
    """전환 효과"""
    NONE = "none"
    FADE = "fade"
    SLIDE_LEFT = "slide_left"
    SLIDE_RIGHT = "slide_right"
    SLIDE_UP = "slide_up"
    SLIDE_DOWN = "slide_down"
    DISSOLVE = "dissolve"
    ZOOM = "zoom"


class VideoProvider(str, Enum):
    """비디오 생성 제공자"""
    FFMPEG = "ffmpeg"
    RUNWAY = "runway"
    PIKA = "pika"


@dataclass
class VideoScene:
    """비디오 씬"""
    image_url: str
    duration: float  # 초
    transition: TransitionEffect = TransitionEffect.FADE
    transition_duration: float = 0.5  # 초
    subtitle: Optional[str] = None
    subtitle_position: str = "bottom"  # top, center, bottom


@dataclass
class VideoCompositionRequest:
    """비디오 합성 요청"""
    scenes: List[VideoScene]
    audio_url: Optional[str] = None
    audio_bytes: Optional[bytes] = None
    output_width: int = 1920
    output_height: int = 1080
    fps: int = 30
    background_color: str = "#000000"
    subtitle_font_size: int = 48
    subtitle_color: str = "#FFFFFF"
    subtitle_outline_color: str = "#000000"
    subtitle_outline_width: int = 2


@dataclass
class VideoCompositionResult:
    """비디오 합성 결과"""
    video_url: str
    video_bytes: Optional[bytes] = None
    duration: float = 0.0  # 초
    cost: float = 0.0
    provider: str = "ffmpeg"
    generation_time: float = 0.0
    file_size: int = 0  # 바이트


class VideoComposer:
    """비디오 합성 서비스"""

    def __init__(
        self,
        runway_api_key: Optional[str] = None,
        pika_api_key: Optional[str] = None,
        s3_bucket: Optional[str] = None,
        s3_region: Optional[str] = None,
        aws_access_key_id: Optional[str] = None,
        aws_secret_access_key: Optional[str] = None,
        ffmpeg_path: Optional[str] = None,
    ):
        """
        비디오 합성기 초기화
        
        Args:
            runway_api_key: Runway API 키
            pika_api_key: Pika API 키
            s3_bucket: S3 버킷 이름
            s3_region: S3 리전
            aws_access_key_id: AWS 액세스 키 ID
            aws_secret_access_key: AWS 시크릿 키
            ffmpeg_path: FFmpeg 실행 파일 경로
        """
        # API 키 설정
        self.runway_key = runway_api_key or os.getenv("RUNWAY_API_KEY")
        self.pika_key = pika_api_key or os.getenv("PIKA_API_KEY")
        
        # FFmpeg 경로
        self.ffmpeg_path = ffmpeg_path or os.getenv("FFMPEG_PATH", "ffmpeg")
        
        # FFmpeg 사용 가능 여부 확인
        self.ffmpeg_available = self._check_ffmpeg()
        
        # S3 설정
        self.s3_bucket = s3_bucket or os.getenv("S3_BUCKET")
        self.s3_region = s3_region or os.getenv("S3_REGION", "us-east-1")
        self.aws_access_key_id = aws_access_key_id or os.getenv("AWS_ACCESS_KEY_ID")
        self.aws_secret_access_key = aws_secret_access_key or os.getenv("AWS_SECRET_ACCESS_KEY")
        
        # S3 클라이언트
        self.s3_client = None
        if BOTO3_AVAILABLE and self.s3_bucket and self.aws_access_key_id:
            try:
                self.s3_client = boto3.client(
                    "s3",
                    region_name=self.s3_region,
                    aws_access_key_id=self.aws_access_key_id,
                    aws_secret_access_key=self.aws_secret_access_key,
                )
            except Exception as e:
                logger.warning(f"Failed to initialize S3 client: {e}")
        
        # 비용 추적
        self.cost_tracker: Dict[str, float] = {
            "ffmpeg": 0.0,
            "runway": 0.0,
            "pika": 0.0,
            "s3": 0.0,
        }
    
    def _check_ffmpeg(self) -> bool:
        """FFmpeg 사용 가능 여부 확인"""
        try:
            result = subprocess.run(
                [self.ffmpeg_path, "-version"],
                capture_output=True,
                timeout=5,
            )
            return result.returncode == 0
        except Exception as e:
            logger.warning(f"FFmpeg not available: {e}")
            return False
    
    def _download_image(self, url: str, output_path: str) -> bool:
        """이미지 다운로드"""
        try:
            with httpx.Client(timeout=30.0) as client:
                response = client.get(url)
                response.raise_for_status()
                
                with open(output_path, "wb") as f:
                    f.write(response.content)
                
                return True
        except Exception as e:
            logger.error(f"Failed to download image {url}: {e}")
            return False
    
    def _download_audio(self, url: str, output_path: str) -> bool:
        """오디오 다운로드"""
        try:
            with httpx.Client(timeout=60.0) as client:
                response = client.get(url)
                response.raise_for_status()
                
                with open(output_path, "wb") as f:
                    f.write(response.content)
                
                return True
        except Exception as e:
            logger.error(f"Failed to download audio {url}: {e}")
            return False
    
    def _add_subtitle_to_image(
        self,
        image_path: str,
        subtitle: str,
        font_size: int,
        color: str,
        outline_color: str,
        outline_width: int,
        position: str,
    ) -> str:
        """이미지에 자막 추가"""
        if not PIL_AVAILABLE:
            logger.warning("PIL not available, skipping subtitle")
            return image_path
        
        try:
            # 이미지 열기
            img = Image.open(image_path)
            draw = ImageDraw.Draw(img)
            
            # 폰트 로드 (시스템 기본 폰트 사용)
            try:
                font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", font_size)
            except:
                try:
                    font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", font_size)
                except:
                    font = ImageFont.load_default()
            
            # 텍스트 크기 계산
            bbox = draw.textbbox((0, 0), subtitle, font=font)
            text_width = bbox[2] - bbox[0]
            text_height = bbox[3] - bbox[1]
            
            # 위치 계산
            img_width, img_height = img.size
            if position == "top":
                x = (img_width - text_width) // 2
                y = 50
            elif position == "center":
                x = (img_width - text_width) // 2
                y = (img_height - text_height) // 2
            else:  # bottom
                x = (img_width - text_width) // 2
                y = img_height - text_height - 50
            
            # 아웃라인 그리기
            for adj in range(-outline_width, outline_width + 1):
                for adj2 in range(-outline_width, outline_width + 1):
                    draw.text(
                        (x + adj, y + adj2),
                        subtitle,
                        font=font,
                        fill=outline_color,
                    )
            
            # 텍스트 그리기
            draw.text((x, y), subtitle, font=font, fill=color)
            
            # 저장
            output_path = image_path.replace(".", "_subtitle.")
            img.save(output_path)
            
            return output_path
            
        except Exception as e:
            logger.error(f"Failed to add subtitle: {e}")
            return image_path
    
    def _create_ffmpeg_filter_complex(
        self,
        scenes: List[VideoScene],
        request: VideoCompositionRequest,
    ) -> Tuple[str, List[str]]:
        """
        FFmpeg filter_complex 생성
        
        Returns:
            (filter_complex 문자열, 입력 파일 리스트)
        """
        inputs = []
        filters = []
        
        for i, scene in enumerate(scenes):
            # 이미지 입력
            input_label = f"img{i}"
            inputs.extend(["-loop", "1", "-t", str(scene.duration), "-i", scene.image_url])
            
            # 스케일 및 포맷 변환
            scaled_label = f"scaled{i}"
            filters.append(
                f"[{input_label}]scale={request.output_width}:{request.output_height}:force_original_aspect_ratio=decrease,"
                f"pad={request.output_width}:{request.output_height}:(ow-iw)/2:(oh-ih)/2,"
                f"setpts=PTS-STARTPTS,fps={request.fps}[{scaled_label}]"
            )
        
        # 전환 효과 적용
        if len(scenes) > 1:
            current_label = "scaled0"
            for i in range(1, len(scenes)):
                next_label = f"scaled{i}"
                transition_label = f"transition{i}"
                
                prev_scene = scenes[i - 1]
                transition = prev_scene.transition
                transition_dur = prev_scene.transition_duration
                
                if transition == TransitionEffect.FADE:
                    filters.append(
                        f"[{current_label}][{next_label}]xfade=transition=fade:duration={transition_dur}:"
                        f"offset={sum(s.duration for s in scenes[:i]) - transition_dur}[{transition_label}]"
                    )
                elif transition == TransitionEffect.SLIDE_LEFT:
                    filters.append(
                        f"[{current_label}][{next_label}]xfade=transition=slideleft:duration={transition_dur}:"
                        f"offset={sum(s.duration for s in scenes[:i]) - transition_dur}[{transition_label}]"
                    )
                elif transition == TransitionEffect.SLIDE_RIGHT:
                    filters.append(
                        f"[{current_label}][{next_label}]xfade=transition=slideright:duration={transition_dur}:"
                        f"offset={sum(s.duration for s in scenes[:i]) - transition_dur}[{transition_label}]"
                    )
                elif transition == TransitionEffect.SLIDE_UP:
                    filters.append(
                        f"[{current_label}][{next_label}]xfade=transition=slideup:duration={transition_dur}:"
                        f"offset={sum(s.duration for s in scenes[:i]) - transition_dur}[{transition_label}]"
                    )
                elif transition == TransitionEffect.SLIDE_DOWN:
                    filters.append(
                        f"[{current_label}][{next_label}]xfade=transition=slidedown:duration={transition_dur}:"
                        f"offset={sum(s.duration for s in scenes[:i]) - transition_dur}[{transition_label}]"
                    )
                elif transition == TransitionEffect.DISSOLVE:
                    filters.append(
                        f"[{current_label}][{next_label}]xfade=transition=dissolve:duration={transition_dur}:"
                        f"offset={sum(s.duration for s in scenes[:i]) - transition_dur}[{transition_label}]"
                    )
                elif transition == TransitionEffect.ZOOM:
                    filters.append(
                        f"[{current_label}][{next_label}]xfade=transition=zoomin:duration={transition_dur}:"
                        f"offset={sum(s.duration for s in scenes[:i]) - transition_dur}[{transition_label}]"
                    )
                else:
                    # 전환 없음 - concat
                    filters.append(
                        f"[{current_label}][{next_label}]concat=n=2:v=1:a=0[{transition_label}]"
                    )
                
                current_label = transition_label
        else:
            current_label = "scaled0"
        
        # 최종 출력 레이블
        filters.append(f"[{current_label}]copy[v]")
        
        filter_complex = ";".join(filters)
        
        return filter_complex, inputs
    
    def compose_with_ffmpeg(
        self, request: VideoCompositionRequest, max_retries: int = 3
    ) -> VideoCompositionResult:
        """
        FFmpeg를 사용한 비디오 합성
        
        Args:
            request: 합성 요청
            max_retries: 최대 재시도 횟수
            
        Returns:
            합성된 비디오 결과
        """
        if not self.ffmpeg_available:
            raise ValueError("FFmpeg not available")
        
        start_time = time.time()
        
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = Path(temp_dir)
            
            # 이미지 다운로드 및 자막 추가
            processed_scenes = []
            for i, scene in enumerate(request.scenes):
                # 이미지 다운로드
                image_path = str(temp_path / f"scene_{i}.jpg")
                
                if scene.image_url.startswith("http"):
                    if not self._download_image(scene.image_url, image_path):
                        raise ValueError(f"Failed to download image: {scene.image_url}")
                else:
                    # 로컬 파일
                    image_path = scene.image_url
                
                # 자막 추가
                if scene.subtitle:
                    image_path = self._add_subtitle_to_image(
                        image_path,
                        scene.subtitle,
                        request.subtitle_font_size,
                        request.subtitle_color,
                        request.subtitle_outline_color,
                        request.subtitle_outline_width,
                        scene.subtitle_position,
                    )
                
                processed_scenes.append(VideoScene(
                    image_url=image_path,
                    duration=scene.duration,
                    transition=scene.transition,
                    transition_duration=scene.transition_duration,
                ))
            
            # 오디오 다운로드
            audio_path = None
            if request.audio_url:
                audio_path = str(temp_path / "audio.mp3")
                if not self._download_audio(request.audio_url, audio_path):
                    logger.warning("Failed to download audio, continuing without audio")
                    audio_path = None
            elif request.audio_bytes:
                audio_path = str(temp_path / "audio.mp3")
                with open(audio_path, "wb") as f:
                    f.write(request.audio_bytes)
            
            # FFmpeg filter_complex 생성
            filter_complex, inputs = self._create_ffmpeg_filter_complex(processed_scenes, request)
            
            # 출력 파일
            output_path = str(temp_path / "output.mp4")
            
            # FFmpeg 명령어 구성
            cmd = [
                self.ffmpeg_path,
                "-y",  # 덮어쓰기
                *inputs,
            ]
            
            if audio_path:
                cmd.extend(["-i", audio_path])
            
            cmd.extend([
                "-filter_complex", filter_complex,
                "-map", "[v]",
            ])
            
            if audio_path:
                cmd.extend(["-map", "1:a?"])
            
            cmd.extend([
                "-c:v", "libx264",
                "-preset", "medium",
                "-crf", "23",
                "-c:a", "aac",
                "-b:a", "192k",
                "-pix_fmt", "yuv420p",
                "-movflags", "+faststart",
                output_path,
            ])
            
            # FFmpeg 실행
            for attempt in range(max_retries):
                try:
                    logger.info(f"Running FFmpeg (attempt {attempt + 1}/{max_retries})")
                    logger.debug(f"Command: {' '.join(cmd)}")
                    
                    result = subprocess.run(
                        cmd,
                        capture_output=True,
                        timeout=300,  # 5분 타임아웃
                    )
                    
                    if result.returncode != 0:
                        error_msg = result.stderr.decode("utf-8", errors="ignore")
                        logger.error(f"FFmpeg error: {error_msg}")
                        if attempt < max_retries - 1:
                            time.sleep(2 ** attempt)
                            continue
                        raise RuntimeError(f"FFmpeg failed: {error_msg}")
                    
                    # 비디오 파일 읽기
                    with open(output_path, "rb") as f:
                        video_bytes = f.read()
                    
                    # 비디오 길이 계산
                    duration = sum(s.duration for s in request.scenes)
                    
                    generation_time = time.time() - start_time
                    
                    # 비용 추적 (FFmpeg: 무료, 서버 리소스만 사용)
                    estimated_cost = 0.0
                    self.cost_tracker["ffmpeg"] += estimated_cost
                    
                    result = VideoCompositionResult(
                        video_bytes=video_bytes,
                        duration=duration,
                        cost=estimated_cost,
                        provider="ffmpeg",
                        generation_time=generation_time,
                        file_size=len(video_bytes),
                    )
                    
                    logger.info(f"Successfully composed video (duration: {duration:.2f}s, size: {len(video_bytes) / 1024 / 1024:.2f}MB)")
                    return result
                    
                except subprocess.TimeoutExpired:
                    logger.error("FFmpeg timeout")
                    if attempt < max_retries - 1:
                        time.sleep(2 ** attempt)
                        continue
                    raise
                except Exception as e:
                    logger.error(f"FFmpeg composition failed (attempt {attempt + 1}/{max_retries}): {e}")
                    if attempt < max_retries - 1:
                        time.sleep(2 ** attempt)
                        continue
                    raise
        
        raise Exception("Video composition failed after all retries")
    
    def compose_with_runway(
        self, request: VideoCompositionRequest, max_retries: int = 3
    ) -> VideoCompositionResult:
        """
        Runway API를 사용한 비디오 생성 (image-to-video)
        
        Args:
            request: 합성 요청
            max_retries: 최대 재시도 횟수
            
        Returns:
            생성된 비디오 결과
        """
        if not self.runway_key:
            raise ValueError("Runway API key not set")
        
        # Runway는 첫 번째 이미지만 사용 (image-to-video)
        if not request.scenes:
            raise ValueError("At least one scene is required")
        
        first_scene = request.scenes[0]
        
        start_time = time.time()
        
        for attempt in range(max_retries):
            try:
                logger.info(f"Generating video with Runway (attempt {attempt + 1}/{max_retries})")
                
                # Runway API 호출 (예시 - 실제 API 문서 참조 필요)
                url = "https://api.runwayml.com/v1/image-to-video"
                headers = {
                    "Authorization": f"Bearer {self.runway_key}",
                    "Content-Type": "application/json",
                }
                
                # 이미지 다운로드
                with httpx.Client(timeout=30.0) as client:
                    image_response = client.get(first_scene.image_url)
                    image_response.raise_for_status()
                    image_bytes = image_response.content
                
                # Base64 인코딩
                import base64
                image_base64 = base64.b64encode(image_bytes).decode("utf-8")
                
                data = {
                    "image": f"data:image/jpeg;base64,{image_base64}",
                    "duration": int(first_scene.duration),
                }
                
                with httpx.Client(timeout=120.0) as client:
                    response = client.post(url, headers=headers, json=data)
                    response.raise_for_status()
                    
                    result_data = response.json()
                    video_url = result_data.get("video_url")
                    
                    if not video_url:
                        raise ValueError("No video URL in response")
                    
                    # 비디오 다운로드
                    video_response = client.get(video_url, timeout=120.0)
                    video_response.raise_for_status()
                    video_bytes = video_response.content
                
                generation_time = time.time() - start_time
                
                # 비용 추적 (Runway: 약 $0.05 per second)
                estimated_cost = first_scene.duration * 0.05
                self.cost_tracker["runway"] += estimated_cost
                
                result = VideoCompositionResult(
                    video_bytes=video_bytes,
                    duration=first_scene.duration,
                    cost=estimated_cost,
                    provider="runway",
                    generation_time=generation_time,
                    file_size=len(video_bytes),
                )
                
                logger.info(f"Successfully generated video with Runway")
                return result
                
            except Exception as e:
                logger.warning(f"Runway generation failed (attempt {attempt + 1}/{max_retries}): {e}")
                if attempt < max_retries - 1:
                    time.sleep(2 ** attempt)
                else:
                    raise
        
        raise Exception("Runway video generation failed after all retries")
    
    def compose_with_pika(
        self, request: VideoCompositionRequest, max_retries: int = 3
    ) -> VideoCompositionResult:
        """
        Pika API를 사용한 비디오 생성
        
        Args:
            request: 합성 요청
            max_retries: 최대 재시도 횟수
            
        Returns:
            생성된 비디오 결과
        """
        if not self.pika_key:
            raise ValueError("Pika API key not set")
        
        # Pika는 첫 번째 이미지만 사용
        if not request.scenes:
            raise ValueError("At least one scene is required")
        
        first_scene = request.scenes[0]
        
        start_time = time.time()
        
        for attempt in range(max_retries):
            try:
                logger.info(f"Generating video with Pika (attempt {attempt + 1}/{max_retries})")
                
                # Pika API 호출 (예시 - 실제 API 문서 참조 필요)
                url = "https://api.pika.art/v1/generate"
                headers = {
                    "Authorization": f"Bearer {self.pika_key}",
                    "Content-Type": "application/json",
                }
                
                data = {
                    "image_url": first_scene.image_url,
                    "duration": int(first_scene.duration),
                }
                
                with httpx.Client(timeout=120.0) as client:
                    response = client.post(url, headers=headers, json=data)
                    response.raise_for_status()
                    
                    result_data = response.json()
                    video_url = result_data.get("video_url")
                    
                    if not video_url:
                        raise ValueError("No video URL in response")
                    
                    # 비디오 다운로드
                    video_response = client.get(video_url, timeout=120.0)
                    video_response.raise_for_status()
                    video_bytes = video_response.content
                
                generation_time = time.time() - start_time
                
                # 비용 추적 (Pika: 약 $0.04 per second)
                estimated_cost = first_scene.duration * 0.04
                self.cost_tracker["pika"] += estimated_cost
                
                result = VideoCompositionResult(
                    video_bytes=video_bytes,
                    duration=first_scene.duration,
                    cost=estimated_cost,
                    provider="pika",
                    generation_time=generation_time,
                    file_size=len(video_bytes),
                )
                
                logger.info(f"Successfully generated video with Pika")
                return result
                
            except Exception as e:
                logger.warning(f"Pika generation failed (attempt {attempt + 1}/{max_retries}): {e}")
                if attempt < max_retries - 1:
                    time.sleep(2 ** attempt)
                else:
                    raise
        
        raise Exception("Pika video generation failed after all retries")
    
    def upload_to_s3(
        self, video_bytes: bytes, key: str, content_type: str = "video/mp4"
    ) -> str:
        """
        S3에 비디오 업로드
        
        Args:
            video_bytes: 비디오 바이트
            key: S3 키 (경로)
            content_type: 콘텐츠 타입
            
        Returns:
            S3 URL
        """
        if not self.s3_client:
            raise ValueError("S3 client not initialized")
        
        try:
            self.s3_client.put_object(
                Bucket=self.s3_bucket,
                Key=key,
                Body=video_bytes,
                ContentType=content_type,
                ACL="public-read",
            )
            
            # URL 생성
            url = f"https://{self.s3_bucket}.s3.{self.s3_region}.amazonaws.com/{key}"
            
            # 비용 추적 (S3: 약 $0.023 per GB storage, $0.005 per 1000 requests)
            estimated_cost = (len(video_bytes) / 1_000_000_000) * 0.023 + 0.000005
            self.cost_tracker["s3"] += estimated_cost
            
            logger.info(f"Uploaded video to S3: {url}")
            return url
            
        except ClientError as e:
            logger.error(f"S3 upload failed: {e}")
            raise
    
    def compose(
        self,
        request: VideoCompositionRequest,
        provider: VideoProvider = VideoProvider.FFMPEG,
        upload_to_s3: bool = True,
    ) -> VideoCompositionResult:
        """
        비디오 합성 (메인 메서드)
        
        Args:
            request: 합성 요청
            provider: 제공자 (FFmpeg, Runway, Pika)
            upload_to_s3: S3 업로드 여부
            
        Returns:
            합성된 비디오 결과
        """
        try:
            # 제공자에 따라 합성
            if provider == VideoProvider.FFMPEG:
                result = self.compose_with_ffmpeg(request)
            elif provider == VideoProvider.RUNWAY:
                result = self.compose_with_runway(request)
            elif provider == VideoProvider.PIKA:
                result = self.compose_with_pika(request)
            else:
                raise ValueError(f"Unknown provider: {provider}")
            
            # S3 업로드
            if upload_to_s3 and self.s3_client and result.video_bytes:
                import uuid
                from datetime import datetime
                
                key = f"videos/{datetime.now().strftime('%Y/%m/%d')}/{uuid.uuid4()}.mp4"
                s3_url = self.upload_to_s3(result.video_bytes, key)
                result.video_url = s3_url
            
            return result
            
        except Exception as e:
            logger.error(f"Video composition failed: {e}")
            # 대체 제공자 시도
            if provider == VideoProvider.FFMPEG:
                if self.runway_key:
                    logger.info("Trying fallback provider: Runway")
                    return self.compose(request, provider=VideoProvider.RUNWAY, upload_to_s3=upload_to_s3)
                elif self.pika_key:
                    logger.info("Trying fallback provider: Pika")
                    return self.compose(request, provider=VideoProvider.PIKA, upload_to_s3=upload_to_s3)
            raise
    
    def get_cost_summary(self) -> Dict[str, float]:
        """
        비용 요약 반환
        
        Returns:
            서비스별 비용 딕셔너리
        """
        total = sum(self.cost_tracker.values())
        return {
            **self.cost_tracker,
            "total": total,
        }
