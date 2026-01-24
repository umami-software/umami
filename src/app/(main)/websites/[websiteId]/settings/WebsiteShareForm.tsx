import { Column, Heading, Row, Text } from '@umami/react-zen';
import { Plus } from 'lucide-react';
import { useMessages, useWebsiteSharesQuery } from '@/components/hooks';
import { DialogButton } from '@/components/input/DialogButton';
import { ShareEditForm } from './ShareEditForm';
import { SharesTable } from './SharesTable';

export interface WebsiteShareFormProps {
  websiteId: string;
}

export function WebsiteShareForm({ websiteId }: WebsiteShareFormProps) {
  const { formatMessage, labels, messages } = useMessages();
  const { data, isLoading } = useWebsiteSharesQuery({ websiteId });

  const shares = data?.data || [];
  const hasShares = shares.length > 0;

  return (
    <Column gap="4">
      <Row justifyContent="space-between" alignItems="center">
        <Heading>{formatMessage(labels.share)}</Heading>
        <DialogButton
          icon={<Plus size={16} />}
          label={formatMessage(labels.add)}
          title={formatMessage(labels.share)}
          variant="primary"
          width="600px"
        >
          {({ close }) => <ShareEditForm websiteId={websiteId} onClose={close} />}
        </DialogButton>
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
