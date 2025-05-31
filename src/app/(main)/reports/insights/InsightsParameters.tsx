import { useMessages, useReport } from '@/components/hooks';
import { Form, FormButtons, FormSubmitButton } from '@umami/react-zen';
import { BaseParameters } from '../[reportId]/BaseParameters';
import { FieldParameters } from '../[reportId]/FieldParameters';
import { FilterParameters } from '../[reportId]/FilterParameters';

export function InsightsParameters() {
  const { report, runReport, isRunning } = useReport();
  const { formatMessage, labels } = useMessages();
  const { id, parameters } = report || {};
  const { websiteId, dateRange, fields, filters } = parameters || {};
  const { startDate, endDate } = dateRange || {};
  const parametersSelected = websiteId && startDate && endDate;
  const queryEnabled = websiteId && dateRange && (fields?.length || filters?.length);

  const handleSubmit = (values: any) => {
    runReport(values);
  };

  return (
    <Form values={parameters} onSubmit={handleSubmit}>
      <BaseParameters allowWebsiteSelect={!id} />
      {parametersSelected && <FieldParameters />}
      {parametersSelected && <FilterParameters />}
      <FormButtons>
        <FormSubmitButton variant="primary" isDisabled={!queryEnabled} isLoading={isRunning}>
          {formatMessage(labels.runQuery)}
        </FormSubmitButton>
      </FormButtons>
    </Form>
  );
}
