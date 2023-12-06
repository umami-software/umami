import {
  Form,
  FormRow,
  FormInput,
  FormButtons,
  TextField,
  Button,
  SubmitButton,
} from 'react-basics';
import useApi from 'components/hooks/useApi';
import { DOMAIN_REGEX } from 'lib/constants';
import useMessages from 'components/hooks/useMessages';
import { useContext } from 'react';
import SettingsContext from '../SettingsContext';

export function WebsiteAddForm({ onSave, onClose }: { onSave?: () => void; onClose?: () => void }) {
  const { formatMessage, labels, messages } = useMessages();
  const { websitesUrl } = useContext(SettingsContext);
  const { post, useMutation } = useApi();
  const { mutate, error, isPending } = useMutation({
    mutationFn: (data: any) => post(websitesUrl, data),
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
        <FormInput name="name" rules={{ required: formatMessage(labels.required) }}>
          <TextField autoComplete="off" />
        </FormInput>
      </FormRow>
      <FormRow label={formatMessage(labels.domain)}>
        <FormInput
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
        <SubmitButton variant="primary" disabled={false}>
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
