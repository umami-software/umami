import { useMessages } from 'hooks';
import {
  Button,
  Icon,
  Form,
  FormButtons,
  FormInput,
  FormRow,
  ModalTrigger,
  Modal,
  SubmitButton,
  Text,
  TextField,
  Tooltip,
} from 'react-basics';
import Icons from 'components/icons';
import { updateReport } from 'store/reports';
import { useRef, useState } from 'react';
import styles from './FunnelParameters.module.css';

export function FunnelParameters({ report }) {
  const { formatMessage, labels } = useMessages();
  const ref = useRef(null);
  const { id, websiteId, parameters, isLoading } = report || {};
  const queryDisabled = !websiteId || parameters?.urls?.length < 2;

  const handleSubmit = values => {
    updateReport(id, { parameters: values, isLoading: false, update: Date.now() });
  };

  const handleAdd = url => {
    updateReport(id, { parameters: { ...parameters, urls: parameters.urls.concat(url) } });
  };

  const handleRemove = index => {
    const urls = [...parameters.urls];
    urls.splice(index, 1);
    updateReport(id, { parameters: { ...parameters, urls } });
  };

  return (
    <>
      <Form ref={ref} values={parameters} onSubmit={handleSubmit}>
        <FormRow label={formatMessage(labels.window)}>
          <FormInput
            name="window"
            rules={{ required: formatMessage(labels.required), pattern: /[0-9]+/ }}
          >
            <TextField autoComplete="off" />
          </FormInput>
        </FormRow>
        <FormRow label={formatMessage(labels.urls)} action={<AddURLButton onAdd={handleAdd} />}>
          <div className={styles.urls}>
            {parameters?.urls.map((url, index) => {
              return (
                <div key={index} className={styles.url}>
                  <Text>{url}</Text>
                  <Icon onClick={() => handleRemove(index)}>
                    <Icons.Close />
                  </Icon>
                </div>
              );
            })}
          </div>
        </FormRow>
        <FormButtons>
          <SubmitButton variant="primary" disabled={queryDisabled} loading={isLoading}>
            {formatMessage(labels.query)}
          </SubmitButton>
        </FormButtons>
      </Form>
    </>
  );
}

function AddURLButton({ onAdd }) {
  const [url, setUrl] = useState('');
  const { formatMessage, labels } = useMessages();

  const handleAdd = close => {
    onAdd?.(url);
    setUrl('');
    close();
  };

  const handleChange = e => {
    setUrl(e.target.value);
  };
  const handleClose = close => {
    setUrl('');
    close();
  };

  return (
    <Tooltip label={formatMessage(labels.addUrl)}>
      <ModalTrigger>
        <Icon>
          <Icons.Plus />
        </Icon>
        <Modal>
          {close => {
            return (
              <Form>
                <FormRow label={formatMessage(labels.url)}>
                  <TextField name="url" value={url} onChange={handleChange} autoComplete="off" />
                </FormRow>
                <FormButtons align="center" flex>
                  <Button variant="primary" onClick={() => handleAdd(close)}>
                    {formatMessage(labels.add)}
                  </Button>
                  <Button onClick={() => handleClose(close)}>{formatMessage(labels.cancel)}</Button>
                </FormButtons>
              </Form>
            );
          }}
        </Modal>
      </ModalTrigger>
    </Tooltip>
  );
}

export default FunnelParameters;
