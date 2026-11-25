import {
  Button,
  DialogFooter,
  Form,
  FormField,
  FormSubmitButton,
  Loading,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
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
              {({ field }) =>
                !isTeamWebsite && (
                  <Select
                    items={items.map(({ id, name }) => ({ value: `${id}`, label: name }))}
                    value={field.value || null}
                    onValueChange={value => field.onChange(value ?? '')}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent alignItemWithTrigger={false}>
                      <SelectGroup>
                        {items.map(({ id, name }) => {
                          return (
                            <SelectItem key={`${id}`} value={`${id}`}>
                              {name}
                            </SelectItem>
                          );
                        })}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )
              }
            </FormField>
            <DialogFooter>
              <Button variant="secondary" onClick={onClose}>
                {t(labels.cancel)}
              </Button>
              <FormSubmitButton loading={isPending} disabled={!isTeamWebsite && !selectedTeamId}>
                {t(labels.transfer)}
              </FormSubmitButton>
            </DialogFooter>
          </>
        );
      }}
    </Form>
  );
}
