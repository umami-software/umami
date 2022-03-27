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
  const url = websiteId ? `/website/${websiteId}/active` : null;
  const { data } = useFetch(url, {
    interval,
    headers: { [TOKEN_HEADER]: shareToken?.token },
  });
  const count = useMemo(() => {
    if (websiteId) {
      return data?.[0]?.x || 0
    }

    return value !== undefined ? value : 0;
  }, [data, value, websiteId]);

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
