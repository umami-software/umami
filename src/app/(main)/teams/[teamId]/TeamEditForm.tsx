import {
  Form,
  FormField,
  FormButtons,
  FormSubmitButton,
  TextField,
  Button,
  useToast,
} from '@umami/react-zen';
import { getRandomChars } from '@/lib/crypto';
import { useContext } from 'react';
import { useApi, useMessages, useModified } from '@/components/hooks';
import { TeamContext } from '@/app/(main)/teams/TeamProvider';

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
  const team = useContext(TeamContext);
  const { formatMessage, labels, messages } = useMessages();
  const { post, useMutation } = useApi();
  const { toast } = useToast();
  const { touch } = useModified();

  const { mutate, error } = useMutation({
    mutationFn: (data: any) => post(`/teams/${teamId}`, data),
  });

  const handleSubmit = async (data: any) => {
    mutate(data, {
      onSuccess: async () => {
        touch('teams');
        touch(`teams:${teamId}`);
        toast(formatMessage(messages.saved));
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
                <FormSubmitButton variant="primary">{formatMessage(labels.save)}</FormSubmitButton>
              </FormButtons>
            )}
          </>
        );
      }}
    </Form>
  );
}
