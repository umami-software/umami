import { ReactNode } from 'react';
import Link from 'next/link';
import { Icon } from '@umami/react-zen';
import { Icons } from '@/components/icons';
import { useMessages, useTeamUrl } from '@/components/hooks';
import styles from './SideNav.module.css';

export function SideNav() {
  const { formatMessage, labels } = useMessages();
  const { renderTeamUrl } = useTeamUrl();

  const links = [
    {
      label: formatMessage(labels.boards),
      href: renderTeamUrl('/boards'),
      icon: <Icons.Dashboard />,
    },
    {
      label: formatMessage(labels.dashboard),
      href: renderTeamUrl('/dashboard'),
      icon: <Icons.BarChart />,
    },
    {
      label: formatMessage(labels.websites),
      href: renderTeamUrl('/websites'),
      icon: <Icons.Globe />,
    },
    {
      label: formatMessage(labels.reports),
      href: renderTeamUrl('/reports'),
      icon: <Icons.Reports />,
    },
    {
      label: formatMessage(labels.settings),
      href: renderTeamUrl('/settings'),
      icon: <Icons.Gear />,
    },
  ].filter(n => n);

  return (
    <div className={styles.sidenav}>
      <SideNavSection>
        <SideNavHeader />
      </SideNavSection>
      <SideNavSection>
        {links.map(props => {
          return <SideNavItem key={props.href} {...props} />;
        })}
      </SideNavSection>
    </div>
  );
}

const SideNavHeader = () => {
  return (
    <div className={styles.header}>
      <Icon size="sm">
        <Icons.Logo />
      </Icon>
      <div className={styles.name}>umami</div>
    </div>
  );
};

const SideNavSection = ({ title, children }: { title?: string; children: ReactNode }) => {
  return (
    <div className={styles.section}>
      {title && <div className={styles.title}>{title}</div>}
      <div className={styles.items}>{children}</div>
    </div>
  );
};

const SideNavItem = ({ href, label, icon }: { href: string; label: string; icon: ReactNode }) => {
  return (
    <Link href={href} className={styles.item}>
      <Icon size="sm">{icon}</Icon>
      {label}
    </Link>
  );
};
