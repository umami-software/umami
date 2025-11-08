import { useEffect } from 'react';

export function useDocumentClick(handler: (event: MouseEvent) => any) {
  useEffect(() => {
    document.addEventListener('click', handler);

    return () => {
      document.removeEventListener('click', handler);
    };
  }, [handler]);

  return null;
}
