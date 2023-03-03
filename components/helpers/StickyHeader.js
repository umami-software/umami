import { useMeasure } from 'react-basics';
import classNames from 'classnames';
import useSticky from 'hooks/useSticky';

export default function StickyHeader({
  className,
  stickyClassName,
  stickyStyle,
  enabled = true,
  scrollElement,
  children,
}) {
  const { ref: scrollRef, isSticky } = useSticky({ scrollElement });
  const { ref: measureRef, dimensions } = useMeasure();

  return (
    <div
      ref={measureRef}
      data-sticky={enabled && isSticky}
      style={enabled && isSticky ? { height: dimensions.height } : null}
    >
      <div
        ref={scrollRef}
        className={classNames(className, { [stickyClassName]: enabled && isSticky })}
        style={enabled && isSticky ? { ...stickyStyle, width: dimensions.width } : null}
      >
        {children}
      </div>
    </div>
  );
}
