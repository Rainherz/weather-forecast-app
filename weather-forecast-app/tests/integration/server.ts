/**
 * MSW server instance for integration tests.
 * Requirements: 2.1, 3.1
 */

import { setupServer } from 'msw/node';
import { defaultHandlers } from './handlers';

export const server = setupServer(...defaultHandlers);
