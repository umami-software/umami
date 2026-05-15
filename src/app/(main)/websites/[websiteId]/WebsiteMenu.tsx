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
import { useMessages, useNavigation } from '@/components/hooks';
import { Edit, MoreHorizontal, Share } from '@/components/icons';

export function WebsiteMenu({ websiteId }: { websiteId: string }) {
  const { t, labels } = useMessages();
  const { router, updateParams, renderUrl } = useNavigation();

  const menuItems = [
    { id: 'share', label: t(labels.share), icon: <Share /> },
    { id: 'edit', label: t(labels.edit), icon: <Edit />, seperator: true },
  ];

  const handleAction = (id: any) => {
    if (id === 'compare') {
      router.push(updateParams({ compare: 'prev' }));
    } else if (id === 'edit') {
      router.push(renderUrl(`/websites/${websiteId}`));
    }
  };

  return (
    <MenuTrigger>
      <Button variant="quiet">
        <Icon>
          <MoreHorizontal />
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
