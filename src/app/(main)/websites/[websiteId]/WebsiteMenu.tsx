import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Icon,
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
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" />}>
        <Icon>
          <MoreHorizontal />
        </Icon>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom">
        {menuItems.map(({ id, label, icon, seperator }, index) => {
          return (
            <Fragment key={index}>
              {seperator && <DropdownMenuSeparator />}
              <DropdownMenuItem onClick={() => handleAction(id)}>
                <Icon>{icon}</Icon>
                <Text>{label}</Text>
              </DropdownMenuItem>
            </Fragment>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
