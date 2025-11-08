import { Column, Row } from '@umami/react-zen';
import { WebsiteFilterButton } from '@/components/input/WebsiteFilterButton';
import { WebsiteDateFilter } from '@/components/input/WebsiteDateFilter';
import { FilterBar } from '@/components/input/FilterBar';
import { MonthFilter } from '@/components/input/MonthFilter';
import { ExportButton } from '@/components/input/ExportButton';

export function LinkControls({
  linkId: websiteId,
  allowFilter = true,
  allowDateFilter = true,
  allowMonthFilter,
  allowDownload = false,
}: {
  linkId: string;
  allowFilter?: boolean;
  allowDateFilter?: boolean;
  allowMonthFilter?: boolean;
  allowDownload?: boolean;
}) {
  return (
    <Column gap>
      <Row alignItems="center" justifyContent="space-between" gap="3">
        {allowFilter ? <WebsiteFilterButton websiteId={websiteId} /> : <div />}
        {allowDateFilter && <WebsiteDateFilter websiteId={websiteId} showAllTime={false} />}
        {allowDownload && <ExportButton websiteId={websiteId} />}
        {allowMonthFilter && <MonthFilter />}
      </Row>
      {allowFilter && <FilterBar websiteId={websiteId} />}
    </Column>
  );
}
