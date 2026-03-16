import { useApp } from '@/store/app';
import { useConfig } from './useConfig';

export interface Subscription {
  isPro: boolean;
  isBusiness: boolean;
  hasSubscription: boolean;
}

const FEATURES = {
  replays: 'isBusiness',
} as const;

export type FeatureName = keyof typeof FEATURES;

const defaultSubscription: Subscription = {
  isPro: false,
  isBusiness: false,
  hasSubscription: false,
};

export function useSubscription() {
  const { user } = useApp();
  const config = useConfig();

  const subscription: Subscription = user?.subscription || defaultSubscription;
  const cloudMode = config?.cloudMode || false;

  function hasFeature(feature: FeatureName): boolean {
    if (!cloudMode) {
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
