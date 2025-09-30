import { Key, useState } from 'react';
import {
  Button,
  Form,
  FormButtons,
  FormField,
  FormSubmitButton,
  Loading,
  Select,
  ListItem,
  Text,
} from '@umami/react-zen';
import {
  useLoginQuery,
  useMessages,
  useUpdateQuery,
  useUserTeamsQuery,
  useWebsite,
} from '@/components/hooks';
import { ROLES } from '@/lib/constants';

export function WebsiteTransferForm({
  websiteId,
  onSave,
  onClose,
}: {
  websiteId: string;
  onSave?: () => void;
  onClose?: () => void;
}) {
  const { user } = useLoginQuery();
  const website = useWebsite();
  const [teamId, setTeamId] = useState<string>(null);
  const { formatMessage, labels, messages, getErrorMessage } = useMessages();
  const { mutateAsync, error, isPending } = useUpdateQuery(`/websites/${websiteId}/transfer`);
  const { data: teams, isLoading } = useUserTeamsQuery(user.id);
  const isTeamWebsite = !!website?.teamId;

  const items =
    teams?.data?.filter(({ members }) =>
      members.some(
        ({ role, userId }) =>
          [ROLES.teamOwner, ROLES.teamManager].includes(role) && userId === user.id,
      ),
    ) || [];

  const handleSubmit = async () => {
    await mutateAsync(
      {
        userId: website.teamId ? user.id : undefined,
        teamId: website.userId ? teamId : undefined,
      },
      {
        onSuccess: async () => {
          onSave?.();
          onClose?.();
        },
      },
    );
  };

  const handleChange = (key: Key) => {
    setTeamId(key as string);
  };

  if (isLoading) {
    return <Loading icon="dots" placement="center" />;
  }

  return (
    <Form onSubmit={handleSubmit} error={getErrorMessage(error)} values={{ teamId }}>
      <Text>
        {formatMessage(
          isTeamWebsite ? messages.transferTeamWebsiteToUser : messages.transferUserWebsiteToTeam,
        )}
      </Text>
      <FormField name="teamId">
        {!isTeamWebsite && (
          <Select onSelectionChange={handleChange} selectedKey={teamId}>
            {items.map(({ id, name }) => {
              return (
                <ListItem key={`${id}`} id={`${id}`}>
                  {name}
                </ListItem>
              );
            })}
          </Select>
        )}
      </FormField>
      <FormButtons>
        <Button onPress={onClose}>{formatMessage(labels.cancel)}</Button>
        <FormSubmitButton
          variant="primary"
          isPending={isPending}
          isDisabled={!isTeamWebsite && !teamId}
        >
          {formatMessage(labels.transfer)}
        </FormSubmitButton>
      </FormButtons>
    </Form>
  );
}
