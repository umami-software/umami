import { Column, Grid, Row } from '@umami/react-zen';
import { useShare } from '@/components/hooks';
import { ExportButton } from '@/components/input/ExportButton';
import { FilterBar } from '@/components/input/FilterBar';
import { MonthFilter } from '@/components/input/MonthFilter';
import { WebsiteDateFilter } from '@/components/input/WebsiteDateFilter';
import { WebsiteFilterButton } from '@/components/input/WebsiteFilterButton';
import { allowShareFilter } from '@/lib/share';

export function WebsiteControls({
  websiteId,
  allowFilter = true,
  allowBounceFilter = false,
  allowDateFilter = true,
  allowMonthFilter,
  allowDownload = false,
  allowCompare = false,
}: {
  websiteId?: string;
  allowFilter?: boolean;
  allowBounceFilter?: boolean;
  allowDateFilter?: boolean;
  allowMonthFilter?: boolean;
  allowDownload?: boolean;
  allowCompare?: boolean;
}) {
  const share = useShare();
  const showFilter = allowFilter && allowShareFilter(share?.parameters);

  return (
    <Column gap>
      <Grid columns={{ base: '1fr', md: 'auto 1fr' }} gap>
        <Row alignItems="center" justifyContent="flex-start" gap="4">
          {showFilter && (
            <WebsiteFilterButton websiteId={websiteId} allowBounceFilter={allowBounceFilter} />
          )}
        </Row>
        <Row alignItems="center" justifyContent={{ base: 'flex-start', md: 'flex-end' }}>
          {allowDateFilter && (
            <WebsiteDateFilter websiteId={websiteId} allowCompare={allowCompare} />
          )}
          {allowDownload && <ExportButton websiteId={websiteId} />}
          {allowMonthFilter && <MonthFilter />}
        </Row>
      </Grid>
      {showFilter && <FilterBar websiteId={websiteId} />}
    </Column>
  );
}
