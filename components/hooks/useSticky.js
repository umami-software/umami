import { useState, useEffect, useCallback, useRef } from 'react';

export default function useSticky(enabled) {
  const [node, setNode] = useState(null);
  const [sticky, setSticky] = useState(false);
  const offsetTop = useRef(0);

  const ref = useCallback(node => {
    offsetTop.current = node?.offsetTop;
    setNode(node);
  }, []);

  useEffect(() => {
    const checkPosition = () => {
      const state = window.pageYOffset > offsetTop.current;
      if (node && sticky !== state) {
        setSticky(state);
      }
    };

    if (enabled) {
      window.addEventListener('scroll', checkPosition);
    }

    return () => {
      window.removeEventListener('scroll', checkPosition);
    };
  }, [node, sticky, enabled]);

  return [ref, sticky];
}
