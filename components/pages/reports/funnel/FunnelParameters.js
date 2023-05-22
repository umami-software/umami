import { useMessages } from 'hooks';
import {
  Icon,
  Form,
  FormButtons,
  FormInput,
  FormRow,
  PopupTrigger,
  Popup,
  SubmitButton,
  TextField,
} from 'react-basics';
import Icons from 'components/icons';
import { updateReport } from 'store/reports';
import { useRef } from 'react';
import styles from './FunnelParameters.module.css';

export function FunnelParameters({ report }) {
  const { formatMessage, labels } = useMessages();
  const ref = useRef(null);
  const { id, websiteId, parameters, isLoading } = report || {};

  const handleSubmit = values => {
    console.log({ values });
    updateReport(id, { parameters: values, isLoading: false });
  };

  console.log('PARAMETERS', parameters);

  return (
    <>
      <Form ref={ref} values={parameters} onSubmit={handleSubmit}>
        <FormRow label="Window (minutes)">
          <FormInput
            name="window"
            rules={{ required: formatMessage(labels.required), pattern: /[0-9]+/ }}
          >
            <TextField autoComplete="off" />
          </FormInput>
        </FormRow>
        <FormRow label={formatMessage(labels.urls)} action={<AddURLButton />}>
          hi
        </FormRow>
        <FormButtons>
          <SubmitButton variant="primary" disabled={!websiteId} loading={isLoading}>
            {formatMessage(labels.query)}
          </SubmitButton>
        </FormButtons>
      </Form>
    </>
  );
}

function AddURLButton() {
  return (
    <PopupTrigger>
      <Icon>
        <Icons.Plus />
      </Icon>
      <Popup className={styles.popup} position="right" alignment="start">
        HALLO
      </Popup>
    </PopupTrigger>
  );
}

export default FunnelParameters;
