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
  const active = enabled && isSticky;

  return (
    <div
      ref={measureRef}
      data-sticky={active}
      style={active ? { height: dimensions.height } : null}
    >
      <div
        ref={scrollRef}
        className={classNames(className, { [stickyClassName]: active })}
        style={active ? { ...stickyStyle, width: dimensions.width } : null}
      >
        {children}
      </div>
    </div>
  );
}
