import { useApi, useMessages } from '@/components/hooks';
import { Icon, LoadingButton, Text } from '@umami/react-zen';
import { Close } from '@/components/icons';

export function TeamWebsiteRemoveButton({ teamId, websiteId, onSave }) {
  const { formatMessage, labels } = useMessages();
  const { del, useMutation } = useApi();
  const { mutate, isPending } = useMutation({
    mutationFn: () => del(`/teams/${teamId}/websites/${websiteId}`),
  });

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
