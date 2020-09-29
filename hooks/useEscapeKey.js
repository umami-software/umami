import { useEffect, useCallback } from 'react';

export default function useEscapeKey(handler) {
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
