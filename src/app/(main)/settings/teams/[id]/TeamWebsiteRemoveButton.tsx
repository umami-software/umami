import { useApi, useMessages } from 'components/hooks';
import { Icon, Icons, LoadingButton, Text } from 'react-basics';

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
        <Icons.Close />
      </Icon>
      <Text>{formatMessage(labels.remove)}</Text>
    </LoadingButton>
  );
}

export default TeamWebsiteRemoveButton;
