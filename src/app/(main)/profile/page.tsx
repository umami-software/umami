import ProfileHeader from './ProfileHeader';
import ProfileSettings from './ProfileSettings';
import { Metadata } from 'next';
import styles from './page.module.css';

export default function () {
  return (
    <div className={styles.container}>
      <ProfileHeader />
      <ProfileSettings />
    </div>
  );
}

export const metadata: Metadata = {
  title: 'Profile | Umami',
};
