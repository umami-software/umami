import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useSelector } from 'react-redux';
import PageHeader from 'components/layout/PageHeader';
import Button from 'components/common/Button';
import Modal from 'components/common/Modal';
import Toast from 'components/common/Toast';
import ChangePasswordForm from 'components/forms/ChangePasswordForm';
import TimezoneSetting from 'components/settings/TimezoneSetting';
import Dots from 'assets/ellipsis-h.svg';
import styles from './ProfileSettings.module.css';
import DateRangeSetting from './DateRangeSetting';
import useEscapeKey from 'hooks/useEscapeKey';

export default function ProfileSettings() {
  const user = useSelector(state => state.user);
  const [changePassword, setChangePassword] = useState(false);
  const [message, setMessage] = useState();
  const { user_id } = user;

  function handleSave() {
    setChangePassword(false);
    setMessage(<FormattedMessage id="message.save-success" defaultMessage="Saved successfully." />);
  }

  useEscapeKey(() => {
    setChangePassword(false);
  });

  return (
    <>
      <PageHeader>
        <div>
          <FormattedMessage id="label.profile" defaultMessage="Profile" />
        </div>
        <Button icon={<Dots />} size="small" onClick={() => setChangePassword(true)}>
          <FormattedMessage id="label.change-password" defaultMessage="Change password" />
        </Button>
      </PageHeader>
      <dl className={styles.list}>
        <dt>
          <FormattedMessage id="label.username" defaultMessage="Username" />
        </dt>
        <dd>{user.username}</dd>
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
      </dl>
      {changePassword && (
        <Modal
          title={<FormattedMessage id="label.change-password" defaultMessage="Change password" />}
        >
          <ChangePasswordForm
            values={{ user_id }}
            onSave={handleSave}
            onClose={() => setChangePassword(false)}
          />
        </Modal>
      )}
      {message && <Toast message={message} onClose={() => setMessage(null)} />}
    </>
  );
}
