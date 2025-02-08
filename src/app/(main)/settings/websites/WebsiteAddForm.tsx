import {
  Form,
  FormRow,
  FormInput,
  FormButtons,
  TextField,
  Button,
  SubmitButton,
} from 'react-basics';
import { useApi } from '@/components/hooks';
import { DOMAIN_REGEX } from '@/lib/constants';
import { useMessages } from '@/components/hooks';

export function WebsiteAddForm({
  teamId,
  onSave,
  onClose,
}: {
  teamId?: string;
  onSave?: () => void;
  onClose?: () => void;
}) {
  const { formatMessage, labels, messages } = useMessages();
  const { post, useMutation } = useApi();
  const { mutate, error, isPending } = useMutation({
    mutationFn: (data: any) => post('/websites', { ...data, teamId }),
  });

  const handleSubmit = async (data: any) => {
    mutate(data, {
      onSuccess: async () => {
        onSave?.();
        onClose?.();
      },
    });
  };

  return (
    <Form onSubmit={handleSubmit} error={error}>
      <FormRow label={formatMessage(labels.name)}>
        <FormInput
          data-test="input-name"
          name="name"
          rules={{ required: formatMessage(labels.required) }}
        >
          <TextField autoComplete="off" />
        </FormInput>
      </FormRow>
      <FormRow label={formatMessage(labels.domain)}>
        <FormInput
          data-test="input-domain"
          name="domain"
          rules={{
            required: formatMessage(labels.required),
            pattern: { value: DOMAIN_REGEX, message: formatMessage(messages.invalidDomain) },
          }}
        >
          <TextField autoComplete="off" />
        </FormInput>
      </FormRow>
      <FormButtons flex>
        <SubmitButton data-test="button-submit" variant="primary" disabled={false}>
          {formatMessage(labels.save)}
        </SubmitButton>
        {onClose && (
          <Button disabled={isPending} onClick={onClose}>
            {formatMessage(labels.cancel)}
          </Button>
        )}
      </FormButtons>
    </Form>
  );
}

export default WebsiteAddForm;
