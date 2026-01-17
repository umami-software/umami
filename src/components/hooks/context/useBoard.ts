import { useContext } from 'react';
import { BoardContext, type BoardContextValue } from '@/app/(main)/boards/BoardProvider';

export function useBoard(): BoardContextValue {
  return useContext(BoardContext);
}
