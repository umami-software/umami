import { useMemo } from 'react';
import { StatusLight } from 'react-basics';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames';
import useApi from 'hooks/useApi';
import styles from './ActiveUsers.module.css';

export default function ActiveUsers({ websiteId, className, value, refetchInterval = 60000 }) {
  const url = websiteId ? `/websites/${websiteId}/active` : null;
  const { get, useQuery } = useApi();
  const { data } = useQuery(['websites:active', websiteId], () => get(url), {
    refetchInterval,
  });

  const count = useMemo(() => {
    if (websiteId) {
      return data?.[0]?.x || 0;
    }

    return value !== undefined ? value : 0;
  }, [data, value, websiteId]);

  if (count === 0) {
    return null;
  }

  return (
    <div className={classNames(styles.container, className)}>
      <StatusLight variant="success" />
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
