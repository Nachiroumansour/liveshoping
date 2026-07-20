export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(status: number, message: string, body: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

export interface ApiClientConfig {
  /** Ex. "https://api.livelink.store" (sans /api final). */
  baseUrl: string;
  getToken: () => string | null | Promise<string | null>;
  setToken?: (token: string | null) => void | Promise<void>;
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  /** FormData brut (upload) — exclusif de body. */
  formData?: FormData;
}

export function createHttp(config: ApiClientConfig) {
  const root = config.baseUrl.replace(/\/$/, '');

  return async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const token = await config.getToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    let body: BodyInit | undefined;
    if (options.formData) {
      body = options.formData; // fetch pose le Content-Type multipart lui-même
    } else if (options.body !== undefined) {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify(options.body);
    }

    const response = await fetch(`${root}/api${path}`, {
      method: options.method ?? 'GET',
      headers,
      body,
    });

    let data: unknown = null;
    try {
      data = await response.json();
    } catch {
      // réponse sans corps JSON
    }

    if (!response.ok) {
      const message =
        (data as { error?: string } | null)?.error ?? `Erreur API (${response.status})`;
      throw new ApiError(response.status, message, data);
    }

    return data as T;
  };
}
