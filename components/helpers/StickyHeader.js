import { useEffect, useRef } from 'react';
import classNames from 'classnames';
import useSticky from 'hooks/useSticky';

export default function StickyHeader({ className, stickyClassName, stickyStyle, children }) {
  const { ref, isSticky } = useSticky();
  const initialWidth = useRef(0);

  useEffect(() => {
    initialWidth.current = ref.current.clientWidth;
  }, [ref]);

  return (
    <div
      ref={ref}
      data-sticky={isSticky}
      className={classNames(className, { [stickyClassName]: isSticky })}
      style={isSticky ? { ...stickyStyle, width: initialWidth.current } : null}
    >
      {children}
    </div>
  );
}
