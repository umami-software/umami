import ProfileHeader from './ProfileHeader';
import ProfileSettings from './ProfileSettings';
import { Metadata } from 'next';

export default function () {
  return (
    <>
      <ProfileHeader />
      <ProfileSettings />
    </>
  );
}

export const metadata: Metadata = {
  title: 'Profile Settings | umami',
};
