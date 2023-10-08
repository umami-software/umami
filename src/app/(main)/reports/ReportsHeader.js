'use client';
import PageHeader from 'components/layout/PageHeader';
import { Button, Icon, Icons, Text } from 'react-basics';
import { useMessages } from 'components/hooks';
import { useRouter } from 'next/navigation';

export function ReportsHeader() {
  const { formatMessage, labels } = useMessages();
  const router = useRouter();

  const handleClick = () => router.push('/reports/create');

  return (
    <PageHeader title={formatMessage(labels.reports)}>
      <Button variant="primary" onClick={handleClick}>
        <Icon>
          <Icons.Plus />
        </Icon>
        <Text>{formatMessage(labels.createReport)}</Text>
      </Button>
    </PageHeader>
  );
}

export default ReportsHeader;
