'use client';
import Link from 'next/link';
import { Button, Flexbox, Icon, Icons, Text } from 'react-basics';
import { useMessages } from 'components/hooks';
import WebsiteHeader from '../WebsiteHeader';
import ReportsDataTable from 'app/(main)/reports/ReportsDataTable';

export function WebsiteReportsPage({ websiteId }) {
  const { formatMessage, labels } = useMessages();

  return (
    <>
      <WebsiteHeader websiteId={websiteId} />
      <Flexbox alignItems="center" justifyContent="end">
        <Link href={`/reports/create`}>
          <Button variant="primary">
            <Icon>
              <Icons.Plus />
            </Icon>
            <Text>{formatMessage(labels.createReport)}</Text>
          </Button>
        </Link>
      </Flexbox>
      <ReportsDataTable websiteId={websiteId} />
    </>
  );
}

export default WebsiteReportsPage;
