"""
이미지 생성 서비스
Stable Diffusion API 연동, 번역, S3 업로드
"""

import os
import time
import base64
from typing import Optional, List, Dict, Any, Tuple
from enum import Enum
from io import BytesIO
from dataclasses import dataclass

try:
    import replicate
    REPLICATE_AVAILABLE = True
except ImportError:
    REPLICATE_AVAILABLE = False

try:
    import boto3
    from botocore.exceptions import ClientError
    BOTO3_AVAILABLE = True
except ImportError:
    BOTO3_AVAILABLE = False

from openai import OpenAI
from ..utils.logger import get_logger

logger = get_logger(__name__)


class ImageStyle(str, Enum):
    """이미지 스타일 프리셋"""
    REALISTIC = "realistic"
    ANIME = "anime"
    CINEMATIC = "cinematic"
    ARTISTIC = "artistic"
    PHOTOGRAPHIC = "photographic"
    DIGITAL_ART = "digital_art"
    SKETCH = "sketch"
    WATERCOLOR = "watercolor"


class ImageProvider(str, Enum):
    """이미지 생성 제공자"""
    REPLICATE = "replicate"
    STABILITY_AI = "stability_ai"


@dataclass
class ImageGenerationRequest:
    """이미지 생성 요청"""
    prompt: str
    style: ImageStyle = ImageStyle.REALISTIC
    width: int = 1024
    height: int = 1024
    num_images: int = 1
    negative_prompt: Optional[str] = None
    seed: Optional[int] = None


@dataclass
class ImageGenerationResult:
    """이미지 생성 결과"""
    image_url: str
    image_bytes: Optional[bytes] = None
    cost: float = 0.0
    provider: str = ""
    model: str = ""
    generation_time: float = 0.0


