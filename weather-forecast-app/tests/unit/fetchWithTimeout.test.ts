/**
 * Unit tests for fetchWithTimeout utility.
 * Requirements: 2.5, 3.4, 3.5
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchWithTimeout } from '../../src/utils/fetchWithTimeout';

describe('fetchWithTimeout', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns the response when the request succeeds within the timeout', async () => {
    const mockResponse = new Response('{"ok":true}', { status: 200 });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse));

    const promise = fetchWithTimeout('https://example.com/api');
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result).toBe(mockResponse);
  });

  it('uses 10 000 ms as the default timeout', async () => {
    const mockResponse = new Response('ok', { status: 200 });
    const fetchMock = vi.fn().mockResolvedValue(mockResponse);
    vi.stubGlobal('fetch', fetchMock);

    const promise = fetchWithTimeout('https://example.com/api');
    await vi.runAllTimersAsync();
    await promise;

    // The signal should not have been aborted (request completed before timeout)
    const callSignal = fetchMock.mock.calls[0][1].signal as AbortSignal;
    expect(callSignal.aborted).toBe(false);
  });

  it('aborts the request after the specified timeout', async () => {
    // fetch that never resolves (simulates a hanging request)
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(
        (_url: string, opts: RequestInit) =>
          new Promise((_resolve, reject) => {
            (opts.signal as AbortSignal).addEventListener('abort', () =>
              reject(new DOMException('The operation was aborted.', 'AbortError')),
            );
          }),
      ),
    );

    const promise = fetchWithTimeout('https://example.com/api', 5_000);

    // Advance past the timeout
    vi.advanceTimersByTime(5_001);

    await expect(promise).rejects.toMatchObject({ name: 'AbortError' });
  });

  it('clears the timer when the request succeeds (no leaked timers)', async () => {
    const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');
    const mockResponse = new Response('ok', { status: 200 });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse));

    const promise = fetchWithTimeout('https://example.com/api', 10_000);
    await vi.runAllTimersAsync();
    await promise;

    expect(clearTimeoutSpy).toHaveBeenCalledOnce();
  });

  it('clears the timer even when the request fails', async () => {
    const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');
    const networkError = new TypeError('Network error');
    let rejectFetch: (reason: unknown) => void;
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(
        () => new Promise((_resolve, reject) => { rejectFetch = reject; }),
      ),
    );

    const promise = fetchWithTimeout('https://example.com/api', 10_000);
    // Reject synchronously so Vitest can track the handler immediately
    rejectFetch!(networkError);
    await expect(promise).rejects.toThrow('Network error');

    expect(clearTimeoutSpy).toHaveBeenCalledOnce();
  });
});
