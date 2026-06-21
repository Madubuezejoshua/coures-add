// Thin API client for the Express/Neon backend. Holds the JWT in localStorage
// and attaches it as a Bearer token. In dev, calls go to `/api/*` which Vite
// proxies to the API server (see vite.config.ts); in prod set VITE_API_URL.

const BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');
const TOKEN_KEY = 'docreview_token';

let token: string | null = localStorage.getItem(TOKEN_KEY);

export function setToken(t: string | null) {
  token = t;
  if (t) localStorage.setItem(TOKEN_KEY, t);
  else localStorage.removeItem(TOKEN_KEY);
}
export function getToken() {
  return token;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T = any>(method: string, path: string, body?: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(BASE + path, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('Cannot reach the server. Make sure the API is running (run "npm start").', 0);
  }

  const data = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) {
    if (res.status === 401) {
      setToken(null);
      // Avoid bouncing users to the login page on transient 401s from upload/
      // document flows. Let the UI show the actual error instead so the user
      // can retry without losing their place.
    }
    const fallback =
      res.status >= 500 || res.status === 0
        ? 'Cannot reach the server. Make sure the API is running (run "npm start").'
        : 'Request failed';
    throw new ApiError((data && (data.error || data.message)) || fallback, res.status);
  }
  return data as T;
}

export const api = {
  get: <T = any>(path: string) => request<T>('GET', path),
  post: <T = any>(path: string, body?: unknown) => request<T>('POST', path, body),
  put: <T = any>(path: string, body?: unknown) => request<T>('PUT', path, body),
  del: <T = any>(path: string) => request<T>('DELETE', path),
};

/** Upload multipart form data (e.g. a File) with the auth token attached. */
export async function postForm<T = any>(path: string, form: FormData): Promise<T> {
  let res: Response;
  try {
    // Note: do NOT set Content-Type — the browser sets the multipart boundary.
    res = await fetch(BASE + path, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    });
  } catch {
    throw new ApiError('Cannot reach the server. Make sure the API is running (run "npm start").', 0);
  }
  // Read once as text so we can surface non-JSON errors (e.g. a 404 HTML page
  // from a stale server) instead of a useless generic message.
  const raw = await res.text().catch(() => '');
  let data: any = null;
  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    /* non-JSON response */
  }
  if (!res.ok) {
    if (res.status === 401) setToken(null);
    const msg =
      res.status === 404
        ? 'Upload route not found — your API server is out of date. Stop it and run "npm start" again (kill any old node process holding the port).'
        : (data && (data.error || data.message)) || `Upload failed (HTTP ${res.status})`;
    throw new ApiError(msg, res.status);
  }
  return data as T;
}

/** Build an authenticated download URL for a stored object key. */
export function fileDownloadUrl(key?: string | null): string | undefined {
  if (!key) return undefined;
  return `${BASE}/uploads/download?key=${encodeURIComponent(key)}&token=${encodeURIComponent(token || '')}`;
}

/**
 * Polling helper that mimics a realtime subscription: calls `fetcher`
 * immediately and every `intervalMs`, passing results to `cb`. Returns an
 * unsubscribe function. Used to replace Firestore onSnapshot listeners.
 */
export function poll<T>(fetcher: () => Promise<T>, cb: (data: T) => void, intervalMs = 15000): () => void {
  let active = true;
  const run = async () => {
    try {
      const data = await fetcher();
      if (active) cb(data);
    } catch {
      /* ignore transient errors; next tick retries */
    }
  };
  run();
  const id = setInterval(run, intervalMs);
  return () => {
    active = false;
    clearInterval(id);
  };
}
