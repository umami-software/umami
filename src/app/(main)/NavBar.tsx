'use client';
import { Icon, Text, ThemeButton, Row } from '@umami/react-zen';
import Link from 'next/link';
import { LanguageButton } from '@/components/input/LanguageButton';
import { ProfileButton } from '@/components/input/ProfileButton';
import { TeamsButton } from '@/components/input/TeamsButton';
import { Icons } from '@/components/icons';
import { useMessages, useTeamUrl } from '@/components/hooks';

export function NavBar() {
  const { formatMessage, labels } = useMessages();
  const { renderTeamUrl } = useTeamUrl();

  const links = [
    { label: formatMessage(labels.dashboard), url: renderTeamUrl('/dashboard') },
    { label: formatMessage(labels.websites), url: renderTeamUrl('/websites') },
    { label: formatMessage(labels.reports), url: renderTeamUrl('/reports') },
    { label: formatMessage(labels.settings), url: renderTeamUrl('/settings') },
  ].filter(n => n);

  return (
    <Row justifyContent="space-between" alignItems="center" paddingX="4" paddingY="3">
      <Row alignItems="center" gap="3">
        <Icon size="md">
          <Icons.Logo />
        </Icon>
        <Text size="3" weight="bold">
          umami
        </Text>
      </Row>
      <Row gap="4">
        {links.map(({ url, label }) => {
          return (
            <Link key={url} href={url} prefetch={url !== '/settings'}>
              <Text>{label}</Text>
            </Link>
          );
        })}
      </Row>
      <Row justifyContent="flex-end">
        <TeamsButton />
        <ThemeButton />
        <LanguageButton />
        <ProfileButton />
      </Row>
    </Row>
  );
}
