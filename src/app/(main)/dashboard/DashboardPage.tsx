'use client';
import { Column, Row } from '@umami/react-zen';
import { Empty } from '@/components/common/Empty';
import { GridRow } from '@/components/common/GridRow';
import { PageBody } from '@/components/common/PageBody';
import { PageHeader } from '@/components/common/PageHeader';
import {
  useDateRange,
  useLoginQuery,
  useMessages,
  useNavigation,
  useUserWebsitesQuery,
} from '@/components/hooks';
import { DateFilter } from '@/components/input/DateFilter';
import { WebsiteCard } from './WebsiteCard';

export function DashboardPage() {
  const { formatMessage, labels } = useMessages();
  const { user } = useLoginQuery();
  const { data, isLoading } = useUserWebsitesQuery({ userId: user?.id });
  const websites = data?.data || [];
  const { dateRange } = useDateRange();
  const { router, updateParams } = useNavigation();

  const handleDateChange = (date: string) => {
    router.push(updateParams({ date, offset: undefined }));
  };

  const dateValue = dateRange.value;

  return (
    <PageBody>
      <Column gap="6" margin="2">
        <PageHeader title={formatMessage(labels.dashboard)}>
          <Row minWidth="200px">
            <DateFilter value={dateValue} onChange={handleDateChange} showAllTime={false} />
          </Row>
        </PageHeader>
        {!isLoading && !websites.length ? (
          <Empty />
        ) : (
          <GridRow layout="three">
            {websites.map((website: any) => (
              <WebsiteCard key={website.id} website={website} />
            ))}
          </GridRow>
        )}
      </Column>
    </PageBody>
  );
}
