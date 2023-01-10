import User from 'assets/user.svg';
import Team from 'assets/users.svg';
import Website from 'assets/website.svg';
import classNames from 'classnames';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Icon, Item, Menu, Text } from 'react-basics';
import styles from './Nav.module.css';
import useUser from 'hooks/useUser';

export default function Nav() {
  const user = useUser();
  const { pathname } = useRouter();

  if (!user) {
    return null;
  }

  const handleSelect = () => {};

  const items = [
    { icon: <Website />, label: 'Websites', url: '/settings/websites' },
    { icon: <User />, label: 'Users', url: '/settings/users' },
    { icon: <Team />, label: 'Teams', url: '/settings/teams' },
    { icon: <User />, label: 'Profile', url: '/settings/profile' },
  ];

  return (
    <Menu items={items} onSelect={handleSelect} className={styles.menu}>
      {({ icon, label, url, hidden }) =>
        !hidden && (
          <Item
            key={label}
            className={classNames(styles.item, { [styles.selected]: pathname.startsWith(url) })}
          >
            <Link href={url}>
              <a>
                <Icon size="lg">{icon}</Icon>
                <Text>{label}</Text>
              </a>
            </Link>
          </Item>
        )
      }
    </Menu>
  );
}
