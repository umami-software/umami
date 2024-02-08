import { useApi, useMessages, useModified } from 'components/hooks';
import { Icon, Icons, LoadingButton, Text } from 'react-basics';

export function TeamMemberRemoveButton({
  teamId,
  userId,
  disabled,
  onSave,
}: {
  teamId: string;
  userId: string;
  disabled?: boolean;
  onSave?: () => void;
}) {
  const { formatMessage, labels } = useMessages();
  const { del, useMutation } = useApi();
  const { mutate, isPending } = useMutation({
    mutationFn: () => del(`/teams/${teamId}/users/${userId}`),
  });
  const { touch } = useModified();

  const handleRemoveTeamMember = () => {
    mutate(null, {
      onSuccess: () => {
        touch('teams:members');
        onSave?.();
      },
    });
  };

  return (
    <LoadingButton
      onClick={() => handleRemoveTeamMember()}
      disabled={disabled}
      isLoading={isPending}
    >
      <Icon>
        <Icons.Close />
      </Icon>
      <Text>{formatMessage(labels.remove)}</Text>
    </LoadingButton>
  );
}

export default TeamMemberRemoveButton;
