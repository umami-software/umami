import { useState, useEffect, useRef } from 'react';

export function useSticky({ enabled = true, threshold = 1 }) {
  const [isSticky, setIsSticky] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    let observer: IntersectionObserver | undefined;
    const handler: IntersectionObserverCallback = ([entry]) =>
      setIsSticky(entry.intersectionRatio < threshold);

    if (enabled && ref.current) {
      observer = new IntersectionObserver(handler, { threshold: [threshold] });
      observer.observe(ref.current);
    }
    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, [ref, enabled, threshold]);

  return { ref, isSticky };
}

export default useSticky;
