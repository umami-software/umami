import '@testing-library/jest-dom/vitest';
import { cleanup, configure } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import { resetTestNavigation } from './navigation';

configure({ testIdAttribute: 'data-test' });

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

Object.defineProperty(navigator, 'clipboard', {
  configurable: true,
  value: {
    readText: vi.fn(),
    writeText: vi.fn(),
  },
});

window.scrollTo = vi.fn();

class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

class IntersectionObserver {
  readonly root = null;
  readonly rootMargin = '';
  readonly thresholds = [];

  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}

window.ResizeObserver = ResizeObserver;
window.IntersectionObserver = IntersectionObserver;

afterEach(() => {
  cleanup();
  resetTestNavigation();
  vi.restoreAllMocks();
});
