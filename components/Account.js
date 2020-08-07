import React from 'react';
import { useSelector } from 'react-redux';
import Page from './layout/Page';
import styles from './Account.module.css';

export default function Account() {
  const user = useSelector(state => state.user);
  return (
    <Page>
      <h2>Account</h2>
      <div className={styles.label}>username</div>
      <div>{user.username}</div>
    </Page>
  );
}
