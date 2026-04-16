import { useApp } from '@/store/app';
import { useConfig } from './useConfig';

export interface Subscription {
  isPro: boolean;
  isBusiness: boolean;
  isNoBilling: boolean;
  hasSubscription: boolean;
}

const FEATURES = {
  replays: 'isBusiness',
} as const;

export type FeatureName = keyof typeof FEATURES;

const defaultSubscription: Subscription = {
  isPro: false,
  isBusiness: false,
  isNoBilling: false,
  hasSubscription: false,
};

export function useSubscription(teamId?: string | null) {
  const { user } = useApp();
  const config = useConfig();

  const ownSubscription: Subscription = user?.subscription || defaultSubscription;
  const teamSubscription: Subscription | null = teamId
    ? user?.teams?.find((t: any) => t.id === teamId)?.subscription ?? null
    : null;

  const subscription: Subscription = teamSubscription || ownSubscription;
  const cloudMode = config?.cloudMode || false;

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
  };
}
