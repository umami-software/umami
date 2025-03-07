import { useContext } from 'react';
import { useMessages } from '@/components/hooks';
import { Form, FormButtons, FormSubmitButton } from '@umami/react-zen';
import { ReportContext } from '../[reportId]/Report';
import { BaseParameters } from '../[reportId]/BaseParameters';
import { parseDateRange } from '@/lib/date';

export function RetentionParameters() {
  const { report, runReport, isRunning, updateReport } = useContext(ReportContext);
  const { formatMessage, labels } = useMessages();

  const { id, parameters } = report || {};
  const { websiteId, dateRange } = parameters || {};
  const { startDate } = dateRange || {};
  const queryDisabled = !websiteId || !dateRange;

  const handleSubmit = (data: any, e: any) => {
    e.stopPropagation();
    e.preventDefault();

    if (!queryDisabled) {
      runReport(data);
    }
  };

  const handleDateChange = value => {
    updateReport({ parameters: { dateRange: { ...parseDateRange(value) } } });
  };

  return (
    <Form values={parameters} onSubmit={handleSubmit} preventSubmit={true}>
      <BaseParameters showDateSelect={false} allowWebsiteSelect={!id} />

      <FormButtons>
        <FormSubmitButton variant="primary" disabled={queryDisabled} isLoading={isRunning}>
          {formatMessage(labels.runQuery)}
        </FormSubmitButton>
      </FormButtons>
    </Form>
  );
}
