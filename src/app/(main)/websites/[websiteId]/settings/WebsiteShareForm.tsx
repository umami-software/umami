import { Button, Column, Heading, Row, Text } from '@umami/react-zen';
import { Plus } from 'lucide-react';
import { useApi, useMessages, useModified, useWebsiteSharesQuery } from '@/components/hooks';
import { SharesTable } from './SharesTable';

export interface WebsiteShareFormProps {
  websiteId: string;
}

export function WebsiteShareForm({ websiteId }: WebsiteShareFormProps) {
  const { formatMessage, labels, messages } = useMessages();
  const { data, isLoading } = useWebsiteSharesQuery({ websiteId });
  const { post } = useApi();
  const { touch } = useModified();

  const handleCreate = async () => {
    await post(`/websites/${websiteId}/shares`, { parameters: {} });
    touch('shares');
  };

  const shares = data?.data || [];
  const hasShares = shares.length > 0;

  return (
    <Column gap="4">
      <Row justifyContent="space-between" alignItems="center">
        <Heading>{formatMessage(labels.share)}</Heading>
        <Button variant="primary" onPress={handleCreate}>
          <Plus size={16} />
          <Text>{formatMessage(labels.add)}</Text>
        </Button>
      </Row>
      {hasShares ? (
        <>
          <Text>{formatMessage(messages.shareUrl)}</Text>
          <SharesTable data={shares} />
        </>
      ) : (
        <Text color="muted">{formatMessage(messages.noDataAvailable)}</Text>
      )}
    </Column>
  );
}
