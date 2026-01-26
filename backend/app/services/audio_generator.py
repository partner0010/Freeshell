"""
오디오 생성 서비스 (TTS)
ElevenLabs API 연동, 배경음악 믹싱, S3 업로드
"""

import os
import time
from typing import Optional, List, Dict, Any
from enum import Enum
from dataclasses import dataclass
from io import BytesIO

try:
    from elevenlabs import generate, set_api_key, voices, VoiceSettings
    from elevenlabs.client import ElevenLabs
    ELEVENLABS_AVAILABLE = True
except ImportError:
    ELEVENLABS_AVAILABLE = False

try:
    import boto3
    from botocore.exceptions import ClientError
    BOTO3_AVAILABLE = True
except ImportError:
    BOTO3_AVAILABLE = False

try:
    from pydub import AudioSegment
    from pydub.effects import normalize
    PYDUB_AVAILABLE = True
except ImportError:
    PYDUB_AVAILABLE = False

from ..utils.logger import get_logger

logger = get_logger(__name__)


class VoiceGender(str, Enum):
    """음성 성별"""
    MALE = "male"
    FEMALE = "female"


class EmotionTone(str, Enum):
    """감정 톤"""
    NEUTRAL = "neutral"
    HAPPY = "happy"
    SAD = "sad"
    EXCITED = "excited"
    CALM = "calm"
    PROFESSIONAL = "professional"
    FRIENDLY = "friendly"
    DRAMATIC = "dramatic"


@dataclass
class AudioGenerationRequest:
    """오디오 생성 요청"""
    text: str
    voice_id: Optional[str] = None
    gender: VoiceGender = VoiceGender.FEMALE
    emotion: EmotionTone = EmotionTone.NEUTRAL
    speed: float = 1.0  # 0.5 ~ 2.0
    stability: float = 0.5  # 0.0 ~ 1.0
    similarity_boost: float = 0.75  # 0.0 ~ 1.0
    background_music_url: Optional[str] = None
    background_music_volume: float = 0.3  # 0.0 ~ 1.0


@dataclass
class AudioGenerationResult:
    """오디오 생성 결과"""
    audio_url: str
    audio_bytes: Optional[bytes] = None
    duration: float = 0.0  # 초
    cost: float = 0.0
    provider: str = "elevenlabs"
    voice_id: str = ""
    generation_time: float = 0.0


