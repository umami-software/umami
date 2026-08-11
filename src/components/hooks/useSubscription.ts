import { DEFAULT_SUBSCRIPTION, type Subscription } from '@/lib/subscription';
import { useApp } from '@/store/app';
import { useApi } from './useApi';
import { useConfig } from './useConfig';

const FEATURES = {
  replays: 'isBusiness',
} as const;

export type FeatureName = keyof typeof FEATURES;

export function useSubscription(teamId?: string | null) {
  const userId = useApp(state => state.user?.id);
  const config = useConfig();
  const { get, useQuery } = useApi();
  const cloudMode = config?.cloudMode || false;
  const {
    data: subscription = DEFAULT_SUBSCRIPTION,
    isLoading,
    isFetching,
    error,
  } = useQuery<Subscription>({
    queryKey: ['subscription', { teamId: teamId || null }],
    queryFn: () => get('/auth/subscription', teamId ? { teamId } : {}),
    enabled: cloudMode && !!userId,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: 'always',
  });

  function hasFeature(feature: FeatureName): boolean {
    if (!cloudMode || subscription.isNoBilling) {
      return true;
    }

    const requiredFlag = FEATURES[feature];
    return subscription[requiredFlag] || false;
  }

  return {
    ...subscription,
    cloudMode,
    hasFeature,
    isLoading: isLoading || isFetching,
    isFetching,
    error,
  };
}
