import useApi from 'components/hooks/useApi';
import useMessages from 'components/hooks/useMessages';
import { Icon, Icons, LoadingButton, Text } from 'react-basics';
import { setValue } from 'store/cache';

export function TeamMemberRemoveButton({ teamId, userId, disabled, onSave }) {
  const { formatMessage, labels } = useMessages();
  const { del, useMutation } = useApi();
  const { mutate, isLoading } = useMutation(() => del(`/teams/${teamId}/users/${userId}`));

  const handleRemoveTeamMember = () => {
    mutate(
      {},
      {
        onSuccess: () => {
          setValue('team:members', Date.now());
          onSave?.();
        },
      },
    );
  };

  return (
    <LoadingButton
      onClick={() => handleRemoveTeamMember()}
      disabled={disabled}
      isLoading={isLoading}
    >
      <Icon>
        <Icons.Close />
      </Icon>
      <Text>{formatMessage(labels.remove)}</Text>
    </LoadingButton>
  );
}

export default TeamMemberRemoveButton;
