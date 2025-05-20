import { Column, Row } from '@umami/react-zen';
import { WebsiteFilterButton } from '@/app/(main)/websites/[websiteId]/WebsiteFilterButton';
import { WebsiteDateFilter } from '@/components/input/WebsiteDateFilter';
import { FilterBar } from '@/components/input/FilterBar';

export function WebsiteControls({
  websiteId,
  showFilter = true,
}: {
  websiteId: string;
  showFilter?: boolean;
}) {
  return (
    <Column marginBottom="6" gap="3">
      <Row alignItems="center" justifyContent="space-between" gap="3" paddingY="3">
        {showFilter && <WebsiteFilterButton websiteId={websiteId} />}
        <Row alignItems="center" gap="3">
          <WebsiteDateFilter websiteId={websiteId} />
        </Row>
      </Row>
      <FilterBar />
    </Column>
  );
}
