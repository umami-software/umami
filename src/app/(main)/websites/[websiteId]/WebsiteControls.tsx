import { Column, Row } from '@umami/react-zen';
import { WebsiteFilterButton } from '@/app/(main)/websites/[websiteId]/WebsiteFilterButton';
import { WebsiteDateFilter } from '@/components/input/WebsiteDateFilter';
import { FilterBar } from '@/components/input/FilterBar';
import { WebsiteMonthSelect } from '@/components/input/WebsiteMonthSelect';

export function WebsiteControls({
  websiteId,
  allowFilter = true,
  allowDateFilter = true,
  allowMonthFilter,
  allowCompare,
}: {
  websiteId: string;
  allowFilter?: boolean;
  allowCompare?: boolean;
  allowDateFilter?: boolean;
  allowMonthFilter?: boolean;
}) {
  return (
    <Column gap>
      <Row alignItems="center" justifyContent="space-between" gap="3">
        {allowFilter && <WebsiteFilterButton websiteId={websiteId} />}
        {allowDateFilter && <WebsiteDateFilter websiteId={websiteId} allowCompare={allowCompare} />}
        {allowMonthFilter && <WebsiteMonthSelect websiteId={websiteId} />}
      </Row>
      <FilterBar />
    </Column>
  );
}
