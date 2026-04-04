import {
  Button,
  Form,
  FormButtons,
  FormField,
  FormSubmitButton,
  Row,
  TextField,
} from '@umami/react-zen';
import { IconLabel } from '@/components/common/IconLabel';
import { useMessages, useTeam, useUpdateQuery } from '@/components/hooks';
import { RefreshCw } from '@/components/icons';
import { getRandomChars } from '@/lib/generate';

const generateId = () => `team_${getRandomChars(16)}`;

export function TeamEditForm({
  teamId,
  allowEdit,
  showAccessCode,
  onSave,
}: {
  teamId: string;
  allowEdit?: boolean;
  showAccessCode?: boolean;
  onSave?: () => void;
}) {
  const team = useTeam();
  const { t, labels, messages, getErrorMessage } = useMessages();

  const { mutateAsync, error, isPending, touch, toast } = useUpdateQuery(`/teams/${teamId}`);

  const handleSubmit = async (data: any) => {
    await mutateAsync(data, {
      onSuccess: async () => {
        toast(t(messages.saved));
        touch('teams');
        touch(`teams:${teamId}`);
        onSave?.();
      },
    });
  };

  return (
    <Form onSubmit={handleSubmit} error={getErrorMessage(error)} defaultValues={{ ...team }}>
      {({ setValue }) => {
        return (
          <>
            <FormField name="id" label={t(labels.teamId)}>
              <TextField isReadOnly allowCopy />
            </FormField>
            <FormField name="name" label={t(labels.name)} rules={{ required: t(labels.required) }}>
              <TextField isReadOnly={!allowEdit} />
            </FormField>
            {showAccessCode && (
              <Row alignItems="flex-end" gap>
                <FormField name="accessCode" label={t(labels.accessCode)} style={{ flex: 1 }}>
                  <TextField isReadOnly allowCopy />
                </FormField>
                {allowEdit && (
                  <Button
                    onPress={() => setValue('accessCode', generateId(), { shouldDirty: true })}
                  >
                    <IconLabel icon={<RefreshCw />} label={t(labels.regenerate)} />
                  </Button>
                )}
              </Row>
            )}
            {allowEdit && (
              <FormButtons justifyContent="flex-end">
                <FormSubmitButton variant="primary" isPending={isPending}>
                  {t(labels.save)}
                </FormSubmitButton>
              </FormButtons>
            )}
          </>
        );
      }}
    </Form>
  );
}
