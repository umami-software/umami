import { Column, Row, Heading } from '@umami/react-zen';
import { Favicon } from '@/components/common/Favicon';
import { ActiveUsers } from '@/components/metrics/ActiveUsers';
import { useWebsite } from '@/components/hooks/useWebsite';
import { WebsiteFilterButton } from '@/app/(main)/websites/[websiteId]/WebsiteFilterButton';
import { WebsiteDateFilter } from '@/components/input/WebsiteDateFilter';
import { FilterBar } from '@/components/metrics/FilterBar';
import { WebsiteMenu } from '@/app/(main)/websites/[websiteId]/WebsiteMenu';

export function WebsiteHeader({
  websiteId,
  showFilter = true,
  allowEdit = true,
}: {
  websiteId: string;
  showFilter?: boolean;
  allowEdit?: boolean;
}) {
  const website = useWebsite();
  const { name, domain } = website || {};

  return (
    <Column marginY="6" gap="6">
      <Row alignItems="center" justifyContent="space-between" gap="3">
        <Row alignItems="center" gap="3">
          <Favicon domain={domain} />
          <Heading>{name}</Heading>
        </Row>
        <ActiveUsers websiteId={websiteId} />
        <Row alignItems="center" gap="3">
          {showFilter && <WebsiteFilterButton websiteId={websiteId} />}
          <WebsiteDateFilter websiteId={websiteId} />
          {allowEdit && <WebsiteMenu websiteId={websiteId} />}
        </Row>
      </Row>
      <FilterBar websiteId={websiteId} />
    </Column>
  );
}
