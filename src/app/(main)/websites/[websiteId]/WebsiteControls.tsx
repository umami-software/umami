import { Column, Row, Grid } from '@umami/react-zen';
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
      <Grid columns={{ xs: '1fr', md: 'auto 1fr' }} gap>
        <Row alignItems="center" justifyContent="flex-start">
          {allowFilter ? <WebsiteFilterButton websiteId={websiteId} /> : <div />}
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
