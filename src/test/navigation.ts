import { vi } from 'vitest';

const testNavigation = vi.hoisted(() => ({
  pathname: '/',
  searchParams: new URLSearchParams(),
  router: {
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
    push: vi.fn(),
    refresh: vi.fn(),
    replace: vi.fn(),
  },
}));

export function setTestUrl(url: string) {
  const nextUrl = new URL(url, 'http://localhost');

  testNavigation.pathname = nextUrl.pathname;
  testNavigation.searchParams = nextUrl.searchParams;

  window.history.pushState({}, '', `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`);
}

export function getTestRouter() {
  return testNavigation.router;
}

export function resetTestNavigation() {
  setTestUrl('/');

  Object.values(testNavigation.router).forEach(mock => {
    mock.mockReset();
  });
}

vi.mock('next/navigation', () => ({
  notFound: vi.fn(),
  redirect: vi.fn(),
  usePathname: () => testNavigation.pathname,
  useRouter: () => testNavigation.router,
  useSearchParams: () => testNavigation.searchParams,
}));
