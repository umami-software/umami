import { DEFAULT_SUBSCRIPTION, type Subscription } from '@/lib/subscription';
import { useApp } from '@/store/app';
import { useApi } from './useApi';
import { useConfig } from './useConfig';

// Each feature lists the plans that include it.
const FEATURES = {
  replays: ['isBusiness'],
  searchConsole: ['hasSubscription'],
} as const satisfies Record<string, readonly (keyof Subscription)[]>;

export type FeatureName = keyof typeof FEATURES;

export function useSubscription(teamId?: string | null) {
  const userId = useApp(state => state.user?.id);
  const config = useConfig();
  const { get, useQuery } = useApi();
  const cloudMode = config?.cloudMode || false;
  // isFetching is deliberately not read: react-query re-renders for every result field a
  // component reads, and a background refetch would re-render every caller twice for nothing.
  const {
    data: subscription = DEFAULT_SUBSCRIPTION,
    isLoading,
    error,
  } = useQuery<Subscription>({
    queryKey: ['subscription', { teamId: teamId || null }],
    queryFn: () => get('/auth/subscription', teamId ? { teamId } : {}),
    enabled: cloudMode && !!userId,
    // Cached data is reused when a page mounts. Returning to the tab refetches, so a plan
    // change made in another tab (the upgrade button opens billing in a new tab) shows up.
    refetchOnMount: false,
    refetchOnWindowFocus: 'always',
  });

  function hasFeature(feature: FeatureName): boolean {
    if (!cloudMode || subscription.isNoBilling) {
      return true;
    }

    return FEATURES[feature].some(plan => !!subscription[plan]);
  }

  return {
    ...subscription,
    cloudMode,
    hasFeature,
    isLoading,
    error,
  };
}
