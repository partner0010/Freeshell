/**
 * 무료 API 서비스 통합
 * 여러 곳에서 따로 사용해야 하는 무료 API들을 한 곳에서 통합 제공
 */

/**
 * DuckDuckGo 웹 검색 API (무료, API 키 불필요)
 */
export async function searchDuckDuckGo(query: string): Promise<Array<{ title: string; url: string; snippet: string }>> {
  try {
    // DuckDuckGo Instant Answer API 사용
    const response = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`);
    const data = await response.json();
    
    const results: Array<{ title: string; url: string; snippet: string }> = [];
    
    // Abstract 결과 추가
    if (data.AbstractText) {
      results.push({
        title: data.Heading || query,
        url: data.AbstractURL || '',
        snippet: data.AbstractText,
      });
    }
    
    // RelatedTopics 추가
    if (data.RelatedTopics && Array.isArray(data.RelatedTopics)) {
      data.RelatedTopics.slice(0, 5).forEach((topic: any) => {
        if (topic.Text && topic.FirstURL) {
          results.push({
            title: topic.Text.split(' - ')[0],
            url: topic.FirstURL,
            snippet: topic.Text,
          });
        }
      });
    }
    
    // Results 추가
    if (data.Results && Array.isArray(data.Results)) {
      data.Results.slice(0, 5).forEach((result: any) => {
        results.push({
          title: result.Text,
          url: result.FirstURL,
          snippet: result.Text,
        });
      });
    }
    
    return results.length > 0 ? results : [
      { title: query, url: `https://duckduckgo.com/?q=${encodeURIComponent(query)}`, snippet: '검색 결과를 찾을 수 없습니다.' },
    ];
  } catch (error) {
    console.error('DuckDuckGo search error:', error);
    return [{ title: query, url: `https://duckduckgo.com/?q=${encodeURIComponent(query)}`, snippet: '검색 중 오류가 발생했습니다.' }];
  }
}

/**
 * Wikipedia API (무료, API 키 불필요)
 */
