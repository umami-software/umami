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
});
