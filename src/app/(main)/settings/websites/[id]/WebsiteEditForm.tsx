import { SubmitButton, Form, FormInput, FormRow, FormButtons, TextField } from 'react-basics';
import { useContext, useRef } from 'react';
import useApi from 'components/hooks/useApi';
import { DOMAIN_REGEX } from 'lib/constants';
import useMessages from 'components/hooks/useMessages';
import SettingsContext from '../../SettingsContext';

export function WebsiteEditForm({
  websiteId,
  data,
  onSave,
}: {
  websiteId: string;
  data: any[];
  onSave?: (data: any) => void;
}) {
  const { formatMessage, labels, messages } = useMessages();
  const { websitesUrl } = useContext(SettingsContext);
  const { post, useMutation } = useApi();
  const { mutate, error } = useMutation({
    mutationFn: (data: any) => post(`${websitesUrl}/${websiteId}`, data),
  });
  const ref = useRef(null);

  const handleSubmit = async (data: any) => {
    mutate(data, {
      onSuccess: async () => {
        ref.current.reset(data);
        onSave(data);
      },
    });
  };

  return (
    <Form ref={ref} onSubmit={handleSubmit} error={error} values={data}>
      <FormRow label={formatMessage(labels.websiteId)}>
        <TextField value={websiteId} readOnly allowCopy />
      </FormRow>
      <FormRow label={formatMessage(labels.name)}>
        <FormInput name="name" rules={{ required: formatMessage(labels.required) }}>
          <TextField />
        </FormInput>
      </FormRow>
      <FormRow label={formatMessage(labels.domain)}>
        <FormInput
          name="domain"
          rules={{
            required: formatMessage(labels.required),
            pattern: {
              value: DOMAIN_REGEX,
              message: formatMessage(messages.invalidDomain),
            },
          }}
        >
          <TextField />
        </FormInput>
      </FormRow>
      <FormButtons>
        <SubmitButton variant="primary">{formatMessage(labels.save)}</SubmitButton>
      </FormButtons>
    </Form>
  );
}

export default WebsiteEditForm;
