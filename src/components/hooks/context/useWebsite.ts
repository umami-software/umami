import { WebsiteContext } from '@/app/(main)/websites/WebsiteProvider';
import { useContext } from 'react';

export function useWebsite() {
  return useContext(WebsiteContext);
}
