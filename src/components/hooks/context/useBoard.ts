import { useContext } from 'react';
import { BoardContext } from '@/app/(main)/boards/BoardProvider';

export function useBoard() {
  return useContext(BoardContext);
}
