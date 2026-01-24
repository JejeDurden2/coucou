import type {
  Project,
  CreateProjectInput,
  UpdateProjectInput,
  Prompt,
  CreatePromptInput,
  UpdatePromptInput,
  Scan,
  ScanJobResponse,
  ScanJobStatusResponse,
  DashboardStats,
  HistoricalStats,
  RecommendationsResponse,
  GeneratePromptsResponse,
  User,
  ApiError,
  SubscriptionInfo,
  DowngradeResponse,
  CancelDowngradeResponse,
  LatestSentimentResponse,
  SentimentHistory,
} from '@coucou-ia/shared';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

interface AuthUserResponse {
  user: User;
}

class ApiClient {
  private async fetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      const error = (await response.json()) as ApiError;
      throw new ApiClientError(error.code, error.message, response.status);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json() as Promise<T>;
  }

  // Auth
  async register(
    email: string,
    password: string,
    name: string,
    acceptTerms: boolean,
  ): Promise<User> {
    const response = await this.fetch<AuthUserResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, acceptTerms }),
    });
    return response.user;
  }

  async login(email: string, password: string): Promise<User> {
    const response = await this.fetch<AuthUserResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return response.user;
  }

  async refreshToken(): Promise<User> {
    const response = await this.fetch<AuthUserResponse>('/auth/refresh', {
      method: 'POST',
    });
    return response.user;
  }

  async logout(): Promise<void> {
    await this.fetch<void>('/auth/logout', {
      method: 'POST',
    });
  }

  async getMe(): Promise<User> {
    return this.fetch<User>('/auth/me');
  }

  async updateProfile(name: string): Promise<User> {
    return this.fetch<User>('/auth/me', {
      method: 'PATCH',
      body: JSON.stringify({ name }),
    });
  }

  async updateEmailNotifications(enabled: boolean): Promise<User> {
    return this.fetch<User>('/auth/me', {
      method: 'PATCH',
      body: JSON.stringify({ emailNotificationsEnabled: enabled }),
    });
  }

  async exportData(): Promise<unknown> {
    return this.fetch<unknown>('/auth/me/export');
  }

  async deleteAccount(confirmation: string): Promise<{ message: string }> {
    return this.fetch<{ message: string }>('/auth/me', {
      method: 'DELETE',
      body: JSON.stringify({ confirmation }),
    });
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    return this.fetch<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    return this.fetch<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
  }

  // Projects
  async getProjects(): Promise<Project[]> {
    return this.fetch<Project[]>('/projects');
  }

  async getProject(id: string): Promise<Project> {
    return this.fetch<Project>(`/projects/${id}`);
  }

  async createProject(data: CreateProjectInput): Promise<Project> {
    return this.fetch<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProject(id: string, data: UpdateProjectInput): Promise<Project> {
    return this.fetch<Project>(`/projects/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteProject(id: string): Promise<void> {
    await this.fetch<void>(`/projects/${id}`, {
      method: 'DELETE',
    });
  }

  // Prompts
  async getPrompts(projectId: string): Promise<Prompt[]> {
    return this.fetch<Prompt[]>(`/projects/${projectId}/prompts`);
  }

  async createPrompt(projectId: string, data: CreatePromptInput): Promise<Prompt> {
    return this.fetch<Prompt>(`/projects/${projectId}/prompts`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePrompt(
    projectId: string,
    promptId: string,
    data: UpdatePromptInput,
  ): Promise<Prompt> {
    return this.fetch<Prompt>(`/projects/${projectId}/prompts/${promptId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deletePrompt(projectId: string, promptId: string): Promise<void> {
    await this.fetch<void>(`/projects/${projectId}/prompts/${promptId}`, {
      method: 'DELETE',
    });
  }

  // Scans
  async triggerScan(projectId: string): Promise<ScanJobResponse> {
    return this.fetch<ScanJobResponse>(`/projects/${projectId}/scans`, {
      method: 'POST',
    });
  }

  async getScanJobStatus(projectId: string, jobId: string): Promise<ScanJobStatusResponse> {
    return this.fetch<ScanJobStatusResponse>(`/projects/${projectId}/scan-jobs/${jobId}`);
  }

  async triggerPromptScan(promptId: string): Promise<ScanJobResponse> {
    return this.fetch<ScanJobResponse>(`/prompts/${promptId}/scan`, {
      method: 'POST',
    });
  }

  async getScans(projectId: string): Promise<Scan[]> {
    return this.fetch<Scan[]>(`/projects/${projectId}/scans`);
  }

  // Dashboard
  async getDashboardStats(projectId: string): Promise<DashboardStats> {
    return this.fetch<DashboardStats>(`/projects/${projectId}/dashboard`);
  }

  async getRecommendations(projectId: string): Promise<RecommendationsResponse> {
    return this.fetch<RecommendationsResponse>(`/projects/${projectId}/dashboard/recommendations`);
  }

  async getHistoricalStats(
    projectId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<HistoricalStats | null> {
    const params = new URLSearchParams();
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    const query = params.toString();
    const url = `/projects/${projectId}/dashboard/historical${query ? `?${query}` : ''}`;
    return this.fetch<HistoricalStats | null>(url);
  }

  // Billing
  async createCheckout(
    plan: string,
    successUrl: string,
    cancelUrl: string,
  ): Promise<{ url: string }> {
    return this.fetch<{ url: string }>('/billing/checkout', {
      method: 'POST',
      body: JSON.stringify({ plan, successUrl, cancelUrl }),
    });
  }

  async createPortal(returnUrl: string): Promise<{ url: string }> {
    return this.fetch<{ url: string }>('/billing/portal', {
      method: 'POST',
      body: JSON.stringify({ returnUrl }),
    });
  }

  async getSubscription(): Promise<SubscriptionInfo> {
    return this.fetch<SubscriptionInfo>('/billing/subscription');
  }

  async downgradeSubscription(): Promise<DowngradeResponse> {
    return this.fetch<DowngradeResponse>('/billing/downgrade', {
      method: 'POST',
    });
  }

  async cancelDowngrade(): Promise<CancelDowngradeResponse> {
    return this.fetch<CancelDowngradeResponse>('/billing/cancel-downgrade', {
      method: 'POST',
    });
  }

  // Onboarding
  async generateOnboardingPrompts(projectId: string): Promise<GeneratePromptsResponse> {
    return this.fetch<GeneratePromptsResponse>('/onboarding/generate-prompts', {
      method: 'POST',
      body: JSON.stringify({ projectId }),
    });
  }

  // Sentiment
  async getLatestSentiment(projectId: string): Promise<LatestSentimentResponse> {
    return this.fetch<LatestSentimentResponse>(`/projects/${projectId}/sentiment/latest`);
  }

  async getSentimentHistory(projectId: string): Promise<SentimentHistory> {
    return this.fetch<SentimentHistory>(`/projects/${projectId}/sentiment/history`);
  }
}

export class ApiClientError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

export const apiClient = new ApiClient();
