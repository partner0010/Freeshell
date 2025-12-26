/**
 * AI 음악 생성기
 * AI Music Generator
 * 2025년 최신 음악 생성 트렌드 반영 (Suno, Udio 등)
 */

export interface MusicConfig {
  topic?: string;
  genre: 'pop' | 'rock' | 'electronic' | 'jazz' | 'classical' | 'hip-hop' | 'ambient';
  mood: 'energetic' | 'calm' | 'happy' | 'sad' | 'dramatic' | 'romantic';
  duration: number; // 초 단위
  tempo: 'slow' | 'medium' | 'fast';
  instruments: string[];
  vocals: boolean;
  lyrics?: string;
  style: string;
  service?: 'remusic' | 'anymusic' | 'msong' | 'default';
}

export interface MusicTrack {
  id: string;
  title: string;
  url?: string;
  duration: number;
  genre: string;
  mood: string;
  metadata: {
    bpm: number;
    key: string;
    instruments: string[];
    service?: string;
  };
  createdAt: number;
}

export interface SongConfig {
  topic: string;
  lyrics: string;
  genre: 'pop' | 'rock' | 'electronic' | 'jazz' | 'classical' | 'hip-hop' | 'ambient';
  mood: 'energetic' | 'calm' | 'happy' | 'sad' | 'dramatic' | 'romantic';
  duration: number;
  tempo: 'slow' | 'medium' | 'fast';
  style: string;
  service?: 'aisongmaker' | 'musichero' | 'default';
}

export interface Song {
  id: string;
  title: string;
  lyrics: string;
  url?: string;
  duration: number;
  genre: string;
  mood: string;
  metadata: {
    bpm: number;
    key: string;
    service?: string;
  };
  createdAt: number;
}

/**
 * AI 음악 생성기
 */
export class MusicGenerator {
  /**
   * 음악 제목 생성
   */
  generateTitle(genre: string, mood: string): string {
    const titles: Record<string, Record<string, string[]>> = {
      pop: {
        energetic: ['Upbeat Pop', 'Energy Boost', 'Feel Good'],
        calm: ['Chill Pop', 'Relaxing Vibes', 'Smooth Pop'],
      },
      electronic: {
        energetic: ['Electronic Pulse', 'Dance Beat', 'Synth Wave'],
        calm: ['Ambient Electronic', 'Chill Electronic', 'Soft Synth'],
      },
    };

    const genreTitles = titles[genre]?.[mood] || ['Generated Track'];
    return genreTitles[Math.floor(Math.random() * genreTitles.length)];
  }

  /**
   * 음악 생성 (온라인 AI 음악 생성 도구 활용)
   * Remusic, AnyMusic, MSong.ai 등 활용
   */
  async generateMusic(config: MusicConfig): Promise<MusicTrack> {
    const title = config.topic 
      ? `${config.topic} - ${this.generateTitle(config.genre, config.mood)}`
      : this.generateTitle(config.genre, config.mood);
    
    const service = config.service || 'default';
    const bpm = this.getBPM(config.tempo);
    const key = this.getRandomKey();

    // 온라인 AI 음악 생성 서비스 시뮬레이션
    // 실제 구현 시에는 각 서비스의 API를 호출
    let serviceUrl = '';
    let serviceName = '';

    switch (service) {
      case 'remusic':
        // Remusic API 호출 시뮬레이션
        // 실제: https://remusic.ai API 사용
        serviceName = 'Remusic';
        serviceUrl = `https://remusic.ai/generate?genre=${config.genre}&mood=${config.mood}&duration=${config.duration}`;
        break;
      case 'anymusic':
        // AnyMusic API 호출 시뮬레이션
        // 실제: https://anymusic.ai API 사용
        serviceName = 'AnyMusic';
        serviceUrl = `https://anymusic.ai/generate?text=${encodeURIComponent(config.topic || '')}&genre=${config.genre}`;
        break;
      case 'msong':
        // MSong.ai API 호출 시뮬레이션
        // 실제: https://msong.ai API 사용
        serviceName = 'MSong.ai';
        serviceUrl = `https://msong.ai/create?idea=${encodeURIComponent(config.topic || '')}`;
        break;
      default:
        serviceName = 'Default Generator';
    }

    // 실제 API 호출은 환경 변수에 API 키가 있을 때만 수행
    const apiKey = process.env.REMUSIC_API_KEY || process.env.ANYMUSIC_API_KEY || process.env.MSONG_API_KEY;
    if (apiKey && service !== 'default') {
      try {
        // 실제 API 호출 시도
        const response = await fetch(serviceUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            genre: config.genre,
            mood: config.mood,
            duration: config.duration,
            topic: config.topic,
            instruments: config.instruments,
            vocals: config.vocals,
          }),
        });

