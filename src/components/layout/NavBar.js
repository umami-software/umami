import { Icon, Text, Row, Column } from 'react-basics';
import Link from 'next/link';
import { useRouter } from 'next/router';
import classNames from 'classnames';
import Icons from 'components/icons';
import ThemeButton from 'components/input/ThemeButton';
import LanguageButton from 'components/input/LanguageButton';
import ProfileButton from 'components/input/ProfileButton';
import useMessages from 'components/hooks/useMessages';
import HamburgerButton from 'components/common/HamburgerButton';
import styles from './NavBar.module.css';

export function NavBar() {
  const { pathname } = useRouter();
  const { formatMessage, labels } = useMessages();

  const links = [
    { label: formatMessage(labels.dashboard), url: '/dashboard' },
    { label: formatMessage(labels.websites), url: '/websites' },
    { label: formatMessage(labels.reports), url: '/reports' },
    { label: formatMessage(labels.settings), url: '/settings' },
  ].filter(n => n);

  return (
    <div className={classNames(styles.navbar)}>
      <Row>
        <Column className={styles.left}>
          <div className={styles.logo}>
            <Icon size="lg">
              <Icons.Logo />
            </Icon>
            <Text className={styles.text}>umami</Text>
          </div>
          <div className={styles.links}>
            {links.map(({ url, label }) => {
              return (
                <Link
                  key={url}
                  href={url}
                  className={classNames({ [styles.selected]: pathname.startsWith(url) })}
                >
                  <Text>{label}</Text>
                </Link>
              );
            })}
          </div>
        </Column>
        <Column className={styles.right}>
          <div className={styles.actions}>
            <ThemeButton />
            <LanguageButton />
            <ProfileButton />
          </div>
          <div className={styles.mobile}>
            <HamburgerButton />
          </div>
        </Column>
      </Row>
    </div>
  );
}

export default NavBar;
