import { WebsiteContext } from '@/app/(main)/websites/[websiteId]/WebsiteProvider';
import { useContext } from 'react';

export function useWebsite() {
  const website = useContext(WebsiteContext);

  return website;
}
