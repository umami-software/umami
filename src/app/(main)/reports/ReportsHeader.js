'use client';
import PageHeader from 'components/layout/PageHeader';
import Link from 'next/link';
import { Button, Icon, Icons, Text } from 'react-basics';
import { useMessages } from 'components/hooks';

export function ReportsHeader() {
  const { formatMessage, labels } = useMessages();

  return (
    <PageHeader title={formatMessage(labels.reports)}>
      <Link href="/reports/create">
        <Button variant="primary">
          <Icon>
            <Icons.Plus />
          </Icon>
          <Text>{formatMessage(labels.createReport)}</Text>
        </Button>
      </Link>
    </PageHeader>
  );
}

export default ReportsHeader;
