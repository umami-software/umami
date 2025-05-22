import { Column, Row } from '@umami/react-zen';
import { WebsiteFilterButton } from '@/app/(main)/websites/[websiteId]/WebsiteFilterButton';
import { WebsiteDateFilter } from '@/components/input/WebsiteDateFilter';
import { FilterBar } from '@/components/input/FilterBar';

export function WebsiteControls({
  websiteId,
  showFilter = true,
  showCompare,
}: {
  websiteId: string;
  showFilter?: boolean;
  showCompare?: boolean;
}) {
  return (
    <Column gap>
      <Row alignItems="center" justifyContent="space-between" gap="3">
        {showFilter && <WebsiteFilterButton websiteId={websiteId} />}
        <Row alignItems="center" gap="3">
          <WebsiteDateFilter websiteId={websiteId} showCompare={showCompare} />
        </Row>
      </Row>
      <FilterBar />
    </Column>
  );
}
