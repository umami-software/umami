import { useContext } from 'react';
import { LinkContext } from '@/app/(main)/links/LinkProvider';

export function useLink() {
  return useContext(LinkContext);
}
