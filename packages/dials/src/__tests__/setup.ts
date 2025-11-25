/**
 * Test setup file for Vitest
 */

import { afterEach } from 'vitest';

// Clean up localStorage after each test
afterEach(() => {
  localStorage.clear();
});
