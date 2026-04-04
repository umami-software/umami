import { Column, Heading, Row, Text } from '@umami/react-zen';
import { Plus } from 'lucide-react';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { useMessages, useWebsiteSharesQuery } from '@/components/hooks';
import { DialogButton } from '@/components/input/DialogButton';
import { ShareEditForm } from './ShareEditForm';
import { SharesTable } from './SharesTable';

export interface WebsiteShareFormProps {
  websiteId: string;
}

export function WebsiteShareForm({ websiteId }: WebsiteShareFormProps) {
  const { t, labels, messages } = useMessages();
  const { data, error, isLoading } = useWebsiteSharesQuery({ websiteId });

  const shares = data?.data || [];
  const hasShares = shares.length > 0;

  return (
    <LoadingPanel data={data} isLoading={isLoading} error={error}>
      <Column gap="4">
        <Row justifyContent="space-between" alignItems="center">
          <Heading>{t(labels.share)}</Heading>
          <DialogButton
            icon={<Plus size={16} />}
            label={t(labels.add)}
            title={t(labels.share)}
            variant="primary"
            width="600px"
          >
            {({ close }) => <ShareEditForm websiteId={websiteId} onClose={close} />}
          </DialogButton>
        </Row>
        {hasShares ? (
          <>
            <Text>{t(messages.shareUrl)}</Text>

            <SharesTable data={shares} />
          </>
        ) : (
          <Text color="muted">{t(messages.noDataAvailable)}</Text>
        )}
      </Column>
    </LoadingPanel>
  );
}
