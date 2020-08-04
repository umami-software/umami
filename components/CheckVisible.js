import React, { useState, useRef, useEffect } from 'react';

function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  return !(
    rect.bottom < 0 ||
    rect.right < 0 ||
    rect.left > window.innerWidth ||
    rect.top > window.innerHeight
  );
}

export default function CheckVisible({ className, children }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const checkPosition = () => {
      if (ref.current) {
        const state = isInViewport(ref.current);
        if (state !== visible) {
          setVisible(state);
        }
      }
    };

    checkPosition();

    window.addEventListener('scroll', checkPosition);

    return () => {
      window.removeEventListener('scroll', checkPosition);
    };
  }, [visible]);

  return (
    <div ref={ref} className={className} data-visible={visible}>
      {typeof children === 'function' ? children(visible) : children}
    </div>
  );
}
