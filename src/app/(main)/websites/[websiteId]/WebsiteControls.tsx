import { Column, Row } from '@umami/react-zen';
import { WebsiteFilterButton } from '@/components/input/WebsiteFilterButton';
import { WebsiteDateFilter } from '@/components/input/WebsiteDateFilter';
import { FilterBar } from '@/components/input/FilterBar';
import { MonthFilter } from '@/components/input/MonthFilter';
import { ExportButton } from '@/components/input/ExportButton';

export function WebsiteControls({
  websiteId,
  allowFilter = true,
  allowDateFilter = true,
  allowMonthFilter,
  allowDownload = false,
  allowCompare = false,
}: {
  websiteId: string;
  allowFilter?: boolean;
  allowDateFilter?: boolean;
  allowMonthFilter?: boolean;
  allowDownload?: boolean;
  allowCompare?: boolean;
}) {
  return (
    <Column gap>
      <Row alignItems="center" justifyContent="space-between" gap="3">
        {allowFilter ? <WebsiteFilterButton websiteId={websiteId} /> : <div />}
        {allowDateFilter && <WebsiteDateFilter websiteId={websiteId} allowCompare={allowCompare} />}
        {allowDownload && <ExportButton websiteId={websiteId} />}
        {allowMonthFilter && <MonthFilter />}
      </Row>
      {allowFilter && <FilterBar websiteId={websiteId} />}
    </Column>
  );
}
