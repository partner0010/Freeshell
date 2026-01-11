/**
 * Project 모델
 */
export interface Project {
  id: string;
  user_id: string;
  title: string;
  target_audience: string;
  purpose: 'traffic' | 'conversion' | 'branding';
  platform: string;
  content_type: 'youtube-script' | 'blog-post' | 'sns-post' | 'instagram-caption' | 'twitter-thread';
  template_id?: string | null; // 사용된 템플릿 ID
  created_at: Date;
  updated_at: Date;
}

export interface CreateProjectInput {
  user_id: string;
  title: string;
  target_audience: string;
  purpose: 'traffic' | 'conversion' | 'branding';
  platform: string;
  content_type: 'youtube-script' | 'blog-post' | 'sns-post' | 'instagram-caption' | 'twitter-thread';
  template_id?: string | null; // 사용된 템플릿 ID
}

export interface UpdateProjectInput {
  title?: string;
  target_audience?: string;
  purpose?: 'traffic' | 'conversion' | 'branding';
  platform?: string;
}

