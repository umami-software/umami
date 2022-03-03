import React, { useState, useRef, useEffect } from 'react';
import classNames from 'classnames';

export default function StickyHeader({
  className,
  stickyClassName,
  stickyStyle,
  children,
  enabled = true,
}) {
  const [sticky, setSticky] = useState(false);
  const ref = useRef();
  const top = useRef(0);

  useEffect(() => {
    const checkPosition = () => {
      if (ref.current) {
        if (!top.current) {
          top.current = ref.current.offsetTop + ref.current.offsetHeight;
        }
        const state = window.pageYOffset > top.current;
        if (sticky !== state) {
          setSticky(state);
        }
      }
    };

    if (enabled) {
      checkPosition();
      window.addEventListener('scroll', checkPosition);
    }

    return () => {
      window.removeEventListener('scroll', checkPosition);
    };
  }, [sticky, enabled]);

  return (
    <div
      ref={ref}
      data-sticky={sticky}
      className={classNames(className, { [stickyClassName]: sticky })}
      style={sticky ? { ...stickyStyle, width: ref?.current?.clientWidth } : null}
    >
      {children}
    </div>
  );
}
