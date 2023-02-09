import { useState, useEffect, useRef } from 'react';

export default function useSticky(defaultSticky = false) {
  const [isSticky, setIsSticky] = useState(defaultSticky);
  const ref = useRef(null);
  const initialTop = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      if (window.pageYOffset > initialTop.current) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };

    initialTop.current = ref.current.offsetTop;

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return { ref, isSticky };
}
