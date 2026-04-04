import { useContext } from 'react';
import { PixelContext } from '@/app/(main)/pixels/PixelProvider';

export function usePixel() {
  return useContext(PixelContext);
}
