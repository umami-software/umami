import { PixelContext } from '@/app/(main)/pixels/PixelProvider';
import { useContext } from 'react';

export function usePixel() {
  return useContext(PixelContext);
}
