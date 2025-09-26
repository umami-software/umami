import {
  Form,
  FormField,
  FormButtons,
  FormSubmitButton,
  TextField,
  Button,
  IconLabel,
  Row,
} from '@umami/react-zen';
import { getRandomChars } from '@/lib/generate';
import { useMessages, useTeam, useUpdateQuery } from '@/components/hooks';
import { RefreshCw } from '@/components/icons';

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
  const { formatMessage, labels, messages, getErrorMessage } = useMessages();

  const { mutateAsync, error, isPending, touch, toast } = useUpdateQuery(`/teams/${teamId}`);

  const handleSubmit = async (data: any) => {
    await mutateAsync(data, {
      onSuccess: async () => {
        toast(formatMessage(messages.saved));
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
            <FormField name="id" label={formatMessage(labels.teamId)}>
              <TextField isReadOnly allowCopy />
            </FormField>
            <FormField
              name="name"
              label={formatMessage(labels.name)}
              rules={{ required: formatMessage(labels.required) }}
            >
              <TextField isReadOnly={!allowEdit} />
            </FormField>
            {showAccessCode && (
              <Row alignItems="flex-end" gap>
                <FormField
                  name="accessCode"
                  label={formatMessage(labels.accessCode)}
                  style={{ flex: 1 }}
                >
                  <TextField isReadOnly allowCopy />
                </FormField>
                {allowEdit && (
                  <Button
                    onPress={() => setValue('accessCode', generateId(), { shouldDirty: true })}
                  >
                    <IconLabel icon={<RefreshCw />} label={formatMessage(labels.regenerate)} />
                  </Button>
                )}
              </Row>
            )}
            {allowEdit && (
              <FormButtons justifyContent="flex-end">
                <FormSubmitButton variant="primary" isPending={isPending}>
                  {formatMessage(labels.save)}
                </FormSubmitButton>
              </FormButtons>
            )}
          </>
        );
      }}
    </Form>
  );
}
