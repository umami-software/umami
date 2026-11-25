import { useCallback, useState } from 'react';
import { getItem, setItem } from '@/lib/storage';

export function useColumnSelection(storageKey: string, allIds: string[], defaultIds: string[]) {
  const [visible, setVisible] = useState<string[]>(() => {
    const stored = getItem(storageKey);

    if (Array.isArray(stored)) {
      const valid = stored.filter(id => allIds.includes(id));

      if (valid.length > 0) {
        return valid;
      }
    }

    return defaultIds;
  });

  const toggle = useCallback(
    (id: string) => {
      setVisible(prev => {
        const next = prev.includes(id) ? prev.filter(value => value !== id) : [...prev, id];

        if (next.length === 0) {
          return prev;
        }

        setItem(storageKey, next);
        return next;
      });
    },
    [storageKey],
  );

  const reset = useCallback(() => {
    setItem(storageKey, defaultIds);
    setVisible(defaultIds);
  }, [storageKey, defaultIds]);

  return { visible, toggle, reset };
}
