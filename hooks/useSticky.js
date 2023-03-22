import { useState, useEffect, useRef } from 'react';

export default function useSticky({ defaultSticky = false, enabled = true }) {
  const [isSticky, setIsSticky] = useState(defaultSticky);
  const ref = useRef(null);

  useEffect(() => {
    let observer;
    const handler = ([entry]) => setIsSticky(entry.intersectionRatio < 1);

    if (enabled && ref.current) {
      observer = new IntersectionObserver(handler, { threshold: [1] });
      observer.observe(ref.current);
    }
    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, [ref]);

  return { ref, isSticky };
}
