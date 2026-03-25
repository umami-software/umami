import { Button, Column, Heading, Row, Text } from '@umami/react-zen';
import { useState } from 'react';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { IconLabel } from '@/components/common/IconLabel';
import { useLinkSharesQuery, useMessages } from '@/components/hooks';
import { Plus } from '@/components/icons';
import { SimpleShareCreateForm } from '@/components/share/SimpleShareCreateForm';
import { SimpleSharesTable } from '@/components/share/SimpleSharesTable';

export function LinkShareForm({ linkId }: { linkId: string }) {
  const { data, error, isLoading } = useLinkSharesQuery({ linkId });
  const shares = data?.data || [];
  const hasShares = shares.length > 0;

  return (
    <LoadingPanel data={data} isLoading={isLoading} error={error}>
      <LinkShareFormContent linkId={linkId} hasShares={hasShares} shares={shares} />
    </LoadingPanel>
  );
}

function LinkShareFormContent({
  linkId,
  hasShares,
  shares,
}: {
  linkId: string;
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
          createPath={`/links/${linkId}/shares`}
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
