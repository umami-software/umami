import React from 'react';
import Page from 'components/layout/Page';
import MenuLayout from 'components/layout/MenuLayout';
import WebsiteSettings from './WebsiteSettings';
import AccountSettings from './AccountSettings';
import ProfileSettings from './ProfileSettings';
import { useSelector } from 'react-redux';

export default function Settings() {
  const user = useSelector(state => state.user);

  const menuOptions = ['Websites', user.is_admin && 'Accounts', 'Profile'];

  return (
    <Page>
      <MenuLayout menu={menuOptions} selectedOption="Websites">
        {option => {
          if (option === 'Websites') {
            return <WebsiteSettings />;
          } else if (option === 'Accounts') {
            return <AccountSettings />;
          } else if (option === 'Profile') {
            return <ProfileSettings />;
          }
        }}
      </MenuLayout>
    </Page>
  );
}
