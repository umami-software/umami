import { renderHook } from '@testing-library/react';
import { beforeEach, expect, test, vi } from 'vitest';
import { DEFAULT_SUBSCRIPTION, type Subscription } from '@/lib/subscription';
import { useApi } from './useApi';
import { useConfig } from './useConfig';
import { useSubscription } from './useSubscription';

vi.mock('@/store/app', () => ({
  useApp: (selector: (state: { user: { id: string } }) => unknown) =>
    selector({ user: { id: 'user-1' } }),
}));
vi.mock('./useApi', () => ({ useApi: vi.fn() }));
vi.mock('./useConfig', () => ({ useConfig: vi.fn() }));

function setup({ cloudMode, plan }: { cloudMode: boolean; plan: Partial<Subscription> }) {
  vi.mocked(useConfig).mockReturnValue({ cloudMode } as ReturnType<typeof useConfig>);
  vi.mocked(useApi).mockReturnValue({
    get: vi.fn(),
    useQuery: () => ({ data: { ...DEFAULT_SUBSCRIPTION, ...plan }, isLoading: false }),
  } as unknown as ReturnType<typeof useApi>);

  return renderHook(() => useSubscription()).result.current;
}

beforeEach(() => {
  vi.clearAllMocks();
});

test.each([
  ['a free Cloud account', { cloudMode: true, plan: {} }, false],
  ['a paying Cloud account', { cloudMode: true, plan: { hasSubscription: true } }, true],
  ['a no-billing Cloud account', { cloudMode: true, plan: { isNoBilling: true } }, true],
  ['a self-hosted install', { cloudMode: false, plan: {} }, true],
])('Google Ads access for %s', (_name, options, expected) => {
  expect(setup(options).hasFeature('googleAds')).toBe(expected);
});
