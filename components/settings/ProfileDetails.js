import TimezoneSetting from 'components/settings/TimezoneSetting';
import useUser from 'hooks/useUser';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import DateRangeSetting from './DateRangeSetting';
import LanguageSetting from './LanguageSetting';
import styles from './ProfileDetails.module.css';
import ThemeSetting from './ThemeSetting';

export default function ProfileDetails() {
  const { user } = useUser();

  if (!user) {
    return null;
  }

  const { username } = user;

  return (
    <>
      <dl className={styles.list}>
        <dt>
          <FormattedMessage id="label.username" defaultMessage="Username" />
        </dt>
        <dd>{username}</dd>
        <dt>
          <FormattedMessage id="label.timezone" defaultMessage="Timezone" />
        </dt>
        <dd>
          <TimezoneSetting />
        </dd>
        <dt>
          <FormattedMessage id="label.default-date-range" defaultMessage="Default date range" />
        </dt>
        <dd>
          <DateRangeSetting />
        </dd>
        <dt>
          <FormattedMessage id="label.language" defaultMessage="Language" />
        </dt>
        <dd>
          <LanguageSetting />
        </dd>
        <dt>
          <FormattedMessage id="label.theme" defaultMessage="Theme" />
        </dt>
        <dd>
          <ThemeSetting />
        </dd>
      </dl>
    </>
  );
}
