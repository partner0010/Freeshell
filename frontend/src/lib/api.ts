const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

/**
 * 프롬프트 분석 API
 */
export interface PromptAnalyzeRequest {
  text: string;
  type: "short" | "long";
}

export interface PromptAnalysisResponse {
  topic: string;
  tone: string;
  keywords: string[];
  suggested_duration: number;
  content_type: string;
  intent?: string;
  target_audience?: string;
  complexity?: string;
}

export interface SceneResponse {
  scene_number: number;
  description: string;
  visual_elements: string[];
  audio_elements?: string;
  duration: number;
  transitions?: string;
}

export interface PlanResponse {
  scenes: SceneResponse[];
  script_outline: string;
  visual_style: string;
  title?: string;
  description?: string;
  total_duration?: number;
  color_palette?: string[];
  music_suggestion?: string;
}

/**
 * 플랜 API
 */
export interface Plan {
  id: string;
  name: string;
  type: "free" | "pro" | "business";
  price: number;
  currency: string;
  video_limit: number | null;
  max_resolution: string;
  watermark: boolean;
  priority_processing: boolean;
  api_access: boolean;
  dedicated_support: boolean;
  features: Record<string, any>;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  plan: Plan;
  status: string;
  started_at: string;
  expires_at: string | null;
  created_at: string;
}

export interface CheckoutRequest {
  plan_id: string;
  success_url: string;
  cancel_url: string;
}

export interface CheckoutResponse {
  session_id: string;
  url: string;
}

export interface Invoice {
  id: string;
  amount_paid: number;
  currency: string;
  status: string;
  created: string;
  invoice_pdf?: string;
  hosted_invoice_url?: string;
}

export interface PromptAnalyzeResponse {
  analysis: PromptAnalysisResponse;
  plan: PlanResponse;
}

export async function analyzePrompt(
  request: PromptAnalyzeRequest
): Promise<PromptAnalyzeResponse> {
  const response = await fetch(`${apiBaseUrl}/api/v1/prompts/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Analysis failed" }));
    throw new Error(error.detail || "프롬프트 분석에 실패했습니다.");
  }

  return response.json();
}

export async function getHealth(): Promise<{ status: string }> {
  const response = await fetch(`${apiBaseUrl}/api/v1/health`);
  if (!response.ok) {
    throw new Error("Failed to fetch health");
  }
  return response.json();
}

/**
 * 프로젝트 API
 */
export interface Project {
  id: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
  video_url?: string;
  status: "completed" | "processing" | "failed" | "pending";
  created_at: string;
  duration?: number;
  type?: string;
  assets?: {
    images: Array<{ id: string; url: string; type: string }>;
    audios: Array<{ id: string; url: string; type: string }>;
    scripts: Array<{ id: string; content: string; type: string }>;
  };
  analytics?: {
    views: number;
    downloads: number;
  };
}

export async function getProjects(page: number = 1, limit: number = 20): Promise<{
  projects: Project[];
  total: number;
  page: number;
  limit: number;
}> {
  const response = await fetch(`${apiBaseUrl}/api/v1/projects?page=${page}&limit=${limit}`);
  if (!response.ok) {
    throw new Error("Failed to fetch projects");
  }
  return response.json();
}

export async function getProject(id: string): Promise<Project> {
  const response = await fetch(`${apiBaseUrl}/api/v1/projects/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch project");
  }
  return response.json();
}

export async function deleteProject(id: string): Promise<void> {
  const response = await fetch(`${apiBaseUrl}/api/v1/projects/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete project");
  }
}

/**
 * 플랜 API
 */
export interface Plan {
  id: string;
  name: string;
  type: "free" | "pro" | "business";
  price: number;
  currency: string;
  video_limit: number | null;
  max_resolution: string;
  watermark: boolean;
  priority_processing: boolean;
  api_access: boolean;
  dedicated_support: boolean;
  features: Record<string, any>;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  plan: Plan;
  status: string;
  started_at: string;
  expires_at: string | null;
  created_at: string;
}

export interface CheckoutRequest {
  plan_id: string;
  success_url: string;
  cancel_url: string;
}

export interface CheckoutResponse {
  session_id: string;
  url: string;
}

export interface Invoice {
  id: string;
  amount_paid: number;
  currency: string;
  status: string;
  created: string;
  invoice_pdf?: string;
  hosted_invoice_url?: string;
}

export async function getPlans(): Promise<Plan[]> {
  const response = await fetch(`${apiBaseUrl}/api/v1/plans/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch plans");
  }

  return response.json();
}

export async function getCurrentPlan(): Promise<Plan> {
  const response = await fetch(`${apiBaseUrl}/api/v1/plans/current`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch current plan");
  }

  return response.json();
}

export async function getSubscription(): Promise<Subscription> {
  const response = await fetch(`${apiBaseUrl}/api/v1/plans/subscription`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch subscription");
  }

  return response.json();
}

/**
 * 결제 API
 */
export async function createCheckout(
  request: CheckoutRequest
): Promise<CheckoutResponse> {
  const response = await fetch(`${apiBaseUrl}/api/v1/payments/create-checkout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error("Failed to create checkout session");
  }

  return response.json();
}

export async function getInvoices(): Promise<Invoice[]> {
  const response = await fetch(`${apiBaseUrl}/api/v1/payments/invoices`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch invoices");
  }

  return response.json();
}

export async function cancelSubscription(): Promise<void> {
  const response = await fetch(`${apiBaseUrl}/api/v1/payments/cancel-subscription`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to cancel subscription");
  }
}
