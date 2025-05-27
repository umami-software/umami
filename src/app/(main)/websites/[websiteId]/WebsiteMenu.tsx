import {
  Button,
  Icon,
  Menu,
  MenuItem,
  MenuSeparator,
  MenuTrigger,
  Popover,
  Text,
} from '@umami/react-zen';
import { Fragment } from 'react';
import { More, Share, Edit } from '@/components/icons';
import { useMessages, useNavigation } from '@/components/hooks';
import { InputItem } from '@/lib/types';

export function WebsiteMenu({ websiteId }: { websiteId: string }) {
  const { formatMessage, labels } = useMessages();
  const { router, renderUrl, renderTeamUrl } = useNavigation();

  const menuItems: InputItem[] = [
    { id: 'share', label: formatMessage(labels.share), icon: <Share /> },
    { id: 'edit', label: formatMessage(labels.edit), icon: <Edit />, seperator: true },
  ];

  const handleAction = (id: any) => {
    if (id === 'compare') {
      router.push(renderUrl({ compare: 'prev' }));
    } else if (id === 'edit') {
      router.push(renderTeamUrl(`/settings/websites/${websiteId}`));
    }
  };

  return (
    <MenuTrigger>
      <Button variant="quiet">
        <Icon>
          <More />
        </Icon>
      </Button>
      <Popover placement="bottom">
        <Menu onAction={handleAction}>
          {menuItems.map(({ id, label, icon, seperator }, index) => {
            return (
              <Fragment key={index}>
                {seperator && <MenuSeparator />}
                <MenuItem id={id}>
                  <Icon>{icon}</Icon>
                  <Text>{label}</Text>
                </MenuItem>
              </Fragment>
            );
          })}
        </Menu>
      </Popover>
    </MenuTrigger>
  );
}
