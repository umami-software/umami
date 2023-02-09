import { useState, useEffect, useRef } from 'react';

export default function useSticky(
  element = document.getElementById('layout-body'),
  defaultSticky = false,
) {
  const [isSticky, setIsSticky] = useState(defaultSticky);
  const ref = useRef(null);
  const initialTop = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(element.scrollTop > initialTop.current);
    };

    if (initialTop.current === null) {
      initialTop.current = ref.current.offsetTop;
    }

    element.addEventListener('scroll', handleScroll);

    return () => {
      element.removeEventListener('scroll', handleScroll);
    };
  }, [setIsSticky]);

  return { ref, isSticky };
}
