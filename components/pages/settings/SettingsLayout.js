import AppLayout from 'components/layout/AppLayout';
import Menu from 'components/nav/Nav';
import styles from './SettingsLayout.module.css';
import useConfig from 'hooks/useConfig';

export default function SettingsLayout({ children }) {
  const { adminDisabled } = useConfig();

  if (adminDisabled) {
    return null;
  }

  return (
    <AppLayout>
      <div className={styles.dashboard}>
        <div className={styles.nav}>
          <Menu />
        </div>
        <div className={styles.content}>{children}</div>
      </div>
    </AppLayout>
  );
}
