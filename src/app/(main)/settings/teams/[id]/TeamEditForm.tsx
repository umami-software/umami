import {
  SubmitButton,
  Form,
  FormInput,
  FormRow,
  FormButtons,
  TextField,
  Button,
  Flexbox,
  useToasts,
} from 'react-basics';
import { getRandomChars } from 'next-basics';
import { useRef, useState } from 'react';
import { useApi, useMessages } from 'components/hooks';

const generateId = () => getRandomChars(16);

export function TeamEditForm({
  teamId,
  data,
  readOnly,
}: {
  teamId: string;
  data?: { name: string; accessCode: string };
  readOnly?: boolean;
}) {
  const { formatMessage, labels, messages } = useMessages();
  const { post, useMutation } = useApi();
  const { mutate, error } = useMutation({
    mutationFn: (data: any) => post(`/teams/${teamId}`, data),
  });
  const ref = useRef(null);
  const [accessCode, setAccessCode] = useState(data.accessCode);
  const { showToast } = useToasts();

  const handleSubmit = async (data: any) => {
    mutate(data, {
      onSuccess: async () => {
        ref.current.reset(data);
        showToast({ message: formatMessage(messages.saved), variant: 'success' });
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
        {!readOnly && (
          <FormInput name="name" rules={{ required: formatMessage(labels.required) }}>
            <TextField />
          </FormInput>
        )}
        {readOnly && data.name}
      </FormRow>
      <FormRow label={formatMessage(labels.accessCode)}>
        <Flexbox gap={10}>
          <TextField value={accessCode} readOnly allowCopy />
          {!readOnly && (
            <Button onClick={handleRegenerate}>{formatMessage(labels.regenerate)}</Button>
          )}
        </Flexbox>
      </FormRow>
      {!readOnly && (
        <FormButtons>
          <SubmitButton variant="primary">{formatMessage(labels.save)}</SubmitButton>
        </FormButtons>
      )}
    </Form>
  );
}

export default TeamEditForm;
