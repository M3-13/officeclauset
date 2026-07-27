const BASE_URL = "http://localhost:8000/api";

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(error.detail || "Request failed");
  }

  return response.json() as Promise<T>;
}

export function get<T>(endpoint: string, token?: string): Promise<T> {
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return request<T>(endpoint, { method: "GET", headers });
}

export function post<T>(endpoint: string, body: unknown, token?: string): Promise<T> {
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return request<T>(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
}

export function put<T>(endpoint: string, body: unknown, token?: string): Promise<T> {
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return request<T>(endpoint, {
    method: "PUT",
    headers,
    body: JSON.stringify(body),
  });
}

export function del(endpoint: string, token?: string): Promise<void> {
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return request<void>(endpoint, { method: "DELETE", headers });
}

export function uploadFile<T>(
  endpoint: string,
  formData: FormData,
  token?: string,
): Promise<T> {
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return request<T>(endpoint, {
    method: "POST",
    headers,
    body: formData,
  });
}
