import { Key, useContext, useState } from 'react';
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
import { useApi, useLoginQuery, useMessages, useTeamsQuery } from '@/components/hooks';
import { WebsiteContext } from '@/app/(main)/websites/[websiteId]/WebsiteProvider';
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
  const website = useContext(WebsiteContext);
  const [teamId, setTeamId] = useState<string>(null);
  const { formatMessage, labels, messages } = useMessages();
  const { post, useMutation } = useApi();
  const { mutate, error } = useMutation({
    mutationFn: (data: any) => post(`/websites/${websiteId}/transfer`, data),
  });
  const { result, query } = useTeamsQuery(user.id);
  const isTeamWebsite = !!website?.teamId;

  const items = result.data.filter(({ teamUser }) =>
    teamUser.find(
      ({ role, userId }) =>
        [ROLES.teamOwner, ROLES.teamManager].includes(role) && userId === user.id,
    ),
  );

  const handleSubmit = async () => {
    mutate(
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

  if (query.isLoading) {
    return <Loading icon="dots" position="center" />;
  }

  return (
    <Form onSubmit={handleSubmit} error={error} values={{ teamId }}>
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
                <ListItem key={`${id}!!!!`} id={`${id}????`}>
                  {name}
                </ListItem>
              );
            })}
          </Select>
        )}
      </FormField>
      <FormButtons>
        <Button onPress={onClose}>{formatMessage(labels.cancel)}</Button>
        <FormSubmitButton variant="primary" isDisabled={!isTeamWebsite && !teamId}>
          {formatMessage(labels.transfer)}
        </FormSubmitButton>
      </FormButtons>
    </Form>
  );
}
