import { useContext } from 'react';
import { useMessages } from '@/components/hooks';
import {
  Select,
  Form,
  FormButtons,
  FormField,
  ListItem,
  FormSubmitButton,
  TextField,
} from '@umami/react-zen';
import { ReportContext } from '../[reportId]/Report';
import { BaseParameters } from '../[reportId]/BaseParameters';

export function JourneyParameters() {
  const { report, runReport, isRunning } = useContext(ReportContext);
  const { formatMessage, labels } = useMessages();

  const { id, parameters } = report || {};
  const { websiteId, dateRange, steps } = parameters || {};
  const queryDisabled = !websiteId || !dateRange || !steps;

  const handleSubmit = (data: any, e: any) => {
    e.stopPropagation();
    e.preventDefault();

    if (!queryDisabled) {
      runReport(data);
    }
  };

  return (
    <Form values={parameters} onSubmit={handleSubmit} preventSubmit={true}>
      <BaseParameters showDateSelect={true} allowWebsiteSelect={!id} />
      <FormField
        label={formatMessage(labels.steps)}
        name="steps"
        rules={{ required: formatMessage(labels.required), pattern: /[0-9]+/, min: 3, max: 7 }}
      >
        <Select items={[3, 4, 5, 6, 7]}>
          {(item: any) => (
            <ListItem key={item.toString()} id={item.toString()}>
              {item}
            </ListItem>
          )}
        </Select>
      </FormField>
      <FormField label={formatMessage(labels.startStep)} name="startStep">
        <TextField autoComplete="off" />
      </FormField>
      <FormField label={formatMessage(labels.endStep)} name="endStep">
        <TextField autoComplete="off" />
      </FormField>
      <FormButtons>
        <FormSubmitButton variant="primary" isDisabled={queryDisabled} isLoading={isRunning}>
          {formatMessage(labels.runQuery)}
        </FormSubmitButton>
      </FormButtons>
    </Form>
  );
}
