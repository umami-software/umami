import React, { useState, useRef, useEffect } from 'react';

function isInViewport(node) {
  return (
    window.pageYOffset < node.offsetTop + node.clientHeight ||
    window.pageXOffset < node.offsetLeft + node.clientWidth
  );
}

export default function CheckVisible({ children }) {
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

  return <div ref={ref}>{typeof children === 'function' ? children(visible) : children}</div>;
}
