import React, { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames';
import useFetch from 'hooks/useFetch';
import Dot from 'components/common/Dot';
import { TOKEN_HEADER } from 'lib/constants';
import useShareToken from 'hooks/useShareToken';
import styles from './ActiveUsers.module.css';

export default function ActiveUsers({ websiteId, className, value, interval = 60000 }) {
  const shareToken = useShareToken();
  const { data } = useFetch(!value && `/api/website/${websiteId}/active`, {
    interval,
    headers: { [TOKEN_HEADER]: shareToken?.token },
  });
  const count = useMemo(() => {
    return value || data?.[0]?.x || 0;
  }, [data, value]);

  if (count === 0) {
    return null;
  }

  return (
    <div className={classNames(styles.container, className)}>
      <Dot />
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
