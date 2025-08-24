import { useDeleteQuery, useMessages } from '@/components/hooks';
import { Icon, LoadingButton, Text } from '@umami/react-zen';
import { Close } from '@/components/icons';

export function TeamWebsiteRemoveButton({ teamId, websiteId, onSave }) {
  const { formatMessage, labels } = useMessages();
  const { mutate, isPending } = useDeleteQuery(`/teams/${teamId}/websites/${websiteId}`);

  const handleRemoveTeamMember = async () => {
    mutate(null, {
      onSuccess: () => {
        onSave();
      },
    });
  };

  return (
    <LoadingButton variant="quiet" onClick={() => handleRemoveTeamMember()} isLoading={isPending}>
      <Icon>
        <Close />
      </Icon>
      <Text>{formatMessage(labels.remove)}</Text>
    </LoadingButton>
  );
}
