import type {
  AuthResponse,
  Project,
  CreateProjectInput,
  UpdateProjectInput,
  Prompt,
  CreatePromptInput,
  UpdatePromptInput,
  Scan,
  DashboardStats,
  User,
  ApiError,
} from '@coucou-ia/shared';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

class ApiClient {
  private accessToken: string | null = null;

  setAccessToken(token: string | null): void {
    this.accessToken = token;
  }

  private async fetch<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.accessToken) {
      (headers as Record<string, string>)['Authorization'] =
        `Bearer ${this.accessToken}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = (await response.json()) as ApiError;
      throw new ApiClientError(error.code, error.message, response.status);
    }

    return response.json() as Promise<T>;
  }

  // Auth
  async register(
    email: string,
    password: string,
    name: string,
  ): Promise<AuthResponse> {
    return this.fetch<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    return this.fetch<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    return this.fetch<AuthResponse>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  async getMe(): Promise<User> {
    return this.fetch<User>('/auth/me');
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

  async createPrompt(
    projectId: string,
    data: CreatePromptInput,
  ): Promise<Prompt> {
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
  async triggerScan(projectId: string): Promise<Scan[]> {
    return this.fetch<Scan[]>(`/projects/${projectId}/scans`, {
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
