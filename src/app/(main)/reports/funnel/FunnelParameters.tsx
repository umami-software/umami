import { useContext } from 'react';
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
import { ReportContext } from '../[id]/Report';
import BaseParameters from '../[id]/BaseParameters';
import ParameterList from '../[id]/ParameterList';
import PopupForm from '../[id]/PopupForm';

export function FunnelParameters() {
  const { report, runReport, updateReport, isRunning } = useContext(ReportContext);
  const { formatMessage, labels } = useMessages();

  const { parameters } = report || {};
  const { websiteId, dateRange, urls } = parameters || {};
  const queryDisabled = !websiteId || !dateRange || urls?.length < 2;

  const handleSubmit = (data: any, e: any) => {
    e.stopPropagation();
    e.preventDefault();
    if (!queryDisabled) {
      runReport(data);
    }
  };

  const handleAddUrl = (url: string) => {
    updateReport({ parameters: { urls: parameters.urls.concat(url) } });
  };

  const handleRemoveUrl = (index: number, e: any) => {
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
        <Popup position="right" alignment="start">
          <PopupForm>
            <UrlAddForm onAdd={handleAddUrl} />
          </PopupForm>
        </Popup>
      </PopupTrigger>
    );
  };

  return (
    <Form values={parameters} onSubmit={handleSubmit} preventSubmit={true}>
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
        <ParameterList
          items={urls}
          onRemove={(index: number, e: any) => handleRemoveUrl(index, e)}
        />
      </FormRow>
      <FormButtons>
        <SubmitButton variant="primary" disabled={queryDisabled} isLoading={isRunning}>
          {formatMessage(labels.runQuery)}
        </SubmitButton>
      </FormButtons>
    </Form>
  );
}

export default FunnelParameters;
