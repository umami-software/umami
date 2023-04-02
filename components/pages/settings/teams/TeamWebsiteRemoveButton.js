import useApi from 'hooks/useApi';
import useMessages from 'hooks/useMessages';
import { Icon, Icons, LoadingButton, Text } from 'react-basics';

export default function TeamWebsiteRemoveButton({ teamWebsiteId, onSave }) {
  const { formatMessage, labels } = useMessages();
  const { del, useMutation } = useApi();
  const { mutate, isLoading } = useMutation(() => del(`/teamWebsites/${teamWebsiteId}`));

  const handleRemoveTeamMember = () => {
    mutate(
      { teamWebsiteId },
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
