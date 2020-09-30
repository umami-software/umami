import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Page from 'components/layout/Page';
import MenuLayout from 'components/layout/MenuLayout';
import WebsiteSettings from '../settings/WebsiteSettings';
import AccountSettings from '../settings/AccountSettings';
import ProfileSettings from '../settings/ProfileSettings';
import { useSelector } from 'react-redux';
import { FormattedMessage } from 'react-intl';

const WEBSITES = '/settings';
const ACCOUNTS = '/settings/accounts';
const PROFILE = '/settings/profile';

export default function Settings() {
  const user = useSelector(state => state.user);
  const [option, setOption] = useState(WEBSITES);
  const router = useRouter();
  const { pathname } = router;

  const menuOptions = [
    {
      label: <FormattedMessage id="label.websites" defaultMessage="Websites" />,
      value: WEBSITES,
    },
    {
      label: <FormattedMessage id="label.accounts" defaultMessage="Accounts" />,
      value: ACCOUNTS,
      hidden: !user?.is_admin,
    },
    {
      label: <FormattedMessage id="label.profile" defaultMessage="Profile" />,
      value: PROFILE,
    },
  ];

  return (
    <Page>
      <MenuLayout menu={menuOptions} selectedOption={option} onMenuSelect={setOption}>
        {pathname === WEBSITES && <WebsiteSettings />}
        {pathname === ACCOUNTS && <AccountSettings />}
        {pathname === PROFILE && <ProfileSettings />}
      </MenuLayout>
    </Page>
  );
}
