import { useContext } from 'react';
import { WebsiteContext } from '@/app/(main)/websites/WebsiteProvider';

export function useWebsite() {
  return useContext(WebsiteContext);
}