class AudioGenerator:
    """오디오 생성 서비스 (TTS)"""

    def __init__(
        self,
        elevenlabs_api_key: Optional[str] = None,
        s3_bucket: Optional[str] = None,
        s3_region: Optional[str] = None,
        aws_access_key_id: Optional[str] = None,
        aws_secret_access_key: Optional[str] = None,
    ):
        """
        오디오 생성기 초기화
        
        Args:
            elevenlabs_api_key: ElevenLabs API 키
            s3_bucket: S3 버킷 이름
            s3_region: S3 리전
            aws_access_key_id: AWS 액세스 키 ID
            aws_secret_access_key: AWS 시크릿 키
        """
        # API 키 설정
        self.elevenlabs_key = elevenlabs_api_key or os.getenv("ELEVENLABS_API_KEY")
        
        if not self.elevenlabs_key:
            raise ValueError("ElevenLabs API key is required. Set ELEVENLABS_API_KEY environment variable.")
        
        if ELEVENLABS_AVAILABLE:
            set_api_key(self.elevenlabs_key)
            self.elevenlabs_client = ElevenLabs(api_key=self.elevenlabs_key)
        else:
            self.elevenlabs_client = None
            logger.warning("ElevenLabs library not available. Install with: pip install elevenlabs")
        
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
        
        # 한국어 음성 ID 매핑 (기본 제공 음성)
        self.korean_voices = self._load_korean_voices()
        
        # 비용 추적
        self.cost_tracker: Dict[str, float] = {
            "elevenlabs": 0.0,
            "s3": 0.0,
            "mixing": 0.0,
        }
    
    def _load_korean_voices(self) -> Dict[str, Dict[str, Any]]:
        """한국어 음성 목록 로드"""
        # 기본 한국어 음성 ID (ElevenLabs 제공)
        # 실제 사용 시 API로 조회하여 동적으로 로드 가능
        return {
            "female_neutral": {
                "voice_id": "EXAVITQu4vr4xnSDxMaL",  # 예시 ID (실제로는 API로 조회)
                "name": "한국어 여성 (중립)",
                "gender": VoiceGender.FEMALE,
                "language": "ko",
            },
            "male_neutral": {
                "voice_id": "pNInz6obpgDQGcFmaJgB",  # 예시 ID
                "name": "한국어 남성 (중립)",
                "gender": VoiceGender.MALE,
                "language": "ko",
            },
            "female_friendly": {
                "voice_id": "EXAVITQu4vr4xnSDxMaL",  # 예시 ID
                "name": "한국어 여성 (친근)",
                "gender": VoiceGender.FEMALE,
                "language": "ko",
            },
            "male_professional": {
                "voice_id": "pNInz6obpgDQGcFmaJgB",  # 예시 ID
                "name": "한국어 남성 (전문적)",
                "gender": VoiceGender.MALE,
                "language": "ko",
            },
        }
    
    def get_available_voices(self) -> List[Dict[str, Any]]:
        """
        사용 가능한 음성 목록 조회
        
        Returns:
            음성 정보 리스트
        """
        if not self.elevenlabs_client:
            return list(self.korean_voices.values())
        
        try:
            all_voices = voices()
            # 한국어 음성 필터링
            korean_voices = [
                {
                    "voice_id": voice.voice_id,
                    "name": voice.name,
                    "language": getattr(voice, "language", "ko"),
                }
                for voice in all_voices
                if "korean" in voice.name.lower() or "korean" in getattr(voice, "language", "").lower()
            ]
            
            if korean_voices:
                return korean_voices
            else:
                logger.warning("No Korean voices found, using default voices")
                return list(self.korean_voices.values())
                
        except Exception as e:
            logger.error(f"Failed to fetch voices: {e}")
            return list(self.korean_voices.values())
    
    def _select_voice_id(
        self, gender: VoiceGender, emotion: EmotionTone, custom_voice_id: Optional[str] = None
    ) -> str:
        """
        음성 ID 선택
        
        Args:
            gender: 성별
            emotion: 감정 톤
            custom_voice_id: 사용자 지정 음성 ID
            
        Returns:
            음성 ID
        """
        if custom_voice_id:
            return custom_voice_id
        
        # 기본 음성 선택
        key = f"{gender.value}_{emotion.value}"
        if key in self.korean_voices:
            return self.korean_voices[key]["voice_id"]
        
        # 성별만 매칭
        gender_key = f"{gender.value}_neutral"
        if gender_key in self.korean_voices:
            return self.korean_voices[gender_key]["voice_id"]
        
        # 기본값
        return self.korean_voices["female_neutral"]["voice_id"]
    
    def _calculate_emotion_settings(
        self, emotion: EmotionTone, stability: float, similarity_boost: float
    ) -> Dict[str, float]:
        """
        감정에 따른 음성 설정 계산
        
        Args:
            emotion: 감정 톤
            stability: 안정성
            similarity_boost: 유사도 부스트
            
        Returns:
            음성 설정 딕셔너리
        """
        # 감정별 기본 설정 조정
        emotion_settings = {
            EmotionTone.NEUTRAL: {"stability": 0.5, "similarity_boost": 0.75},
            EmotionTone.HAPPY: {"stability": 0.4, "similarity_boost": 0.7},
            EmotionTone.SAD: {"stability": 0.6, "similarity_boost": 0.8},
            EmotionTone.EXCITED: {"stability": 0.3, "similarity_boost": 0.65},
            EmotionTone.CALM: {"stability": 0.7, "similarity_boost": 0.85},
            EmotionTone.PROFESSIONAL: {"stability": 0.6, "similarity_boost": 0.8},
            EmotionTone.FRIENDLY: {"stability": 0.45, "similarity_boost": 0.7},
            EmotionTone.DRAMATIC: {"stability": 0.35, "similarity_boost": 0.65},
        }
        
        base_settings = emotion_settings.get(emotion, emotion_settings[EmotionTone.NEUTRAL])
        
        return {
            "stability": stability if stability >= 0 else base_settings["stability"],
            "similarity_boost": similarity_boost if similarity_boost >= 0 else base_settings["similarity_boost"],
        }
    
    def generate_tts(
        self, request: AudioGenerationRequest, max_retries: int = 3
    ) -> AudioGenerationResult:
        """
        TTS 생성
        
        Args:
            request: 생성 요청
            max_retries: 최대 재시도 횟수
            
        Returns:
            생성된 오디오 결과
        """
        if not ELEVENLABS_AVAILABLE:
            raise ValueError("ElevenLabs library not available")
        
        voice_id = self._select_voice_id(request.gender, request.emotion, request.voice_id)
        emotion_settings = self._calculate_emotion_settings(
            request.emotion, request.stability, request.similarity_boost
        )
        
        start_time = time.time()
        
        for attempt in range(max_retries):
            try:
                logger.info(f"Generating TTS (attempt {attempt + 1}/{max_retries})")
                logger.info(f"Text: {request.text[:50]}...")
                logger.info(f"Voice ID: {voice_id}, Emotion: {request.emotion.value}")
                
                # ElevenLabs API 호출
                audio_bytes = generate(
                    text=request.text,
                    voice=voice_id,
                    model="eleven_multilingual_v2",  # 다국어 모델 (한국어 지원)
                    voice_settings=VoiceSettings(
                        stability=emotion_settings["stability"],
                        similarity_boost=emotion_settings["similarity_boost"],
                        style=0.0,  # 스타일 강도
                        use_speaker_boost=True,
                    ),
                )
                
                generation_time = time.time() - start_time
                
                # 오디오 길이 계산
                duration = 0.0
                if PYDUB_AVAILABLE:
                    try:
                        audio = AudioSegment.from_mp3(BytesIO(audio_bytes))
                        duration = len(audio) / 1000.0  # 밀리초를 초로 변환
                    except Exception as e:
                        logger.warning(f"Failed to calculate audio duration: {e}")
                
                # 속도 조절 (요청된 속도가 1.0이 아니면)
                if request.speed != 1.0 and PYDUB_AVAILABLE:
                    try:
                        audio = AudioSegment.from_mp3(BytesIO(audio_bytes))
                        # 속도 변경 (샘플레이트 조정)
                        audio = audio.speedup(playback_speed=request.speed)
                        buffer = BytesIO()
                        audio.export(buffer, format="mp3")
                        audio_bytes = buffer.getvalue()
                    except Exception as e:
                        logger.warning(f"Failed to adjust speed: {e}")
                
                # 비용 추적 (ElevenLabs: 약 $0.30 per 1000 characters)
                estimated_cost = (len(request.text) / 1000) * 0.30
                self.cost_tracker["elevenlabs"] += estimated_cost
                
                result = AudioGenerationResult(
                    audio_bytes=audio_bytes,
                    duration=duration,
                    cost=estimated_cost,
                    provider="elevenlabs",
                    voice_id=voice_id,
                    generation_time=generation_time,
                )
                
                logger.info(f"Successfully generated TTS (duration: {duration:.2f}s, cost: ${estimated_cost:.4f})")
                return result
                
            except Exception as e:
                logger.warning(f"TTS generation failed (attempt {attempt + 1}/{max_retries}): {e}")
                if attempt < max_retries - 1:
                    time.sleep(2 ** attempt)  # 지수 백오프
                else:
                    raise
        
        raise Exception("TTS generation failed after all retries")
    
    def mix_background_music(
        self,
        tts_audio_bytes: bytes,
        background_music_url: Optional[str] = None,
        background_music_bytes: Optional[bytes] = None,
        volume: float = 0.3,
    ) -> bytes:
        """
        배경음악 믹싱
        
        Args:
            tts_audio_bytes: TTS 오디오 바이트
            background_music_url: 배경음악 URL
            background_music_bytes: 배경음악 바이트
            volume: 배경음악 볼륨 (0.0 ~ 1.0)
            
        Returns:
            믹싱된 오디오 바이트
        """
        if not PYDUB_AVAILABLE:
            logger.warning("pydub not available, skipping background music mixing")
            return tts_audio_bytes
        
        try:
            # TTS 오디오 로드
            tts_audio = AudioSegment.from_mp3(BytesIO(tts_audio_bytes))
            
            # 배경음악 로드
            if background_music_bytes:
                bg_audio = AudioSegment.from_mp3(BytesIO(background_music_bytes))
            elif background_music_url:
                import httpx
                with httpx.Client() as client:
                    response = client.get(background_music_url, timeout=30.0)
                    response.raise_for_status()
                    bg_audio = AudioSegment.from_mp3(BytesIO(response.content))
            else:
                return tts_audio_bytes
            
            # 배경음악 길이 조정 (TTS 길이에 맞춤)
            if len(bg_audio) < len(tts_audio):
                # 반복
                repeat_count = (len(tts_audio) // len(bg_audio)) + 1
                bg_audio = bg_audio * repeat_count
            
            # TTS 길이에 맞춰 자르기
            bg_audio = bg_audio[:len(tts_audio)]
            
            # 볼륨 조정
            bg_audio = bg_audio - (20 * (1 - volume))  # 볼륨 감소 (dB)
            
            # 믹싱
            mixed_audio = tts_audio.overlay(bg_audio)
            
            # 정규화
            mixed_audio = normalize(mixed_audio)
            
            # MP3로 내보내기
            buffer = BytesIO()
            mixed_audio.export(buffer, format="mp3", bitrate="192k")
            
            logger.info(f"Successfully mixed background music (volume: {volume})")
            return buffer.getvalue()
            
        except Exception as e:
            logger.error(f"Background music mixing failed: {e}")
            return tts_audio_bytes
    
    def upload_to_s3(
        self, audio_bytes: bytes, key: str, content_type: str = "audio/mpeg"
    ) -> str:
        """
        S3에 오디오 업로드
        
        Args:
            audio_bytes: 오디오 바이트
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
                Body=audio_bytes,
                ContentType=content_type,
                ACL="public-read",
            )
            
            # URL 생성
            url = f"https://{self.s3_bucket}.s3.{self.s3_region}.amazonaws.com/{key}"
            
            # 비용 추적 (S3: 약 $0.023 per GB storage, $0.005 per 1000 requests)
            estimated_cost = (len(audio_bytes) / 1_000_000_000) * 0.023 + 0.000005
            self.cost_tracker["s3"] += estimated_cost
            
            logger.info(f"Uploaded audio to S3: {url}")
            return url
            
        except ClientError as e:
            logger.error(f"S3 upload failed: {e}")
            raise
    
    def generate(
        self,
        request: AudioGenerationRequest,
        upload_to_s3: bool = True,
    ) -> AudioGenerationResult:
        """
        오디오 생성 (메인 메서드)
        
        Args:
            request: 생성 요청
            upload_to_s3: S3 업로드 여부
            
        Returns:
            생성된 오디오 결과
        """
        # TTS 생성
        result = self.generate_tts(request)
        
        # 배경음악 믹싱
        if request.background_music_url or request.background_music_volume > 0:
            try:
                mixed_audio = self.mix_background_music(
                    result.audio_bytes,
                    background_music_url=request.background_music_url,
                    volume=request.background_music_volume,
                )
                result.audio_bytes = mixed_audio
                self.cost_tracker["mixing"] += 0.001  # 믹싱 비용 (무시 가능)
            except Exception as e:
                logger.warning(f"Background music mixing failed: {e}")
        
        # S3 업로드
        if upload_to_s3 and self.s3_client and result.audio_bytes:
            import uuid
            from datetime import datetime
            
            key = f"audio/{datetime.now().strftime('%Y/%m/%d')}/{uuid.uuid4()}.mp3"
            s3_url = self.upload_to_s3(result.audio_bytes, key)
            result.audio_url = s3_url
        
        return result
    
    def generate_batch(
        self,
        texts: List[str],
        gender: VoiceGender = VoiceGender.FEMALE,
        emotion: EmotionTone = EmotionTone.NEUTRAL,
        upload_to_s3: bool = True,
    ) -> List[AudioGenerationResult]:
        """
        배치 오디오 생성
        
        Args:
            texts: 텍스트 리스트
            gender: 성별
            emotion: 감정 톤
            upload_to_s3: S3 업로드 여부
            
        Returns:
            각 텍스트별 생성 결과 리스트
        """
        results = []
        
        for i, text in enumerate(texts):
            logger.info(f"Generating audio {i + 1}/{len(texts)}: {text[:50]}...")
            
            request = AudioGenerationRequest(
                text=text,
                gender=gender,
                emotion=emotion,
            )
            
            try:
                result = self.generate(request, upload_to_s3=upload_to_s3)
                results.append(result)
            except Exception as e:
                logger.error(f"Failed to generate audio {i + 1}: {e}")
                results.append(
                    AudioGenerationResult(
                        audio_url="",
                        cost=0.0,
                        provider="elevenlabs",
                        voice_id="",
                    )
                )
        
        return results
    
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
