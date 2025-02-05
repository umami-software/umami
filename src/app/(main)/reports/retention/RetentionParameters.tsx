import { useContext } from 'react';
import { useMessages } from '@/components/hooks';
import { Form, FormButtons, FormRow, SubmitButton } from 'react-basics';
import { ReportContext } from '../[reportId]/Report';
import { MonthSelect } from '@/components/input/MonthSelect';
import BaseParameters from '../[reportId]/BaseParameters';
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
      <FormRow label={formatMessage(labels.date)}>
        <MonthSelect date={startDate} onChange={handleDateChange} />
      </FormRow>
      <FormButtons>
        <SubmitButton variant="primary" disabled={queryDisabled} isLoading={isRunning}>
          {formatMessage(labels.runQuery)}
        </SubmitButton>
      </FormButtons>
    </Form>
  );
}

export default RetentionParameters;
