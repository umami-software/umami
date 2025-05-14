'use client';
import Link from 'next/link';
import { Button, Flexbox, Icon, Icons, Text } from '@umami/react-zen';
import { useMessages, useNavigation } from '@/components/hooks';
import { ReportsDataTable } from '@/app/(main)/reports/ReportsDataTable';

export function WebsiteReportsPage({ websiteId }) {
  const { formatMessage, labels } = useMessages();
  const { renderTeamUrl } = useNavigation();

  return (
    <>
      <Flexbox alignItems="center" justifyContent="end">
        <Link href={renderTeamUrl('/reports/create')}>
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
