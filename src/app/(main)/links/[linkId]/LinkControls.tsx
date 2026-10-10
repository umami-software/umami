import { Column, Row } from '@umami/react-zen';
import { useShare } from '@/components/hooks';
import { ExportButton } from '@/components/input/ExportButton';
import { FilterBar } from '@/components/input/FilterBar';
import { MonthFilter } from '@/components/input/MonthFilter';
import { WebsiteDateFilter } from '@/components/input/WebsiteDateFilter';
import { WebsiteFilterButton } from '@/components/input/WebsiteFilterButton';
import { allowShareFilter } from '@/lib/share';

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
  const share = useShare();
  const showFilter = allowFilter && allowShareFilter(share?.parameters);

  return (
    <Column gap>
      <Row alignItems="center" justifyContent="space-between" gap="3">
        {showFilter ? <WebsiteFilterButton websiteId={websiteId} /> : <div />}
        {allowDateFilter && <WebsiteDateFilter websiteId={websiteId} showAllTime={false} />}
        {allowDownload && <ExportButton websiteId={websiteId} />}
        {allowMonthFilter && <MonthFilter />}
      </Row>
      {showFilter && <FilterBar websiteId={websiteId} />}
    </Column>
  );
}
