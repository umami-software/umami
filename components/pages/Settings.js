import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useRouter } from 'next/router';
import Page from 'components/layout/Page';
import MenuLayout from 'components/layout/MenuLayout';
import WebsiteSettings from 'components/settings/WebsiteSettings';
import AccountSettings from 'components/settings/AccountSettings';
import ProfileSettings from 'components/settings/ProfileSettings';
import useUser from 'hooks/useUser';

const WEBSITES = '/settings';
const ACCOUNTS = '/settings/accounts';
const PROFILE = '/settings/profile';

export default function Settings() {
  const { user } = useUser();
  const [option, setOption] = useState(WEBSITES);
  const router = useRouter();
  const { pathname } = router;

  if (!user) {
    return null;
  }

  const menuOptions = [
    {
      label: <FormattedMessage id="label.websites" defaultMessage="Websites" />,
      value: WEBSITES,
    },
    {
      label: <FormattedMessage id="label.accounts" defaultMessage="Accounts" />,
      value: ACCOUNTS,
      hidden: !user?.isAdmin,
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
