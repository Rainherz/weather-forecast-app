/**
 * Wrapper around the native `fetch` API that cancels the request if it does
 * not complete within the specified timeout.
 *
 * Uses `AbortController` + `setTimeout` so the in-flight request is properly
 * cancelled rather than just ignored. The timer is always cleared in the
 * `finally` block to avoid leaking timers on successful responses.
 *
 * @param url       The resource URL to fetch.
 * @param timeoutMs Milliseconds before the request is aborted (default 10 000).
 * @returns         The resolved `Response` object.
 * @throws          Re-throws any error from `fetch`, including `AbortError`
 *                  when the timeout fires.
 */
export async function fetchWithTimeout(
  url: string,
  timeoutMs: number = 10_000,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timer);
  }
}
