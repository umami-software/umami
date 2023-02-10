import { useEffect, useRef } from 'react';
import { useMeasure, useCombinedRefs } from 'react-basics';
import classNames from 'classnames';
import useSticky from 'hooks/useSticky';
import { UI_LAYOUT_BODY } from 'lib/constants';

export default function StickyHeader({
  className,
  stickyClassName,
  stickyStyle,
  enabled = true,
  children,
}) {
  const { ref: scrollRef, isSticky } = useSticky({ scrollElementId: UI_LAYOUT_BODY });
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
