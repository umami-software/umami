import React from 'react';
import Page from 'components/layout/Page';
import MenuLayout from 'components/layout/MenuLayout';
import WebsiteSettings from './WebsiteSettings';
import AccountSettings from './AccountSettings';
import ProfileSettings from './ProfileSettings';

const menuOptions = ['Websites', 'Accounts', 'Profile'];

export default function Settings() {
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
