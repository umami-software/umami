import {
  Button,
  Icon,
  Icons,
  Menu,
  MenuItem,
  MenuSeparator,
  MenuTrigger,
  Popover,
  Text,
} from '@umami/react-zen';
import { Fragment } from 'react';
import { Lucide } from '@/components/icons';
import { useMessages } from '@/components/hooks';

export function WebsiteMenu({ websiteId }: { websiteId: string }) {
  const { formatMessage, labels } = useMessages();

  const menuItems = [
    { label: formatMessage(labels.compare), icon: <Lucide.GitCompare /> },
    { label: formatMessage(labels.share), icon: <Lucide.Share /> },
    { label: formatMessage(labels.edit), icon: <Lucide.Edit />, seperator: true },
  ];

  return (
    <MenuTrigger>
      <Button variant="quiet">
        <Icon>
          <Icons.More />
        </Icon>
      </Button>
      <Popover placement="bottom end">
        <Menu>
          {menuItems.map(({ label, icon, seperator }, index) => {
            return (
              <Fragment key={index}>
                {seperator && <MenuSeparator />}
                <MenuItem>
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
