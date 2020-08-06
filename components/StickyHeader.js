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
  const offsetTop = useRef(0);

  useEffect(() => {
    const checkPosition = () => {
      if (ref.current) {
        if (!offsetTop.current) {
          offsetTop.current = ref.current.offsetTop;
        }
        const state = window.pageYOffset > offsetTop.current;
        if (sticky !== state) {
          setSticky(state);
        }
      }
    };

    checkPosition();

    if (enabled) {
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
