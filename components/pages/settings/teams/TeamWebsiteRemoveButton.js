import useApi from 'hooks/useApi';
import useMessages from 'hooks/useMessages';
import { Icon, Icons, LoadingButton, Text } from 'react-basics';

export function TeamWebsiteRemoveButton({ teamId, websiteId, onSave }) {
  const { formatMessage, labels } = useMessages();
  const { del, useMutation } = useApi();
  const { mutate, isLoading } = useMutation(() => del(`/teams/${teamId}/websites/${websiteId}`));

  const handleRemoveTeamMember = () => {
    mutate(
      {},
      {
        onSuccess: () => {
          onSave();
        },
      },
    );
  };

  return (
    <LoadingButton onClick={() => handleRemoveTeamMember()} loading={isLoading}>
      <Icon>
        <Icons.Close />
      </Icon>
      <Text>{formatMessage(labels.remove)}</Text>
    </LoadingButton>
  );
}

export default TeamWebsiteRemoveButton;
