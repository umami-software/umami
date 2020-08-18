import React, { useState } from 'react';
import Page from 'components/layout/Page';
import MenuLayout from 'components/layout/MenuLayout';
import WebsiteSettings from './WebsiteSettings';
import AccountSettings from './AccountSettings';
import ProfileSettings from './ProfileSettings';
import { useSelector } from 'react-redux';

export default function Settings() {
  const user = useSelector(state => state.user);
  const [option, setOption] = useState(1);

  const menuOptions = [
    { label: 'Websites', value: 1 },
    { label: 'Accounts', value: 2, hidden: !user.is_admin },
    { label: 'Profile', value: 3 },
  ];

  return (
    <Page>
      <MenuLayout menu={menuOptions} selectedOption={option} onMenuSelect={setOption}>
        {option === 1 && <WebsiteSettings />}
        {option === 2 && <AccountSettings />}
        {option === 3 && <ProfileSettings />}
      </MenuLayout>
    </Page>
  );
}
