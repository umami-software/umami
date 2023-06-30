import { useEffect, useCallback } from 'react';

export function useEscapeKey(handler) {
  const escFunction = useCallback(event => {
    if (event.keyCode === 27) {
      handler(event);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', escFunction, false);

    return () => {
      document.removeEventListener('keydown', escFunction, false);
    };
  }, [escFunction]);

  return null;
}

export default useEscapeKey;
