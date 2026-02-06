import { Column, Text } from '@umami/react-zen';
import { NavMenu } from '@/components/common/NavMenu';
import { useNavigation, useWebsiteNavItems } from '@/components/hooks';
import { WebsiteSelect } from '@/components/input/WebsiteSelect';

export function WebsiteNav({
  websiteId,
  onItemClick,
}: {
  websiteId: string;
  onItemClick?: () => void;
}) {
  const { teamId, router, renderUrl } = useNavigation();
  const { items, selectedKey } = useWebsiteNavItems(websiteId);

  const handleChange = (value: string) => {
    router.push(renderUrl(`/websites/${value}`));
  };

  const renderValue = (value: any) => {
    return (
      <Text truncate style={{ maxWidth: 160, lineHeight: 1 }}>
        {value?.selectedItem?.name}
      </Text>
    );
  };

  return (
    <Column padding="2" position="sticky" top="0" gap>
      <WebsiteSelect
        websiteId={websiteId}
        teamId={teamId}
        onChange={handleChange}
        renderValue={renderValue}
        buttonProps={{ style: { outline: 'none' } }}
      />
      <NavMenu
        items={items}
        selectedKey={selectedKey}
        allowMinimize={false}
        onItemClick={onItemClick}
      />
    </Column>
  );
}
