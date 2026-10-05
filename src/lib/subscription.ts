export interface SubscriptionAccount {
  isPro?: boolean | null;
  isBusiness?: boolean | null;
  isNoBilling?: boolean | null;
  hasSubscription?: boolean | null;
  unlimitedWebsites?: boolean | null;
}

export interface Subscription {
  isPro: boolean;
  isBusiness: boolean;
  isNoBilling: boolean;
  hasSubscription: boolean;
  unlimitedWebsites: boolean;
}

export const DEFAULT_SUBSCRIPTION: Subscription = {
  isPro: false,
  isBusiness: false,
  isNoBilling: false,
  hasSubscription: false,
  unlimitedWebsites: false,
};

export const CLOUD_FREE_WEBSITE_LIMIT = 1;
export const CLOUD_PRO_WEBSITE_LIMIT = 20;

export const CLOUD_FREE_TEAM_LIMIT = 0;
export const CLOUD_PRO_TEAM_LIMIT = 10;

export function normalizeSubscription(account?: SubscriptionAccount | null): Subscription {
  return {
    isPro: account?.isPro || false,
    isBusiness: account?.isBusiness || false,
    isNoBilling: account?.isNoBilling || false,
    hasSubscription: account?.hasSubscription || false,
    unlimitedWebsites: account?.unlimitedWebsites || false,
  };
}

export function getCloudWebsiteLimit(account?: SubscriptionAccount | null): number | null {
  if (!account?.hasSubscription) {
    return CLOUD_FREE_WEBSITE_LIMIT;
  }

  if (account.unlimitedWebsites) {
    return null;
  }

  if (account.isNoBilling || account.isBusiness) {
    return null;
  }

  if (account.isPro) {
    return CLOUD_PRO_WEBSITE_LIMIT;
  }

  return null;
}

export function getCloudTeamLimit(account?: SubscriptionAccount | null): number | null {
  if (!account?.hasSubscription) {
    return CLOUD_FREE_TEAM_LIMIT;
  }

  if (account.isNoBilling || account.isBusiness) {
    return null;
  }

  if (account.isPro) {
    return CLOUD_PRO_TEAM_LIMIT;
  }

  return null;
}
