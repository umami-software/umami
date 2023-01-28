import {
  SubmitButton,
  Form,
  FormInput,
  FormRow,
  FormButtons,
  TextField,
  Button,
  Flexbox,
} from 'react-basics';
import { useIntl } from 'react-intl';
import { getRandomChars } from 'next-basics';
import { useRef, useState } from 'react';
import useApi from 'hooks/useApi';
import { labels } from 'components/messages';

const generateId = () => getRandomChars(16);

export default function TeamEditForm({ teamId, data, onSave }) {
  const { formatMessage } = useIntl();
  const { post, useMutation } = useApi();
  const { mutate, error } = useMutation(data => post(`/teams/${teamId}`, data));
  const ref = useRef(null);
  const [accessCode, setAccessCode] = useState(data.accessCode);

  const handleSubmit = async data => {
    mutate(data, {
      onSuccess: async () => {
        ref.current.reset(data);
        onSave(data);
      },
    });
  };

  const handleRegenerate = () => {
    const code = generateId();
    ref.current.setValue('accessCode', code, {
      shouldValidate: true,
      shouldDirty: true,
    });
    setAccessCode(code);
  };

  return (
    <Form ref={ref} onSubmit={handleSubmit} error={error} values={data}>
      <FormRow label={formatMessage(labels.teamId)}>
        <TextField value={teamId} readOnly allowCopy />
      </FormRow>
      <FormRow label={formatMessage(labels.name)}>
        <FormInput name="name" rules={{ required: formatMessage(labels.required) }}>
          <TextField />
        </FormInput>
      </FormRow>
      <FormRow label={formatMessage(labels.accessCode)}>
        <Flexbox gap={10}>
          <TextField value={accessCode} readOnly allowCopy />
          <Button onClick={handleRegenerate}>{formatMessage(labels.regenerate)}</Button>
        </Flexbox>
      </FormRow>
      <FormButtons>
        <SubmitButton variant="primary">{formatMessage(labels.save)}</SubmitButton>
      </FormButtons>
    </Form>
  );
}