export async function searchWikipedia(query: string): Promise<Array<{ title: string; url: string; snippet: string }>> {
  try {
    const response = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`
    );
    
    if (!response.ok) {
      // 검색 API로 대체 시도
      const searchResponse = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/search/${encodeURIComponent(query)}?limit=5`
      );
      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        return searchData.pages.map((page: any) => ({
          title: page.title,
          url: page.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(page.key)}`,
          snippet: page.extract || '',
        }));
      }
      return [];
    }
    
    const data = await response.json();
    return [{
      title: data.title,
      url: data.content_urls?.desktop?.page || '',
      snippet: data.extract || '',
    }];
  } catch (error) {
    console.error('Wikipedia search error:', error);
    return [];
  }
}

/**
 * Pixabay 이미지 검색 API (무료 티어, API 키 필요 - 환경 변수: PIXABAY_API_KEY)
 * API 문서: https://pixabay.com/api/docs/
 */
export async function searchPixabayImages(
  query: string, 
  perPage: number = 20,
  options?: {
    imageType?: 'all' | 'photo' | 'illustration' | 'vector';
    orientation?: 'all' | 'horizontal' | 'vertical';
    category?: string;
    minWidth?: number;
    minHeight?: number;
    colors?: string;
    safesearch?: boolean;
    order?: 'popular' | 'latest';
  }
): Promise<Array<{
  id: number;
  pageURL: string;
  type: string;
  tags: string;
  previewURL: string;
  previewWidth: number;
  previewHeight: number;
  webformatURL: string;
  webformatWidth: number;
  webformatHeight: number;
  largeImageURL: string;
  fullHDURL?: string;
  imageURL?: string;
  imageWidth: number;
  imageHeight: number;
  imageSize: number;
  views: number;
  downloads: number;
  likes: number;
  comments: number;
  user_id: number;
  user: string;
  userImageURL: string;
}>> {
  const apiKey = process.env.PIXABAY_API_KEY;
  if (!apiKey) {
    console.warn('PIXABAY_API_KEY가 설정되지 않았습니다.');
    return [];
  }
  
  try {
    // API 파라미터 구성
    const params = new URLSearchParams({
      key: apiKey,
      q: query.substring(0, 100), // 최대 100자
      lang: 'ko', // 한국어
      image_type: options?.imageType || 'photo',
      orientation: options?.orientation || 'all',
      safesearch: options?.safesearch !== false ? 'true' : 'false',
      order: options?.order || 'popular',
      per_page: Math.min(perPage, 200).toString(),
    });
    
    if (options?.category) params.append('category', options.category);
    if (options?.minWidth) params.append('min_width', options.minWidth.toString());
    if (options?.minHeight) params.append('min_height', options.minHeight.toString());
    if (options?.colors) params.append('colors', options.colors);
    
    const response = await fetch(`https://pixabay.com/api/?${params.toString()}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Pixabay API error:', response.status, response.statusText, errorText);
      
      // Rate limit 확인
      if (response.status === 429) {
        console.warn('Pixabay API rate limit exceeded. 60초에 최대 100회 요청 가능합니다.');
      }
      
      return [];
    }
    
    const data = await response.json();
    
    // 응답 형식: { total, totalHits, hits: [...] }
    if (data.hits && Array.isArray(data.hits)) {
      return data.hits.map((hit: any) => ({
        id: hit.id,
        pageURL: hit.pageURL,
        type: hit.type,
        tags: hit.tags,
        previewURL: hit.previewURL,
        previewWidth: hit.previewWidth,
        previewHeight: hit.previewHeight,
        webformatURL: hit.webformatURL,
        webformatWidth: hit.webformatWidth,
        webformatHeight: hit.webformatHeight,
        largeImageURL: hit.largeImageURL,
        fullHDURL: hit.fullHDURL,
        imageURL: hit.imageURL,
        imageWidth: hit.imageWidth,
        imageHeight: hit.imageHeight,
        imageSize: hit.imageSize,
        views: hit.views,
        downloads: hit.downloads,
        likes: hit.likes,
        comments: hit.comments,
        user_id: hit.user_id,
        user: hit.user,
        userImageURL: hit.userImageURL,
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Pixabay search error:', error);
    return [];
  }
}

/**
 * Pixabay 비디오 검색 API (무료 티어, API 키 필요 - 환경 변수: PIXABAY_API_KEY)
 * API 문서: https://pixabay.com/api/docs/#search_videos
 */
export async function searchPixabayVideos(
  query: string,
  perPage: number = 20,
  options?: {
    videoType?: 'all' | 'film' | 'animation';
    category?: string;
    minWidth?: number;
    minHeight?: number;
    safesearch?: boolean;
    order?: 'popular' | 'latest';
  }
): Promise<Array<{
  id: number;
  pageURL: string;
  type: string;
  tags: string;
  duration: number;
  videos: {
    large: { url: string; width: number; height: number; size: number; thumbnail: string };
    medium: { url: string; width: number; height: number; size: number; thumbnail: string };
    small: { url: string; width: number; height: number; size: number; thumbnail: string };
    tiny: { url: string; width: number; height: number; size: number; thumbnail: string };
  };
  views: number;
  downloads: number;
  likes: number;
  comments: number;
  user_id: number;
  user: string;
  userImageURL: string;
}>> {
  const apiKey = process.env.PIXABAY_API_KEY;
  if (!apiKey) {
    console.warn('PIXABAY_API_KEY가 설정되지 않았습니다.');
    return [];
  }
  
  try {
    // API 파라미터 구성
    const params = new URLSearchParams({
      key: apiKey,
      q: query.substring(0, 100), // 최대 100자
      lang: 'ko', // 한국어
      video_type: options?.videoType || 'all',
      safesearch: options?.safesearch !== false ? 'true' : 'false',
      order: options?.order || 'popular',
      per_page: Math.min(perPage, 200).toString(),
    });
    
    if (options?.category) params.append('category', options.category);
    if (options?.minWidth) params.append('min_width', options.minWidth.toString());
    if (options?.minHeight) params.append('min_height', options.minHeight.toString());
    
    const response = await fetch(`https://pixabay.com/api/videos/?${params.toString()}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Pixabay Video API error:', response.status, response.statusText, errorText);
      
      // Rate limit 확인
      if (response.status === 429) {
        console.warn('Pixabay API rate limit exceeded. 60초에 최대 100회 요청 가능합니다.');
      }
      
      return [];
    }
    
    const data = await response.json();
    
    // 응답 형식: { total, totalHits, hits: [...] }
    if (data.hits && Array.isArray(data.hits)) {
      return data.hits.map((hit: any) => ({
        id: hit.id,
        pageURL: hit.pageURL,
        type: hit.type,
        tags: hit.tags,
        duration: hit.duration,
        videos: hit.videos,
        views: hit.views,
        downloads: hit.downloads,
        likes: hit.likes,
        comments: hit.comments,
        user_id: hit.user_id,
        user: hit.user,
        userImageURL: hit.userImageURL,
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Pixabay Video search error:', error);
    return [];
  }
}

/**
 * Pexels 이미지 검색 API (무료, API 키 필요 - 환경 변수: PEXELS_API_KEY)
 */
export async function searchPexelsImages(query: string, perPage: number = 20): Promise<Array<{
  id: number;
  url: string;
  photographer: string;
  photographer_url: string;
  src: {
    original: string;
    large: string;
    medium: string;
    small: string;
    portrait: string;
    landscape: string;
    tiny: string;
  };
  alt: string;
  width: number;
  height: number;
}>> {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) {
    console.warn('PEXELS_API_KEY가 설정되지 않았습니다.');
    return [];
  }
  
  try {
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${Math.min(perPage, 80)}`,
      {
        headers: {
          'Authorization': apiKey,
        },
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Pexels API error:', response.status, response.statusText, errorText);
      
      // Rate limit 확인
      if (response.status === 429) {
        console.warn('Pexels API rate limit exceeded. 시간당 최대 200회 요청 가능합니다.');
      }
      
      // 인증 오류
      if (response.status === 401 || response.status === 403) {
        console.error('Pexels API 인증 실패. API 키를 확인하세요.');
      }
      
      return [];
    }
    
    const data = await response.json();
    
    // 응답 형식: { page, per_page, photos: [...], total_results, next_page }
    if (data.photos && Array.isArray(data.photos)) {
      return data.photos.map((photo: any) => ({
        id: photo.id,
        url: photo.url,
        photographer: photo.photographer,
        photographer_url: photo.photographer_url,
        src: {
          original: photo.src.original,
          large: photo.src.large,
          medium: photo.src.medium,
          small: photo.src.small,
          portrait: photo.src.portrait,
          landscape: photo.src.landscape,
          tiny: photo.src.tiny,
        },
        alt: photo.alt || '',
        width: photo.width,
        height: photo.height,
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Pexels search error:', error);
    return [];
  }
}

/**
 * Unsplash 이미지 검색 API (무료 티어, API 키 필요 - 환경 변수: UNSPLASH_ACCESS_KEY)
 */
export async function searchUnsplashImages(query: string, perPage: number = 20): Promise<Array<{ id: string; urls: { regular: string; full: string }; user: { name: string }; description: string | null }>> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) {
    console.warn('UNSPLASH_ACCESS_KEY가 설정되지 않았습니다.');
    return [];
  }
  
  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${perPage}`,
      {
        headers: {
          'Authorization': `Client-ID ${accessKey}`,
        },
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Unsplash API] 오류:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      });
      
      // Rate limit 확인
      if (response.status === 429) {
        console.warn('[Unsplash API] Rate limit exceeded. 시간당 최대 50회 요청 가능합니다.');
      }
      
      // 인증 오류
      if (response.status === 401 || response.status === 403) {
        console.error('[Unsplash API] 인증 실패. API 키를 확인하세요.');
      }
      
      return [];
    }
    
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Unsplash search error:', error);
    return [];
  }
}

/**
 * Pexels 비디오 검색 API (무료, API 키 필요 - 환경 변수: PEXELS_API_KEY)
 */
export async function searchPexelsVideos(query: string, perPage: number = 15): Promise<Array<{ id: number; url: string; photographer: string; video_files: Array<{ link: string; quality: string }> }>> {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) {
    console.warn('PEXELS_API_KEY가 설정되지 않았습니다.');
    return [];
  }
  
  try {
    const response = await fetch(
      `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=${perPage}`,
      {
        headers: {
          'Authorization': apiKey,
        },
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Pexels Video API] 오류:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      });
      
      // Rate limit 확인
      if (response.status === 429) {
        console.warn('[Pexels Video API] Rate limit exceeded. 시간당 최대 200회 요청 가능합니다.');
      }
      
      // 인증 오류
      if (response.status === 401 || response.status === 403) {
        console.error('[Pexels Video API] 인증 실패. API 키를 확인하세요.');
      }
      
      return [];
    }
    
    const data = await response.json();
    return data.videos || [];
  } catch (error) {
    console.error('Pexels Video search error:', error);
    return [];
  }
}

/**
 * Hugging Face Inference API (무료 티어, API 키 필요 - 환경 변수: HUGGINGFACE_API_KEY)
 * 다양한 오픈소스 AI 모델 사용 가능
 */
export async function callHuggingFaceModel(
  model: string,
  prompt: string,
  apiKey?: string
): Promise<string> {
  const key = apiKey || process.env.HUGGINGFACE_API_KEY;
  if (!key) {
    console.warn('HUGGINGFACE_API_KEY가 설정되지 않았습니다.');
    return 'Hugging Face API 키가 필요합니다.';
  }
  
  try {
    const response = await fetch(
      `https://api-inference.huggingface.co/models/${model}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputs: prompt }),
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Hugging Face API error:', response.statusText, errorText);
      return 'API 호출에 실패했습니다.';
    }
    
    const data = await response.json();
    
    // 응답 형식에 따라 처리
    if (Array.isArray(data) && data[0]?.generated_text) {
      return data[0].generated_text;
    } else if (data[0]?.summary_text) {
      return data[0].summary_text;
    } else if (typeof data === 'string') {
      return data;
    }
    
    return JSON.stringify(data);
  } catch (error) {
    console.error('Hugging Face API call error:', error);
    return 'API 호출 중 오류가 발생했습니다.';
  }
}

/**
 * Groq API (무료 티어, API 키 필요 - 환경 변수: GROQ_API_KEY)
 * 매우 빠른 텍스트 생성
 */
export async function callGroqAPI(prompt: string, apiKey?: string): Promise<string> {
  const key = apiKey || process.env.GROQ_API_KEY;
  if (!key) {
    console.warn('GROQ_API_KEY가 설정되지 않았습니다.');
    return 'Groq API 키가 필요합니다.';
  }
  
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API error:', response.statusText, errorText);
      return 'API 호출에 실패했습니다.';
    }
    
    const data = await response.json();
    return data.choices[0]?.message?.content || '응답을 생성할 수 없습니다.';
  } catch (error) {
    console.error('Groq API call error:', error);
    return 'API 호출 중 오류가 발생했습니다.';
  }
}
