import { Column, Row } from '@umami/react-zen';
import { WebsiteFilterButton } from '@/app/(main)/websites/[websiteId]/WebsiteFilterButton';
import { WebsiteDateFilter } from '@/components/input/WebsiteDateFilter';
import { FilterBar } from '@/components/input/FilterBar';
import { WebsiteMonthSelect } from '@/components/input/WebsiteMonthSelect';
import { ExportButton } from '@/components/input/ExportButton';

export function PixelControls({
  pixelId: websiteId,
  allowFilter = true,
  allowDateFilter = true,
  allowMonthFilter,
  allowCompare,
  allowDownload = false,
}: {
  pixelId: string;
  allowFilter?: boolean;
  allowCompare?: boolean;
  allowDateFilter?: boolean;
  allowMonthFilter?: boolean;
  allowDownload?: boolean;
}) {
  return (
    <Column gap>
      <Row alignItems="center" justifyContent="space-between" gap="3">
        {allowFilter ? <WebsiteFilterButton websiteId={websiteId} /> : <div />}
        {allowDateFilter && <WebsiteDateFilter websiteId={websiteId} allowCompare={allowCompare} />}
        {allowDownload && <ExportButton websiteId={websiteId} />}
        {allowMonthFilter && <WebsiteMonthSelect websiteId={websiteId} />}
      </Row>
      {allowFilter && <FilterBar websiteId={websiteId} />}
    </Column>
  );
}
