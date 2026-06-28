import { describe, expect, test } from 'vitest';
import {
  CLOUD_FREE_WEBSITE_LIMIT,
  CLOUD_PRO_WEBSITE_LIMIT,
  getCloudWebsiteLimit,
} from './subscription';

describe('getCloudWebsiteLimit', () => {
  test('limits accounts without a subscription to the free website limit', () => {
    expect(getCloudWebsiteLimit(null)).toBe(CLOUD_FREE_WEBSITE_LIMIT);
    expect(getCloudWebsiteLimit({ hasSubscription: false })).toBe(CLOUD_FREE_WEBSITE_LIMIT);
    expect(getCloudWebsiteLimit({ hasSubscription: false, unlimitedWebsites: true })).toBe(
      CLOUD_FREE_WEBSITE_LIMIT,
    );
  });

  test('does not limit subscribed accounts with unlimited websites enabled', () => {
    expect(getCloudWebsiteLimit({ hasSubscription: true, unlimitedWebsites: true })).toBeNull();
  });

  test('limits Pro accounts to the Pro website limit', () => {
    expect(getCloudWebsiteLimit({ hasSubscription: true, isPro: true })).toBe(
      CLOUD_PRO_WEBSITE_LIMIT,
    );
  });

  test('does not limit Business or no-billing accounts', () => {
    expect(getCloudWebsiteLimit({ hasSubscription: true, isBusiness: true })).toBeNull();
    expect(getCloudWebsiteLimit({ hasSubscription: true, isNoBilling: true })).toBeNull();
  });

  // Team-owned websites pass the team cache object (derived from the team owner's account)
  // through this same function, so members inherit the owner's unlimitedWebsites entitlement.
  test('does not limit teams that inherit unlimited websites from a subscribed owner', () => {
    expect(
      getCloudWebsiteLimit({ hasSubscription: true, isPro: true, unlimitedWebsites: true }),
    ).toBeNull();
  });

  test('still limits teams whose owner has no subscription even if unlimited websites is set', () => {
    expect(
      getCloudWebsiteLimit({ hasSubscription: false, unlimitedWebsites: true }),
    ).toBe(CLOUD_FREE_WEBSITE_LIMIT);
  });
});
