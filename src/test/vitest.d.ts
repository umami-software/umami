/// <reference types="vitest/globals" />
import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';

// Vitest 5 changed Assertion<T> to Assertion<R, T>, which breaks jest-dom's built-in
// augmentation (testing-library/jest-dom#738). Remove once jest-dom ships a fix.
declare module 'vitest' {
  interface Matchers<R extends void | Promise<void> = void | Promise<void>, T = unknown>
    extends TestingLibraryMatchers<unknown, R> {}
}
