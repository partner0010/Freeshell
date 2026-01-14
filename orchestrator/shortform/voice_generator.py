"""
음성 생성기
"""

from typing import Dict, Any
import os
import subprocess
from pathlib import Path

from ..utils.logger import get_logger

logger = get_logger(__name__)


class VoiceGenerator:
    """음성 생성기 (TTS)"""
    
    def __init__(self, output_dir: str = "storage/voices"):
        self.output_dir = output_dir
        os.makedirs(output_dir, exist_ok=True)
    
    async def generate(self, text: str, duration: int) -> Dict[str, Any]:
        """
        음성 생성
        
        Args:
            text: 텍스트
            duration: 영상 길이 (초)
            
        Returns:
            생성 결과
        """
        try:
            # edge-tts 사용 (무료)
            output_path = os.path.join(self.output_dir, f"voice_{hash(text) % 1000000}.mp3")
            
            # edge-tts 명령 실행
            cmd = [
                'edge-tts',
                '--text', text,
                '--voice', 'ko-KR-InJoonNeural',  # 한국어 남성
                '--write-media', output_path
            ]
            
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=30
            )
            
            if result.returncode == 0 and os.path.exists(output_path):
                return {
                    'success': True,
                    'voice_path': output_path,
                    'duration': duration
                }
            else:
                # Fallback: 기본 음성 파일 사용
                logger.warning("TTS failed, using fallback")
                return self._generate_fallback_voice(duration)
                
        except FileNotFoundError:
            # edge-tts가 설치되지 않은 경우
            logger.warning("edge-tts not found, using fallback")
            return self._generate_fallback_voice(duration)
        except Exception as e:
            logger.error(f"Voice generation error: {e}")
            return self._generate_fallback_voice(duration)
    
    def _generate_fallback_voice(self, duration: int) -> Dict[str, Any]:
        """Fallback 음성 생성"""
        # 기본 음성 파일 경로 (사전 준비 필요)
        fallback_path = "templates/default_voice.mp3"
        
        if os.path.exists(fallback_path):
            return {
                'success': True,
                'voice_path': fallback_path,
                'duration': duration,
                'fallback': True
            }
        else:
            # 음성 파일이 없으면 빈 오디오 생성
            output_path = os.path.join(self.output_dir, f"silence_{duration}.mp3")
            cmd = [
                'ffmpeg', '-y',
                '-f', 'lavfi',
                '-i', f'anullsrc=channel_layout=stereo:sample_rate=44100',
                '-t', str(duration),
                output_path
            ]
            
            try:
                subprocess.run(cmd, capture_output=True, timeout=10, check=True)
                return {
                    'success': True,
                    'voice_path': output_path,
                    'duration': duration,
                    'fallback': True,
                    'silence': True
                }
            except Exception as e:
                logger.error(f"Fallback voice generation failed: {e}")
                return {
                    'success': False,
                    'error': 'Voice generation failed'
                }