        if (response.ok) {
          const apiData = await response.json();
          return {
            id: `music-${Date.now()}`,
            title,
            url: apiData.url || apiData.downloadUrl || serviceUrl,
            duration: config.duration,
            genre: config.genre,
            mood: config.mood,
            metadata: {
              bpm,
              key,
              instruments: config.instruments,
              service: serviceName,
            },
            createdAt: Date.now(),
          };
        }
      } catch (error) {
        console.warn(`음악 생성 API 호출 실패 (${serviceName}):`, error);
        // API 호출 실패 시 기본 생성으로 폴백
      }
    }

    return {
      id: `music-${Date.now()}`,
      title,
      url: serviceUrl || undefined,
      duration: config.duration,
      genre: config.genre,
      mood: config.mood,
      metadata: {
        bpm,
        key,
        instruments: config.instruments,
        service: serviceName,
      },
      createdAt: Date.now(),
    };
  }

  /**
   * 노래 생성 (가사에서 노래 생성)
   * AI Song Maker, MusicHero.ai 등 활용
   */
  async generateSong(config: SongConfig): Promise<Song> {
    const title = config.topic || 'Generated Song';
    const service = config.service || 'default';
    const bpm = this.getBPM(config.tempo);
    const key = this.getRandomKey();

    // 온라인 AI 노래 생성 서비스 시뮬레이션
    let serviceUrl = '';
    let serviceName = '';

    switch (service) {
      case 'aisongmaker':
        // AI Song Maker API 호출 시뮬레이션
        // 실제: https://aisongmaker.io API 사용
        serviceName = 'AI Song Maker';
        serviceUrl = `https://aisongmaker.io/lyrics-to-song?lyrics=${encodeURIComponent(config.lyrics)}&genre=${config.genre}`;
        break;
      case 'musichero':
        // MusicHero.ai API 호출 시뮬레이션
        // 실제: https://musichero.ai API 사용
        serviceName = 'MusicHero.ai';
        serviceUrl = `https://musichero.ai/generate?lyrics=${encodeURIComponent(config.lyrics)}&style=${config.style}`;
        break;
      default:
        serviceName = 'Default Generator';
    }

    // 실제 API 호출은 환경 변수에 API 키가 있을 때만 수행
    const apiKey = process.env.AISONGMAKER_API_KEY || process.env.MUSICHERO_API_KEY;
    if (apiKey && service !== 'default') {
      try {
        // 실제 API 호출 시도
        const response = await fetch(serviceUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            lyrics: config.lyrics,
            genre: config.genre,
            mood: config.mood,
            style: config.style,
            duration: config.duration,
            tempo: config.tempo,
          }),
        });

        if (response.ok) {
          const apiData = await response.json();
          return {
            id: `song-${Date.now()}`,
            title,
            lyrics: config.lyrics,
            url: apiData.url || apiData.downloadUrl || serviceUrl,
            duration: config.duration,
            genre: config.genre,
            mood: config.mood,
            metadata: {
              bpm,
              key,
              service: serviceName,
            },
            createdAt: Date.now(),
          };
        }
      } catch (error) {
        console.warn(`노래 생성 API 호출 실패 (${serviceName}):`, error);
        // API 호출 실패 시 기본 생성으로 폴백
      }
    }

    return {
      id: `song-${Date.now()}`,
      title,
      lyrics: config.lyrics,
      url: serviceUrl || undefined,
      duration: config.duration,
      genre: config.genre,
      mood: config.mood,
      metadata: {
        bpm,
        key,
        service: serviceName,
      },
      createdAt: Date.now(),
    };
  }

  /**
   * BPM 계산
   */
  private getBPM(tempo: 'slow' | 'medium' | 'fast'): number {
    const bpmMap = {
      slow: 60,
      medium: 120,
      fast: 180,
    };
    return bpmMap[tempo] + Math.floor(Math.random() * 20) - 10;
  }

  /**
   * 랜덤 키 생성
   */
  private getRandomKey(): string {
    const keys = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    const modes = ['major', 'minor'];
    const key = keys[Math.floor(Math.random() * keys.length)];
    const mode = modes[Math.floor(Math.random() * modes.length)];
    return `${key} ${mode}`;
  }

  /**
   * 장르별 추천 설정
   */
  getRecommendedConfig(genre: string): Partial<MusicConfig> {
    const recommendations: Record<string, Partial<MusicConfig>> = {
      pop: {
        tempo: 'medium',
        instruments: ['piano', 'guitar', 'drums', 'bass'],
        vocals: true,
      },
      electronic: {
        tempo: 'fast',
        instruments: ['synthesizer', 'drum machine', 'bass'],
        vocals: false,
      },
      ambient: {
        tempo: 'slow',
        instruments: ['pad', 'strings', 'atmosphere'],
        vocals: false,
      },
    };

    return recommendations[genre] || {};
  }
}

