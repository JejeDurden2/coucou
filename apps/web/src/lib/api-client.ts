import type {
  Project,
  CreateProjectInput,
  UpdateProjectInput,
  Prompt,
  CreatePromptInput,
  CreatePromptResponse,
  UpdatePromptInput,
  Scan,
  ScanJobResponse,
  ScanJobStatusResponse,
  DashboardStats,
  HistoricalStats,
  RecommendationsResponse,
  EnqueuedJobResponse,
  OnboardingJobStatusResponse,
  User,
  ApiError,
  SubscriptionInfo,
  DowngradeResponse,
  CancelDowngradeResponse,
  LatestSentimentResponse,
  SentimentHistory,
  CreateSupportRequestInput,
  SupportRequestResponse,
  LatestAuditResponseDto,
} from '@coucou-ia/shared';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

interface AuthUserResponse {
  user: User;
}

class ApiClient {
  private isRefreshing: Promise<boolean> | null = null;

  private async fetchRaw(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    return fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include',
    });
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = (await response.json()) as ApiError;
      throw new ApiClientError(error.code, error.message, response.status);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json() as Promise<T>;
  }

  private async attemptRefresh(): Promise<boolean> {
    try {
      const response = await this.fetchRaw('/auth/refresh', { method: 'POST' });
      return response.ok;
    } catch {
      return false;
    }
  }

  private async fetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await this.fetchRaw(endpoint, options);

    if (response.status === 401 && !endpoint.startsWith('/auth/')) {
      // Deduplicate concurrent refresh attempts
      if (!this.isRefreshing) {
        this.isRefreshing = this.attemptRefresh().finally(() => {
          this.isRefreshing = null;
        });
      }

      const refreshed = await this.isRefreshing;
      if (refreshed) {
        const retryResponse = await this.fetchRaw(endpoint, options);
        return this.handleResponse<T>(retryResponse);
      }
    }

    return this.handleResponse<T>(response);
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

  async updateProfile(data: { name?: string; email?: string }): Promise<User> {
    return this.fetch<User>('/auth/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
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

  async createPrompt(projectId: string, data: CreatePromptInput): Promise<CreatePromptResponse> {
    return this.fetch<CreatePromptResponse>(`/projects/${projectId}/prompts`, {
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
  async generateOnboardingPrompts(projectId: string): Promise<EnqueuedJobResponse> {
    return this.fetch<EnqueuedJobResponse>('/onboarding/generate-prompts', {
      method: 'POST',
      body: JSON.stringify({ projectId }),
    });
  }

  async getOnboardingJobStatus(jobId: string): Promise<OnboardingJobStatusResponse> {
    return this.fetch<OnboardingJobStatusResponse>(`/onboarding/job/${jobId}/status`);
  }

  // Brand Analysis (generic endpoints for dashboard brand creation)
  async analyzeBrand(projectId: string): Promise<EnqueuedJobResponse> {
    return this.fetch<EnqueuedJobResponse>(`/projects/${projectId}/brand/analyze`, {
      method: 'POST',
    });
  }

  async getBrandJobStatus(projectId: string, jobId: string): Promise<OnboardingJobStatusResponse> {
    return this.fetch<OnboardingJobStatusResponse>(
      `/projects/${projectId}/brand/job/${jobId}/status`,
    );
  }

  // Sentiment
  async getLatestSentiment(projectId: string): Promise<LatestSentimentResponse> {
    return this.fetch<LatestSentimentResponse>(`/projects/${projectId}/sentiment/latest`);
  }

  async getSentimentHistory(projectId: string): Promise<SentimentHistory> {
    return this.fetch<SentimentHistory>(`/projects/${projectId}/sentiment/history`);
  }

  // Audit
  async getLatestAudit(projectId: string): Promise<LatestAuditResponseDto> {
    return this.fetch<LatestAuditResponseDto>(`/projects/${projectId}/audit`);
  }

  async createAuditCheckout(projectId: string): Promise<{ checkoutUrl: string }> {
    return this.fetch<{ checkoutUrl: string }>(`/projects/${projectId}/audit/checkout`, {
      method: 'POST',
    });
  }

  async getAuditReportUrl(
    projectId: string,
    auditId: string,
  ): Promise<{ url: string; expiresInSeconds: number }> {
    return this.fetch<{ url: string; expiresInSeconds: number }>(
      `/projects/${projectId}/audit/${auditId}/report-url`,
    );
  }

  // Support
  async sendSupportRequest(data: CreateSupportRequestInput): Promise<SupportRequestResponse> {
    return this.fetch<SupportRequestResponse>('/support/contact', {
      method: 'POST',
      body: JSON.stringify(data),
    });
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
