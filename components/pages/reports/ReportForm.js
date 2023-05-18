import useMessages from 'hooks/useMessages';
import { Form, FormButtons, FormInput, FormRow, SubmitButton, TextField } from 'react-basics';

export function FunnelForm() {
  const { formatMessage, labels } = useMessages();

  const handleSubmit = () => {};

  return (
    <>
      <Form onSubmit={handleSubmit}>
        <FormRow label={formatMessage(labels.website)}>
          <FormInput name="name" rules={{ required: formatMessage(labels.required) }}>
            <TextField />
          </FormInput>
        </FormRow>

        <FormButtons>
          <SubmitButton variant="primary" disabled={false}>
            Save
          </SubmitButton>
        </FormButtons>
      </Form>
    </>
  );
}

export default FunnelForm;
