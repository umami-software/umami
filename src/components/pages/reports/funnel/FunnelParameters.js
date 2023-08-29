import { useContext, useRef } from 'react';
import { useMessages } from 'components/hooks';
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
import UrlAddForm from './UrlAddForm';
import { ReportContext } from 'components/pages/reports/Report';
import BaseParameters from '../BaseParameters';
import ParameterList from '../ParameterList';
import PopupForm from '../PopupForm';

export function FunnelParameters() {
  const { report, runReport, updateReport, isRunning } = useContext(ReportContext);
  const { formatMessage, labels } = useMessages();
  const ref = useRef(null);

  const { parameters } = report || {};
  const { websiteId, dateRange, urls } = parameters || {};
  const queryDisabled = !websiteId || !dateRange || urls?.length < 2;

  const handleSubmit = (data, e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!queryDisabled) {
      runReport(data);
    }
  };

  const handleAddUrl = url => {
    updateReport({ parameters: { urls: parameters.urls.concat(url) } });
  };

  const handleRemoveUrl = (index, e) => {
    e.stopPropagation();
    const urls = [...parameters.urls];
    urls.splice(index, 1);
    updateReport({ parameters: { urls } });
  };

  const AddUrlButton = () => {
    return (
      <PopupTrigger>
        <Icon>
          <Icons.Plus />
        </Icon>
        <Popup position="bottom" alignment="start">
          {(close, element) => {
            return (
              <PopupForm element={element} onClose={close}>
                <UrlAddForm onAdd={handleAddUrl} />
              </PopupForm>
            );
          }}
        </Popup>
      </PopupTrigger>
    );
  };

  return (
    <Form ref={ref} values={parameters} onSubmit={handleSubmit} preventSubmit={true}>
      <BaseParameters />
      <FormRow label={formatMessage(labels.window)}>
        <FormInput
          name="window"
          rules={{ required: formatMessage(labels.required), pattern: /[0-9]+/ }}
        >
          <TextField autoComplete="off" />
        </FormInput>
      </FormRow>
      <FormRow label={formatMessage(labels.urls)} action={<AddUrlButton />}>
        <ParameterList items={urls} onRemove={handleRemoveUrl} />
      </FormRow>
      <FormButtons>
        <SubmitButton variant="primary" disabled={queryDisabled} loading={isRunning}>
          {formatMessage(labels.runQuery)}
        </SubmitButton>
      </FormButtons>
    </Form>
  );
}

export default FunnelParameters;
