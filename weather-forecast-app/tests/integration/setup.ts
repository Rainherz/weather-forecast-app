/**
 * MSW lifecycle setup for integration tests only.
 * This file is intentionally separate from tests/setup.ts so that
 * unit tests (which use vi.stubGlobal('fetch')) are not affected.
 */

import { server } from './server';

beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
