export interface FetchOptions extends RequestInit {
  timeoutMs?: number;
}

/**
 * Robust HTTP fetch wrapper with built-in timeout, status check, and error safety.
 */
export async function fetchWithTimeout<T = unknown>(
  url: string,
  options: FetchOptions = {}
): Promise<{ data: T | null; status: number; ok: boolean }> {
  const { timeoutMs = 8000, ...fetchOptions } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return { data: null, status: response.status, ok: false };
    }

    const data = (await response.json()) as T;
    return { data, status: response.status, ok: true };
  } catch (error) {
    clearTimeout(timeoutId);
    return { data: null, status: 0, ok: false };
  }
}
