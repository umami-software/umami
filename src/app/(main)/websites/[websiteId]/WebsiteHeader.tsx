import {
  Column,
  Row,
  Heading,
  MenuTrigger,
  Button,
  Icon,
  Icons,
  Popover,
  Menu,
  MenuItem,
  MenuSeparator,
} from '@umami/react-zen';
import { Favicon } from '@/components/common/Favicon';
import { ActiveUsers } from '@/components/metrics/ActiveUsers';
import { WebsiteTabs } from '@/app/(main)/websites/[websiteId]/WebsiteTabs';
import { useWebsite } from '@/components/hooks/useWebsite';
import { WebsiteFilterButton } from '@/app/(main)/websites/[websiteId]/WebsiteFilterButton';
import { WebsiteDateFilter } from '@/components/input/WebsiteDateFilter';
import { FilterTags } from '@/components/metrics/FilterTags';
import { useMessages } from '@/components/hooks';

export function WebsiteHeader({
  websiteId,
  showFilter = true,
  allowEdit = true,
  compareMode = false,
}: {
  websiteId: string;
  showFilter?: boolean;
  allowEdit?: boolean;
  compareMode?: boolean;
}) {
  const website = useWebsite();
  const { formatMessage, labels } = useMessages();
  const { name, domain } = website || {};

  const items = [
    { label: formatMessage(labels.previousPeriod), value: 'prev' },
    { label: formatMessage(labels.previousYear), value: 'yoy' },
  ];

  return (
    <Column marginY="6" gap="6">
      <Row alignItems="center" justifyContent="space-between" gap="3">
        <Row alignItems="center" gap="3">
          <Favicon domain={domain} />
          <Heading>
            {name}
            <ActiveUsers websiteId={websiteId} />
          </Heading>
        </Row>
        <Row alignItems="center" gap="3">
          {showFilter && <WebsiteFilterButton websiteId={websiteId} />}
          <WebsiteDateFilter websiteId={websiteId} />
          {allowEdit && (
            <MenuTrigger>
              <Button variant="quiet">
                <Icon>
                  <Icons.More />
                </Icon>
              </Button>
              <Popover placement="bottom end">
                <Menu>
                  <MenuItem>Compare dates</MenuItem>
                  <MenuItem>Share</MenuItem>
                  <MenuSeparator />
                  <MenuItem>Settings</MenuItem>
                </Menu>
              </Popover>
            </MenuTrigger>
          )}
        </Row>
      </Row>
      {compareMode && items.map(item => <div key={item.value}>{item.label}</div>)}
      <FilterTags websiteId={websiteId} />
      <WebsiteTabs websiteId={websiteId} />
    </Column>
  );
}
