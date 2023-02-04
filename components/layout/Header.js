import HamburgerButton from 'components/common/HamburgerButton';
import UpdateNotice from 'components/common/UpdateNotice';
import LanguageButton from 'components/input/LanguageButton';
import ThemeButton from 'components/input/ThemeButton';
import UserButton from 'components/input/UserButton';
import useConfig from 'hooks/useConfig';
import useUser from 'hooks/useUser';
import { useRouter } from 'next/router';
import { Column, Row } from 'react-basics';
import SettingsButton from '../input/SettingsButton';
import styles from './Header.module.css';
import classNames from 'classnames';

export default function Header({ className }) {
  const { user } = useUser();
  const { pathname } = useRouter();
  const { updatesDisabled, adminDisabled } = useConfig();
  const isSharePage = pathname.includes('/share/');
  const allowUpdate = user?.isAdmin && !updatesDisabled && !isSharePage;

  return (
    <>
      {allowUpdate && <UpdateNotice />}
      <header className={classNames(styles.header, className)}>
        <Row>
          <Column className={styles.title}></Column>
          <HamburgerButton />
          <Column className={styles.buttons}>
            <ThemeButton />
            <LanguageButton menuAlign="right" />
            <SettingsButton />
            {user && !adminDisabled && <UserButton />}
          </Column>
        </Row>
      </header>
    </>
  );
}
