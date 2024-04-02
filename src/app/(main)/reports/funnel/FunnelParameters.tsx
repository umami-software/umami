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
import { ReportContext } from '../[reportId]/Report';
import BaseParameters from '../[reportId]/BaseParameters';
import ParameterList from '../[reportId]/ParameterList';
import PopupForm from '../[reportId]/PopupForm';

export function FunnelParameters() {
  const { report, runReport, updateReport, isRunning } = useContext(ReportContext);
  const { formatMessage, labels } = useMessages();

  const { id, parameters } = report || {};
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

  const handleRemoveUrl = (url: string) => {
    const urls = [...parameters.urls];
    updateReport({ parameters: { urls: urls.filter(n => n !== url) } });
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
      <BaseParameters allowWebsiteSelect={!id} />
      <FormRow label={formatMessage(labels.window)}>
        <FormInput
          name="window"
          rules={{ required: formatMessage(labels.required), pattern: /[0-9]+/ }}
        >
          <TextField autoComplete="off" />
        </FormInput>
      </FormRow>
      <FormRow label={formatMessage(labels.urls)} action={<AddUrlButton />}>
        <ParameterList>
          {urls.map(url => {
            return (
              <ParameterList.Item key={url} onRemove={() => handleRemoveUrl(url)}>
                {url}
              </ParameterList.Item>
            );
          })}
        </ParameterList>
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
