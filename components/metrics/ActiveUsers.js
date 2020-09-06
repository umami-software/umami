import React, { useMemo } from 'react';
import { useSpring, animated } from 'react-spring';
import classNames from 'classnames';
import useFetch from 'hooks/useFetch';
import styles from './ActiveUsers.module.css';
import { FormattedMessage } from 'react-intl';

export default function ActiveUsers({ websiteId, className }) {
  const { data } = useFetch(`/api/website/${websiteId}/active`, {}, { interval: 60000 });
  const count = useMemo(() => {
    return data?.[0]?.x || 0;
  }, [data]);

  const props = useSpring({
    x: count,
    from: { x: 0 },
  });

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
        <div>
          <FormattedMessage
            id="active-users.message"
            defaultMessage="current {count, plural, one {visitor} other {visitors}}"
            values={{ count }}
          />
        </div>
      </div>
    </div>
  );
}
