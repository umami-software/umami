import { Column, Grid, Row } from '@umami/react-zen';
import { BounceFilter } from '@/components/input/BounceFilter';
import { ExportButton } from '@/components/input/ExportButton';
import { FilterBar } from '@/components/input/FilterBar';
import { MonthFilter } from '@/components/input/MonthFilter';
import { WebsiteDateFilter } from '@/components/input/WebsiteDateFilter';
import { WebsiteFilterButton } from '@/components/input/WebsiteFilterButton';

export function WebsiteControls({
  websiteId,
  allowFilter = true,
  allowBounceFilter = false,
  allowDateFilter = true,
  allowMonthFilter,
  allowDownload = false,
  allowCompare = false,
}: {
  websiteId: string;
  allowFilter?: boolean;
  allowBounceFilter?: boolean;
  allowDateFilter?: boolean;
  allowMonthFilter?: boolean;
  allowDownload?: boolean;
  allowCompare?: boolean;
}) {
  return (
    <Column gap>
      <Grid columns={{ xs: '1fr', md: 'auto 1fr' }} gap>
        <Row alignItems="center" justifyContent="flex-start" gap="4">
          {allowFilter && <WebsiteFilterButton websiteId={websiteId} />}
          {allowBounceFilter && <BounceFilter />}
        </Row>
        <Row alignItems="center" justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
          {allowDateFilter && (
            <WebsiteDateFilter websiteId={websiteId} allowCompare={allowCompare} />
          )}
          {allowDownload && <ExportButton websiteId={websiteId} />}
          {allowMonthFilter && <MonthFilter />}
        </Row>
      </Grid>
      {allowFilter && <FilterBar websiteId={websiteId} />}
    </Column>
  );
}
