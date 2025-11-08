import { useEffect, useCallback, KeyboardEvent } from 'react';

export function useEscapeKey(handler: (event: KeyboardEvent) => void) {
  const escFunction = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      handler(event);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', escFunction as any, false);

    return () => {
      document.removeEventListener('keydown', escFunction as any, false);
    };
  }, [escFunction]);

  return null;
}
