import React, { useState } from 'react';
import Page from 'components/layout/Page';
import MenuLayout from 'components/layout/MenuLayout';
import WebsiteSettings from './WebsiteSettings';
import AccountSettings from './AccountSettings';
import ProfileSettings from './ProfileSettings';
import { useSelector } from 'react-redux';

export default function Settings() {
  const user = useSelector(state => state.user);
  const [option, setOption] = useState('Websites');

  const menuOptions = ['Websites', user.is_admin && 'Accounts', 'Profile'];

  return (
    <Page>
      <MenuLayout menu={menuOptions} selectedOption={option} onMenuSelect={setOption}>
        {option === 'Websites' && <WebsiteSettings />}
        {option === 'Accounts' && <AccountSettings />}
        {option === 'Profile' && <ProfileSettings />}
      </MenuLayout>
    </Page>
  );
}
