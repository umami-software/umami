import { useContext, useRef, useState } from 'react';
import { useMessages } from 'hooks';
import {
  Icon,
  Form,
  FormButtons,
  FormInput,
  FormRow,
  Modal,
  SubmitButton,
  Text,
  TextField,
  Tooltip,
} from 'react-basics';
import Icons from 'components/icons';
import AddUrlForm from './AddUrlForm';
import { ReportContext } from 'components/pages/reports/Report';
import styles from './FunnelParameters.module.css';

export function FunnelParameters() {
  const { report, runReport, updateReport, isRunning } = useContext(ReportContext);
  const { formatMessage, labels } = useMessages();
  const [show, setShow] = useState(false);
  const ref = useRef(null);
  const { websiteId, parameters } = report || {};
  const queryDisabled = !websiteId || parameters?.urls?.length < 2;

  const handleSubmit = values => {
    runReport(values);
  };

  const handleAddUrl = url => {
    updateReport({ parameters: { ...parameters, urls: parameters.urls.concat(url) } });
  };

  const handleRemoveUrl = (index, e) => {
    e.stopPropagation();
    const urls = [...parameters.urls];
    urls.splice(index, 1);
    updateReport({ parameters: { ...parameters, urls } });
  };

  const showAddForm = () => setShow(true);
  const hideAddForm = () => setShow(false);

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
        <FormRow label={formatMessage(labels.urls)} action={<AddUrlButton onClick={showAddForm} />}>
          <div className={styles.urls}>
            {parameters?.urls?.map((url, index) => {
              return (
                <div key={index} className={styles.url}>
                  <Text>{url}</Text>
                  <Tooltip
                    className={styles.icon}
                    label={formatMessage(labels.remove)}
                    position="right"
                  >
                    <Icon onClick={handleRemoveUrl.bind(null, index)}>
                      <Icons.Close />
                    </Icon>
                  </Tooltip>
                </div>
              );
            })}
          </div>
        </FormRow>
        <FormButtons>
          <SubmitButton variant="primary" disabled={queryDisabled} loading={isRunning}>
            {formatMessage(labels.runQuery)}
          </SubmitButton>
        </FormButtons>
      </Form>
      {show && (
        <Modal onClose={hideAddForm}>
          <AddUrlForm onSave={handleAddUrl} onClose={hideAddForm} />
        </Modal>
      )}
    </>
  );
}

function AddUrlButton({ onClick }) {
  const { formatMessage, labels } = useMessages();

  return (
    <Tooltip label={formatMessage(labels.addUrl)}>
      <Icon onClick={onClick}>
        <Icons.Plus />
      </Icon>
    </Tooltip>
  );
}

export default FunnelParameters;
