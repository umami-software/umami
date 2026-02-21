import { Column, Focusable, Row, Tooltip, TooltipTrigger } from '@umami/react-zen';
import Link from 'next/link';
import { IconLabel } from '@/components/common/IconLabel';
import { NavMenu } from '@/components/common/NavMenu';
import { useMessages, useNavigation } from '@/components/hooks';
import { ArrowLeft, Globe, User, Users } from '@/components/icons';

export function AdminNav({ onItemClick }: { onItemClick?: () => void }) {
  const { t, labels } = useMessages();
  const { pathname, renderUrl } = useNavigation();

  const items = [
    {
      label: t(labels.manage),
      items: [
        {
          id: 'users',
          label: t(labels.users),
          path: '/admin/users',
          icon: <User />,
        },
        {
          id: 'websites',
          label: t(labels.websites),
          path: '/admin/websites',
          icon: <Globe />,
        },
        {
          id: 'teams',
          label: t(labels.teams),
          path: '/admin/teams',
          icon: <Users />,
        },
      ],
    },
  ];

  const selectedKey = items
    .flatMap(e => e.items)
    ?.find(({ path }) => path && pathname.startsWith(path))?.id;

  return (
    <Column gap="2">
      <Link href={renderUrl('/boards', false)} role="button" onClick={onItemClick}>
        <TooltipTrigger delay={0}>
          <Focusable>
            <Row
              alignItems="center"
              hover={{ backgroundColor: 'surface-sunken' }}
              borderRadius
              minHeight="40px"
            >
              <IconLabel icon={<ArrowLeft />} label={t(labels.back)} padding />
            </Row>
          </Focusable>
          <Tooltip placement="right">{t(labels.back)}</Tooltip>
        </TooltipTrigger>
      </Link>
      <NavMenu
        items={items}
        title={t(labels.admin)}
        selectedKey={selectedKey}
        allowMinimize={false}
        onItemClick={onItemClick}
      />
    </Column>
  );
}
