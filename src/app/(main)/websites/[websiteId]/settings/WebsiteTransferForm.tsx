import {
  Button,
  Form,
  FormButtons,
  FormField,
  FormSubmitButton,
  ListItem,
  Loading,
  Select,
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
  const { t, labels, messages, getErrorMessage } = useMessages();
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

  const handleSubmit = async (data: { teamId?: string }) => {
    await mutateAsync(
      {
        userId: website.teamId ? user.id : undefined,
        teamId: website.userId ? data.teamId : undefined,
      },
      {
        onSuccess: async () => {
          onSave?.();
          onClose?.();
        },
      },
    );
  };

  if (isLoading) {
    return <Loading icon="dots" placement="center" />;
  }

  return (
    <Form onSubmit={handleSubmit} error={getErrorMessage(error)} defaultValues={{ teamId: '' }}>
      {({ watch }) => {
        const selectedTeamId = watch('teamId');

        return (
          <>
            <Text>
              {t(
                isTeamWebsite
                  ? messages.transferTeamWebsiteToUser
                  : messages.transferUserWebsiteToTeam,
              )}
            </Text>
            <FormField name="teamId">
              {!isTeamWebsite && (
                <Select>
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
              <Button onPress={onClose}>{t(labels.cancel)}</Button>
              <FormSubmitButton
                variant="primary"
                isLoading={isPending}
                isDisabled={!isTeamWebsite && !selectedTeamId}
              >
                {t(labels.transfer)}
              </FormSubmitButton>
            </FormButtons>
          </>
        );
      }}
    </Form>
  );
}
