import React, { useState } from 'react';
import Page from 'components/layout/Page';
import MenuLayout from 'components/layout/MenuLayout';
import WebsiteSettings from './WebsiteSettings';
import AccountSettings from './AccountSettings';
import ProfileSettings from './ProfileSettings';
import { useSelector } from 'react-redux';
import { FormattedMessage } from 'react-intl';

const WEBSITES = 1;
const ACCOUNTS = 2;
const PROFILE = 3;

export default function Settings() {
  const user = useSelector(state => state.user);
  const [option, setOption] = useState(WEBSITES);

  const menuOptions = [
    {
      label: <FormattedMessage id="settings.websites" defaultMessage="Websites" />,
      value: WEBSITES,
    },
    {
      label: <FormattedMessage id="settings.accounts" defaultMessage="Accounts" />,
      value: ACCOUNTS,
      hidden: !user.is_admin,
    },
    { label: <FormattedMessage id="settings.profile" defaultMessage="Profile" />, value: PROFILE },
  ];

  return (
    <Page>
      <MenuLayout menu={menuOptions} selectedOption={option} onMenuSelect={setOption}>
        {option === WEBSITES && <WebsiteSettings />}
        {option === ACCOUNTS && <AccountSettings />}
        {option === PROFILE && <ProfileSettings />}
      </MenuLayout>
    </Page>
  );
}
