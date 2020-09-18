import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import PageHeader from 'components/layout/PageHeader';
import Button from 'components/common/Button';
import Modal from 'components/common/Modal';
import Toast from 'components/common/Toast';
import ChangePasswordForm from 'components/forms/ChangePasswordForm';
import DateFilter from 'components/common/DateFilter';
import Dots from 'assets/ellipsis-h.svg';
import { getTimezone } from 'lib/date';
import { setItem } from 'lib/web';
import useDateRange from 'hooks/useDateRange';
import { setDateRange } from 'redux/actions/websites';
import styles from './ProfileSettings.module.css';

export default function ProfileSettings() {
  const dispatch = useDispatch();
  const user = useSelector(state => state.user);
  const [changePassword, setChangePassword] = useState(false);
  const [message, setMessage] = useState();
  const { user_id } = user;
  const timezone = getTimezone();
  const dateRange = useDateRange(0);
  const { startDate, endDate, value } = dateRange;

  function handleSave() {
    setChangePassword(false);
    setMessage(<FormattedMessage id="message.save-success" defaultMessage="Saved successfully." />);
  }

  function handleDateChange(values) {
    setItem(`umami.date-range`, values);
    dispatch(setDateRange(0, values));
  }

  return (
    <>
      <PageHeader>
        <div>
          <FormattedMessage id="label.profile" defaultMessage="Profile" />
        </div>
        <Button icon={<Dots />} size="small" onClick={() => setChangePassword(true)}>
          <div>
            <FormattedMessage id="button.change-password" defaultMessage="Change password" />
          </div>
        </Button>
      </PageHeader>
      <dl>
        <dt>
          <FormattedMessage id="label.username" defaultMessage="Username" />
        </dt>
        <dd>{user.username}</dd>
        <dt>
          <FormattedMessage id="label.timezone" defaultMessage="Timezone" />
        </dt>
        <dd>{timezone}</dd>
        <dt>
          <FormattedMessage id="label.default-date-range" defaultMessage="Default date range" />
        </dt>
        <dd className={styles.date}>
          <DateFilter
            value={value}
            startDate={startDate}
            endDate={endDate}
            onChange={handleDateChange}
          />
        </dd>
      </dl>
      {changePassword && (
        <Modal
          title={<FormattedMessage id="title.change-password" defaultMessage="Change password" />}
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
