import { useState, useEffect, useRef } from 'react';

export default function useSticky({ scrollElement = document, defaultSticky = false }) {
  const [isSticky, setIsSticky] = useState(defaultSticky);
  const ref = useRef(null);
  const initialTop = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky((scrollElement?.scrollTop ?? window.scrollY) > initialTop.current);
    };

    if (initialTop.current === null) {
      initialTop.current = ref?.current?.offsetTop;
    }

    scrollElement.addEventListener('scroll', handleScroll, true);

    return () => {
      scrollElement.removeEventListener('scroll', handleScroll, true);
    };
  }, [ref, setIsSticky]);

  return { ref, isSticky };
}