class ImageGenerator:
    """이미지 생성 서비스"""

    def __init__(
        self,
        replicate_api_token: Optional[str] = None,
        stability_api_key: Optional[str] = None,
        openai_api_key: Optional[str] = None,
        s3_bucket: Optional[str] = None,
        s3_region: Optional[str] = None,
        aws_access_key_id: Optional[str] = None,
        aws_secret_access_key: Optional[str] = None,
    ):
        """
        이미지 생성기 초기화
        
        Args:
            replicate_api_token: Replicate API 토큰
            stability_api_key: Stability AI API 키
            openai_api_key: OpenAI API 키 (번역용)
            s3_bucket: S3 버킷 이름
            s3_region: S3 리전
            aws_access_key_id: AWS 액세스 키 ID
            aws_secret_access_key: AWS 시크릿 키
        """
        # API 키 설정
        self.replicate_token = replicate_api_token or os.getenv("REPLICATE_API_TOKEN")
        self.stability_key = stability_api_key or os.getenv("STABILITY_API_KEY")
        self.openai_key = openai_api_key or os.getenv("OPENAI_API_KEY")
        
        # S3 설정
        self.s3_bucket = s3_bucket or os.getenv("S3_BUCKET")
        self.s3_region = s3_region or os.getenv("S3_REGION", "us-east-1")
        self.aws_access_key_id = aws_access_key_id or os.getenv("AWS_ACCESS_KEY_ID")
        self.aws_secret_access_key = aws_secret_access_key or os.getenv("AWS_SECRET_ACCESS_KEY")
        
        # Replicate 클라이언트
        if REPLICATE_AVAILABLE and self.replicate_token:
            os.environ["REPLICATE_API_TOKEN"] = self.replicate_token
            self.replicate_client = replicate.Client(api_token=self.replicate_token)
        else:
            self.replicate_client = None
        
        # OpenAI 클라이언트 (번역용)
        if self.openai_key:
            self.openai_client = OpenAI(api_key=self.openai_key)
        else:
            self.openai_client = None
        
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
        
        # 모델 설정
        self.default_model = "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b"
        self.fallback_model = "stability-ai/stable-diffusion:db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf"
        
        # 비용 추적
        self.cost_tracker: Dict[str, float] = {
            "replicate": 0.0,
            "stability_ai": 0.0,
            "translation": 0.0,
            "s3": 0.0,
        }
        
        # 스타일 프리셋
        self.style_presets = self._load_style_presets()
    
    def _load_style_presets(self) -> Dict[ImageStyle, Dict[str, Any]]:
        """스타일 프리셋 로드"""
        return {
            ImageStyle.REALISTIC: {
                "prompt_suffix": ", highly detailed, photorealistic, 8k, professional photography",
                "negative_prompt": "cartoon, anime, illustration, painting, drawing, art, sketch, watermark, signature",
            },
            ImageStyle.ANIME: {
                "prompt_suffix": ", anime style, vibrant colors, detailed, high quality",
                "negative_prompt": "realistic, photorealistic, 3d render",
            },
            ImageStyle.CINEMATIC: {
                "prompt_suffix": ", cinematic lighting, dramatic, film grain, movie still, professional cinematography",
                "negative_prompt": "amateur, low quality, blurry",
            },
            ImageStyle.ARTISTIC: {
                "prompt_suffix": ", artistic, creative, unique style, masterpiece",
                "negative_prompt": "generic, boring, simple",
            },
            ImageStyle.PHOTOGRAPHIC: {
                "prompt_suffix": ", professional photography, sharp focus, high resolution",
                "negative_prompt": "blurry, low quality, distorted",
            },
            ImageStyle.DIGITAL_ART: {
                "prompt_suffix": ", digital art, concept art, detailed, vibrant",
                "negative_prompt": "photorealistic, photograph",
            },
            ImageStyle.SKETCH: {
                "prompt_suffix": ", pencil sketch, line art, black and white",
                "negative_prompt": "color, painting, photograph",
            },
            ImageStyle.WATERCOLOR: {
                "prompt_suffix": ", watercolor painting, soft colors, artistic",
                "negative_prompt": "photorealistic, digital, sharp",
            },
        }
    
    def translate_prompt(self, text: str, target_lang: str = "en") -> str:
        """
        프롬프트 번역 (한글 → 영문)
        
        Args:
            text: 번역할 텍스트
            target_lang: 대상 언어 (기본: en)
            
        Returns:
            번역된 텍스트
        """
        if not self.openai_client:
            logger.warning("OpenAI client not available, skipping translation")
            return text
        
        try:
            # 간단한 언어 감지 (한글이 포함되어 있으면 번역)
            has_korean = any("\uAC00" <= char <= "\uD7A3" for char in text)
            if not has_korean:
                return text
            
            response = self.openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "system",
                        "content": "You are a professional translator. Translate the given text to English, preserving the meaning and style. Return only the translated text without any explanation.",
                    },
                    {
                        "role": "user",
                        "content": text,
                    },
                ],
                temperature=0.3,
                max_tokens=500,
            )
            
            translated = response.choices[0].message.content.strip()
            
            # 비용 추적 (GPT-4o-mini: 약 $0.15/1M input, $0.60/1M output)
            estimated_cost = (len(text) / 1_000_000) * 0.15 + (len(translated) / 1_000_000) * 0.60
            self.cost_tracker["translation"] += estimated_cost
            
            logger.info(f"Translated prompt: {text[:50]}... -> {translated[:50]}...")
            return translated
            
        except Exception as e:
            logger.error(f"Translation failed: {e}, using original text")
            return text
    
    def _apply_style_preset(
        self, prompt: str, style: ImageStyle, negative_prompt: Optional[str] = None
    ) -> Tuple[str, str]:
        """
        스타일 프리셋 적용
        
        Args:
            prompt: 원본 프롬프트
            style: 스타일
            negative_prompt: 기존 negative prompt
            
        Returns:
            (수정된 프롬프트, negative 프롬프트)
        """
        preset = self.style_presets.get(style, {})
        
        enhanced_prompt = prompt
        if preset.get("prompt_suffix"):
            enhanced_prompt = f"{prompt} {preset['prompt_suffix']}"
        
        final_negative = negative_prompt or ""
        if preset.get("negative_prompt"):
            if final_negative:
                final_negative = f"{final_negative}, {preset['negative_prompt']}"
            else:
                final_negative = preset["negative_prompt"]
        
        return enhanced_prompt, final_negative
    
    def generate_with_replicate(
        self, request: ImageGenerationRequest, max_retries: int = 3
    ) -> List[ImageGenerationResult]:
        """
        Replicate를 사용한 이미지 생성
        
        Args:
            request: 생성 요청
            max_retries: 최대 재시도 횟수
            
        Returns:
            생성된 이미지 결과 리스트
        """
        if not self.replicate_client:
            raise ValueError("Replicate client not initialized")
        
        # 프롬프트 번역
        translated_prompt = self.translate_prompt(request.prompt)
        
        # 스타일 적용
        enhanced_prompt, negative_prompt = self._apply_style_preset(
            translated_prompt, request.style, request.negative_prompt
        )
        
        results = []
        start_time = time.time()
        
        for attempt in range(max_retries):
            try:
                model = self.default_model if attempt == 0 else self.fallback_model
                
                logger.info(f"Generating image with Replicate (attempt {attempt + 1}/{max_retries})")
                logger.info(f"Model: {model}")
                logger.info(f"Prompt: {enhanced_prompt[:100]}...")
                
                output = self.replicate_client.run(
                    model,
                    input={
                        "prompt": enhanced_prompt,
                        "negative_prompt": negative_prompt or "",
                        "width": request.width,
                        "height": request.height,
                        "num_outputs": request.num_images,
                        "seed": request.seed,
                    },
                )
                
                # Replicate는 URL 리스트를 반환
                if isinstance(output, list):
                    urls = output
                elif isinstance(output, str):
                    urls = [output]
                else:
                    urls = list(output) if hasattr(output, "__iter__") else [str(output)]
                
                generation_time = time.time() - start_time
                
                # 비용 추적 (Replicate: 모델별 가격 상이, 대략 $0.002-0.01 per image)
                estimated_cost = len(urls) * 0.005
                self.cost_tracker["replicate"] += estimated_cost
                
                for url in urls:
                    results.append(
                        ImageGenerationResult(
                            image_url=url,
                            cost=estimated_cost / len(urls),
                            provider="replicate",
                            model=model,
                            generation_time=generation_time / len(urls),
                        )
                    )
                
                logger.info(f"Successfully generated {len(results)} images")
                return results
                
            except Exception as e:
                logger.warning(f"Replicate generation failed (attempt {attempt + 1}/{max_retries}): {e}")
                if attempt < max_retries - 1:
                    time.sleep(2 ** attempt)  # 지수 백오프
                else:
                    raise
        
        return results
    
    def generate_with_stability_ai(
        self, request: ImageGenerationRequest, max_retries: int = 3
    ) -> List[ImageGenerationResult]:
        """
        Stability AI를 사용한 이미지 생성
        
        Args:
            request: 생성 요청
            max_retries: 최대 재시도 횟수
            
        Returns:
            생성된 이미지 결과 리스트
        """
        if not self.stability_key:
            raise ValueError("Stability AI API key not set")
        
        # 프롬프트 번역
        translated_prompt = self.translate_prompt(request.prompt)
        
        # 스타일 적용
        enhanced_prompt, negative_prompt = self._apply_style_preset(
            translated_prompt, request.style, request.negative_prompt
        )
        
        import httpx
        
        results = []
        start_time = time.time()
        
        for attempt in range(max_retries):
            try:
                url = "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image"
                
                headers = {
                    "Accept": "application/json",
                    "Authorization": f"Bearer {self.stability_key}",
                }
                
                data = {
                    "text_prompts": [
                        {"text": enhanced_prompt, "weight": 1.0},
                    ],
                    "cfg_scale": 7,
                    "height": request.height,
                    "width": request.width,
                    "samples": request.num_images,
                    "steps": 30,
                }
                
                if negative_prompt:
                    data["text_prompts"].append({"text": negative_prompt, "weight": -1.0})
                
                if request.seed:
                    data["seed"] = request.seed
                
                logger.info(f"Generating image with Stability AI (attempt {attempt + 1}/{max_retries})")
                
                with httpx.Client(timeout=120.0) as client:
                    response = client.post(url, headers=headers, json=data)
                    response.raise_for_status()
                    
                    result = response.json()
                    
                    generation_time = time.time() - start_time
                    
                    # 비용 추적 (Stability AI: 약 $0.04 per image)
                    estimated_cost = len(result.get("artifacts", [])) * 0.04
                    self.cost_tracker["stability_ai"] += estimated_cost
                    
                    for artifact in result.get("artifacts", []):
                        if artifact.get("base64"):
                            # Base64 디코딩
                            image_bytes = base64.b64decode(artifact["base64"])
                            
                            # 임시 URL 생성 (S3 업로드 필요)
                            image_url = f"data:image/png;base64,{artifact['base64']}"
                            
                            results.append(
                                ImageGenerationResult(
                                    image_url=image_url,
                                    image_bytes=image_bytes,
                                    cost=estimated_cost / len(result.get("artifacts", [])),
                                    provider="stability_ai",
                                    model="stable-diffusion-xl-1024-v1-0",
                                    generation_time=generation_time / len(result.get("artifacts", [])),
                                )
                            )
                    
                    logger.info(f"Successfully generated {len(results)} images")
                    return results
                    
            except Exception as e:
                logger.warning(f"Stability AI generation failed (attempt {attempt + 1}/{max_retries}): {e}")
                if attempt < max_retries - 1:
                    time.sleep(2 ** attempt)
                else:
                    raise
        
        return results
    
    def upload_to_s3(
        self, image_bytes: bytes, key: str, content_type: str = "image/png"
    ) -> str:
        """
        S3에 이미지 업로드
        
        Args:
            image_bytes: 이미지 바이트
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
                Body=image_bytes,
                ContentType=content_type,
                ACL="public-read",  # 또는 버킷 정책으로 관리
            )
            
            # URL 생성
            url = f"https://{self.s3_bucket}.s3.{self.s3_region}.amazonaws.com/{key}"
            
            # 비용 추적 (S3: 약 $0.023 per GB storage, $0.005 per 1000 requests)
            estimated_cost = (len(image_bytes) / 1_000_000_000) * 0.023 + 0.000005
            self.cost_tracker["s3"] += estimated_cost
            
            logger.info(f"Uploaded image to S3: {url}")
            return url
            
        except ClientError as e:
            logger.error(f"S3 upload failed: {e}")
            raise
    
    def generate(
        self,
        request: ImageGenerationRequest,
        provider: ImageProvider = ImageProvider.REPLICATE,
        upload_to_s3: bool = True,
    ) -> List[ImageGenerationResult]:
        """
        이미지 생성 (메인 메서드)
        
        Args:
            request: 생성 요청
            provider: 제공자 (Replicate 또는 Stability AI)
            upload_to_s3: S3 업로드 여부
            
        Returns:
            생성된 이미지 결과 리스트
        """
        try:
            # 제공자에 따라 생성
            if provider == ImageProvider.REPLICATE:
                results = self.generate_with_replicate(request)
            elif provider == ImageProvider.STABILITY_AI:
                results = self.generate_with_stability_ai(request)
            else:
                raise ValueError(f"Unknown provider: {provider}")
            
            # S3 업로드
            if upload_to_s3 and self.s3_client:
                import uuid
                from datetime import datetime
                
                for result in results:
                    if result.image_bytes:
                        # 이미 바이트가 있으면 업로드
                        key = f"images/{datetime.now().strftime('%Y/%m/%d')}/{uuid.uuid4()}.png"
                        s3_url = self.upload_to_s3(result.image_bytes, key)
                        result.image_url = s3_url
                    elif result.image_url and result.image_url.startswith("http"):
                        # URL에서 다운로드 후 업로드
                        try:
                            import httpx
                            with httpx.Client() as client:
                                response = client.get(result.image_url, timeout=30.0)
                                response.raise_for_status()
                                
                                key = f"images/{datetime.now().strftime('%Y/%m/%d')}/{uuid.uuid4()}.png"
                                s3_url = self.upload_to_s3(response.content, key)
                                result.image_url = s3_url
                        except Exception as e:
                            logger.warning(f"Failed to upload from URL to S3: {e}")
            
            return results
            
        except Exception as e:
            logger.error(f"Image generation failed: {e}")
            # 대체 제공자 시도
            if provider == ImageProvider.REPLICATE and self.stability_key:
                logger.info("Trying fallback provider: Stability AI")
                return self.generate(request, provider=ImageProvider.STABILITY_AI, upload_to_s3=upload_to_s3)
            elif provider == ImageProvider.STABILITY_AI and self.replicate_client:
                logger.info("Trying fallback provider: Replicate")
                return self.generate(request, provider=ImageProvider.REPLICATE, upload_to_s3=upload_to_s3)
            else:
                raise
    
    def generate_batch(
        self,
        prompts: List[str],
        style: ImageStyle = ImageStyle.REALISTIC,
        provider: ImageProvider = ImageProvider.REPLICATE,
        upload_to_s3: bool = True,
    ) -> List[List[ImageGenerationResult]]:
        """
        배치 이미지 생성 (여러 씬)
        
        Args:
            prompts: 프롬프트 리스트
            style: 스타일
            provider: 제공자
            upload_to_s3: S3 업로드 여부
            
        Returns:
            각 프롬프트별 생성 결과 리스트
        """
        results = []
        
        for i, prompt in enumerate(prompts):
            logger.info(f"Generating image {i + 1}/{len(prompts)}: {prompt[:50]}...")
            
            request = ImageGenerationRequest(
                prompt=prompt,
                style=style,
                num_images=1,
            )
            
            try:
                result = self.generate(request, provider=provider, upload_to_s3=upload_to_s3)
                results.append(result)
            except Exception as e:
                logger.error(f"Failed to generate image {i + 1}: {e}")
                results.append([])
        
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
