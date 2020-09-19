import { useCallback, useState } from 'react';

export default function useForceUpdate() {
  const [, update] = useState(Object.create(null));

  return useCallback(() => {
    update(Object.create(null));
  }, [update]);
}
