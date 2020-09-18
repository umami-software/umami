import React, { useMemo } from 'react';
import classNames from 'classnames';
import useFetch from 'hooks/useFetch';
import styles from './ActiveUsers.module.css';
import { FormattedMessage } from 'react-intl';

export default function ActiveUsers({ websiteId, token, className }) {
  const { data } = useFetch(`/api/website/${websiteId}/active`, { token }, { interval: 60000 });
  const count = useMemo(() => {
    return data?.[0]?.x || 0;
  }, [data]);

  if (count === 0) {
    return null;
  }

  return (
    <div className={classNames(styles.container, className)}>
      <div className={styles.dot} />
      <div className={styles.text}>
        <div>
          <FormattedMessage
            id="message.active-users"
            defaultMessage="{x} current {x, plural, one {visitor} other {visitors}}"
            values={{ x: count }}
          />
        </div>
      </div>
    </div>
  );
}
