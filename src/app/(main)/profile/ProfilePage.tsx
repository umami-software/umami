'use client';
import { ProfileHeader } from './ProfileHeader';
import { ProfileSettings } from './ProfileSettings';
import styles from './ProfilePage.module.css';

export function ProfilePage() {
  return (
    <div className={styles.container}>
      <ProfileHeader />
      <ProfileSettings />
    </div>
  );
}
