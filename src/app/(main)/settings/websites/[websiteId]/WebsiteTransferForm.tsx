import { Key, useContext, useState } from 'react';
import {
  Button,
  Form,
  FormButtons,
  FormRow,
  LoadingButton,
  Loading,
  Dropdown,
  Item,
  Flexbox,
} from 'react-basics';
import { useApi, useLogin, useMessages, useTeams } from 'components/hooks';
import { WebsiteContext } from 'app/(main)/websites/[websiteId]/WebsiteProvider';
import { ROLES } from 'lib/constants';

export function WebsiteTransferForm({
  websiteId,
  onSave,
  onClose,
}: {
  websiteId: string;
  onSave?: () => void;
  onClose?: () => void;
}) {
  const { user } = useLogin();
  const website = useContext(WebsiteContext);
  const [teamId, setTeamId] = useState<string>(null);
  const { formatMessage, labels, messages } = useMessages();
  const { post, useMutation } = useApi();
  const { mutate, isPending, error } = useMutation({
    mutationFn: (data: any) => post(`/websites/${websiteId}/transfer`, data),
  });
  const { result, query } = useTeams(user.id);
  const isTeamWebsite = !!website?.teamId;

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

  const renderValue = (teamId: string) => result?.data?.find(({ id }) => id === teamId)?.name;

  if (query.isLoading) {
    return <Loading icon="dots" position="center" />;
  }

  return (
    <Form error={error}>
      <FormRow>
        <Flexbox direction="column" gap={20}>
          {formatMessage(
            isTeamWebsite ? messages.transferTeamWebsiteToUser : messages.transferUserWebsiteToTeam,
          )}
          {!isTeamWebsite && (
            <Dropdown onChange={handleChange} value={teamId} renderValue={renderValue}>
              {result.data
                .filter(({ teamUser }) =>
                  teamUser.find(
                    ({ role, userId }) => [ ROLES.teamOwner, ROLES.teamManager ].includes(role) && userId === user.id,
                  ),
                )
                .map(({ id, name }) => {
                  return <Item key={id}>{name}</Item>;
                })}
            </Dropdown>
          )}
        </Flexbox>
      </FormRow>
      <FormButtons flex>
        <LoadingButton
          variant="primary"
          isLoading={isPending}
          disabled={!isTeamWebsite && !teamId}
          onClick={handleSubmit}
        >
          {formatMessage(labels.transfer)}
        </LoadingButton>
        <Button onClick={onClose}>{formatMessage(labels.cancel)}</Button>
      </FormButtons>
    </Form>
  );
}

export default WebsiteTransferForm;
