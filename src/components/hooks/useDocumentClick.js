import { useEffect } from 'react';

export function useDocumentClick(handler) {
  useEffect(() => {
    document.addEventListener('click', handler);

    return () => {
      document.removeEventListener('click', handler);
    };
  }, [handler]);

  return null;
}

export default useDocumentClick;
