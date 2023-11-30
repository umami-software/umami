import { ReactNode, useEffect, useState } from 'react';
import { Tooltip } from 'react-basics';
import styles from './HoverTooltip.module.css';

export function HoverTooltip({ children }: { children: ReactNode }) {
  const [position, setPosition] = useState({ x: -1000, y: -1000 });

  useEffect(() => {
    const handler = e => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    document.addEventListener('mousemove', handler);

    return () => {
      document.removeEventListener('mousemove', handler);
    };
  }, []);

  return (
    <Tooltip className={styles.tooltip} style={{ left: position.x, top: position.y }}>
      {children}
    </Tooltip>
  );
}

export default HoverTooltip;
