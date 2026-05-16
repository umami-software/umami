import { Button, Column, Heading, Row, Text } from '@umami/react-zen';
import { useState } from 'react';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { IconLabel } from '@/components/common/IconLabel';
import { useMessages, usePixelSharesQuery } from '@/components/hooks';
import { Plus } from '@/components/icons';
import { SimpleShareCreateForm } from '@/components/share/SimpleShareCreateForm';
import { SimpleSharesTable } from '@/components/share/SimpleSharesTable';

export function PixelShareForm({ pixelId }: { pixelId: string }) {
  const { data, error, isLoading } = usePixelSharesQuery({ pixelId });
  const shares = data?.data || [];
  const hasShares = shares.length > 0;

  return (
    <LoadingPanel data={data} isLoading={isLoading} error={error}>
      <PixelShareFormContent pixelId={pixelId} hasShares={hasShares} shares={shares} />
    </LoadingPanel>
  );
}

function PixelShareFormContent({
  pixelId,
  hasShares,
  shares,
}: {
  pixelId: string;
  hasShares: boolean;
  shares: any[];
}) {
  const { t, labels, messages } = useMessages();
  const [isCreating, setIsCreating] = useState(false);
  const showCreateForm = isCreating;

  return (
    <Column gap="4">
      <Row justifyContent="space-between" alignItems="center">
        <Heading>{t(labels.share)}</Heading>
        {!isCreating && (
          <Button variant="primary" onPress={() => setIsCreating(true)}>
            <IconLabel icon={<Plus size={16} />} label={t(labels.add)} />
          </Button>
        )}
      </Row>
      {showCreateForm && (
        <SimpleShareCreateForm
          createPath={`/pixels/${pixelId}/shares`}
          onSave={() => setIsCreating(false)}
          onCancel={() => setIsCreating(false)}
        />
      )}
      {hasShares && (
        <Text>{t(messages.shareUrl)}</Text>
      )}
      {!showCreateForm &&
        (hasShares ? (
          <SimpleSharesTable data={shares} />
        ) : (
          <Text color="muted">{t(messages.noDataAvailable)}</Text>
        ))}
    </Column>
  );
}
