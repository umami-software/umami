import cache from 'lib/cache';
import { getWebsite } from 'queries';
import { Website } from './types';

export async function loadWebsite(websiteId: string): Promise<Website> {
  let website;

  if (cache.enabled) {
    website = await cache.fetchWebsite(websiteId);
  } else {
    website = await getWebsite({ id: websiteId });
  }

  if (!website || website.deletedAt) {
    return null;
  }

  return website;
}
