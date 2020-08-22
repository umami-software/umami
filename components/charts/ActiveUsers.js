import React, { useState, useEffect } from 'react';
import { useSpring, animated } from 'react-spring';
import classNames from 'classnames';
import { get } from 'lib/web';
import styles from './ActiveUsers.module.css';

export default function ActiveUsers({ websiteId, className }) {
  const [count, setCount] = useState(0);

  async function loadData() {
    const result = await get(`/api/website/${websiteId}/active`);
    setCount(result?.[0]?.x);
  }

  const props = useSpring({
    x: count,
    from: { x: 0 },
  });

  useEffect(() => {
    loadData();

    const id = setInterval(() => loadData(), 60000);

    return () => {
      clearInterval(id);
    };
  }, []);

  if (count === 0) {
    return null;
  }

  return (
    <div className={classNames(styles.container, className)}>
      <div className={styles.dot} />
      <div className={styles.text}>
        <animated.div className={styles.value}>
          {props.x.interpolate(x => x.toFixed(0))}
        </animated.div>
        <div>{`current visitor${count !== 1 ? 's' : ''}`}</div>
      </div>
    </div>
  );
}
