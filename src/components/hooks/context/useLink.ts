import { LinkContext } from '@/app/(main)/links/LinkProvider';
import { useContext } from 'react';

export function useLink() {
  return useContext(LinkContext);
}
