import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import ReactTooltip from 'react-tooltip';

import styles from './OverflowText.module.css';

const OverflowText = ({ children, tooltipId }) => {
  const measureEl = useRef();
  const [isOverflown, setIsOverflown] = useState(false);

  const measure = useCallback(
    el => {
      if (!el) return;
      setIsOverflown(el.scrollWidth > el.clientWidth);
    },
    [setIsOverflown],
  );

  // Do one measure on mount
  useEffect(() => {
    measure(measureEl.current);
  }, [measure]);

  // Set up resize listener for subsequent measures
  useEffect(() => {
    if (!measureEl.current) return;

    // Destructure ref in case it changes out from under us
    const el = measureEl.current;

    if ('ResizeObserver' in global) {
      // Ideally, we have access to ResizeObservers
      const observer = new ResizeObserver(() => {
        measure(el);
      });
      observer.observe(el);
      return () => observer.unobserve(el);
    } else {
      // Otherwise, fall back to measuring on window resizes
      const handler = () => measure(el);

      window.addEventListener('resize', handler, { passive: true });
      return () => window.removeEventListener('resize', handler, { passive: true });
    }
  });

  return (
    <span
      ref={measureEl}
      data-tip={children.toString()}
      data-effect="solid"
      data-for={tooltipId}
      className={styles.root}
    >
      {children}
      {isOverflown && <ReactTooltip id={tooltipId}>{children}</ReactTooltip>}
    </span>
  );
};

OverflowText.propTypes = {
  children: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  tooltipId: PropTypes.string.isRequired,
};

export default OverflowText;
