import { useMessages } from '@/components/hooks';
import { useContext } from 'react';
import { Form, FormButtons, SubmitButton } from 'react-basics';
import BaseParameters from '../[reportId]/BaseParameters';
import { ReportContext } from '../[reportId]/Report';
import FieldParameters from '../[reportId]/FieldParameters';
import FilterParameters from '../[reportId]/FilterParameters';

export function InsightsParameters() {
  const { report, runReport, isRunning } = useContext(ReportContext);
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
        <SubmitButton variant="primary" disabled={!queryEnabled} isLoading={isRunning}>
          {formatMessage(labels.runQuery)}
        </SubmitButton>
      </FormButtons>
    </Form>
  );
}

export default InsightsParameters;
