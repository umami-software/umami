import { useContext } from 'react';
import { ShareContext } from '@/app/share/ShareProvider';

export function useShare() {
  return useContext(ShareContext);
}
