import { Button, Column, Heading, Row, Text } from '@umami/react-zen';
import { useState } from 'react';
import { Plus } from '@/components/icons';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { IconLabel } from '@/components/common/IconLabel';
import { useBoardSharesQuery, useMessages } from '@/components/hooks';
import { BoardShareCreateForm } from './BoardShareCreateForm';
import { BoardSharesTable } from './BoardSharesTable';

export function BoardShareDialog({ boardId }: { boardId: string }) {
  const { data, error, isLoading } = useBoardSharesQuery({ boardId });
  const shares = data?.data || [];
  const hasShares = shares.length > 0;

  return (
    <LoadingPanel data={data} isLoading={isLoading} error={error}>
      <BoardShareDialogContent boardId={boardId} hasShares={hasShares} shares={shares} />
    </LoadingPanel>
  );
}

function BoardShareDialogContent({
  boardId,
  hasShares,
  shares,
}: {
  boardId: string;
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
        <BoardShareCreateForm
          boardId={boardId}
          onSave={() => setIsCreating(false)}
          onCancel={() => setIsCreating(false)}
        />
      )}
      {hasShares && (
        <Text>{t(messages.shareUrl)}</Text>
      )}
      {!showCreateForm &&
        (hasShares ? (
          <BoardSharesTable data={shares} />
        ) : (
          <Text color="muted">{t(messages.noDataAvailable)}</Text>
        ))}
    </Column>
  );
}
