import {
  Form,
  FormField,
  FormButtons,
  FormSubmitButton,
  TextField,
  Button,
} from '@umami/react-zen';
import { getRandomChars } from '@/lib/crypto';
import { useMessages, useTeam, useUpdateQuery } from '@/components/hooks';

const generateId = () => `team_${getRandomChars(16)}`;

export function TeamEditForm({
  teamId,
  allowEdit,
  onSave,
}: {
  teamId: string;
  allowEdit?: boolean;
  onSave?: () => void;
}) {
  const team = useTeam();
  const { formatMessage, labels, messages } = useMessages();

  const { mutate, error, isPending, touch, toast } = useUpdateQuery(`/teams/${teamId}`);

  const handleSubmit = async (data: any) => {
    mutate(data, {
      onSuccess: async () => {
        toast(formatMessage(messages.saved));
        touch('teams');
        touch(`teams:${teamId}`);
        onSave?.();
      },
    });
  };

  return (
    <Form onSubmit={handleSubmit} error={error} defaultValues={{ ...team }}>
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
            <FormField name="accessCode" label={formatMessage(labels.accessCode)}>
              <TextField isReadOnly allowCopy />
            </FormField>
            {allowEdit && (
              <FormButtons justifyContent="space-between">
                <Button onPress={() => setValue('accessCode', generateId(), { shouldDirty: true })}>
                  {formatMessage(labels.regenerate)}
                </Button>
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
