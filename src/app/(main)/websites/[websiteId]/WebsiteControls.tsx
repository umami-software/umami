import { Column, Row } from '@umami/react-zen';
import { WebsiteFilterButton } from '@/app/(main)/websites/[websiteId]/WebsiteFilterButton';
import { WebsiteDateFilter } from '@/components/input/WebsiteDateFilter';
import { FilterBar } from '@/components/input/FilterBar';

export function WebsiteControls({
  websiteId,
  allowFilter = true,
  allowCompare,
}: {
  websiteId: string;
  allowFilter?: boolean;
  allowCompare?: boolean;
}) {
  return (
    <Column gap>
      <Row alignItems="center" justifyContent="space-between" gap="3">
        {allowFilter && <WebsiteFilterButton websiteId={websiteId} />}
        <Row alignItems="center" gap="3">
          <WebsiteDateFilter websiteId={websiteId} allowCompare={allowCompare} />
        </Row>
      </Row>
      <FilterBar />
    </Column>
  );
}
