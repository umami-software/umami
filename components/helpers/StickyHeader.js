import classNames from 'classnames';
import useSticky from 'hooks/useSticky';

export default function StickyHeader({ className, stickyClassName, stickyStyle, children }) {
  const { ref, isSticky } = useSticky();

  return (
    <div
      ref={ref}
      data-sticky={isSticky}
      className={classNames(className, { [stickyClassName]: isSticky })}
      style={isSticky ? { ...stickyStyle, width: ref?.current?.clientWidth } : null}
    >
      {children}
    </div>
  );
}
