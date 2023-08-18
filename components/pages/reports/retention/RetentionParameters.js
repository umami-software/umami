import { useContext, useRef } from 'react';
import { useMessages } from 'hooks';
import { Form, FormButtons, FormRow, SubmitButton } from 'react-basics';
import { ReportContext } from 'components/pages/reports/Report';
import { MonthSelect } from 'components/input/MonthSelect';
import BaseParameters from '../BaseParameters';
import { parseDateRange } from 'lib/date';

export function RetentionParameters() {
  const { report, runReport, isRunning, updateReport } = useContext(ReportContext);
  const { formatMessage, labels } = useMessages();
  const ref = useRef(null);

  const { parameters } = report || {};
  const { websiteId, dateRange } = parameters || {};
  const { startDate } = dateRange || {};
  const queryDisabled = !websiteId || !dateRange;

  const handleSubmit = (data, e) => {
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
    <Form ref={ref} values={parameters} onSubmit={handleSubmit} preventSubmit={true}>
      <BaseParameters showDateSelect={false} />
      <FormRow label={formatMessage(labels.date)}>
        <MonthSelect date={startDate} onChange={handleDateChange} />
      </FormRow>
      <FormButtons>
        <SubmitButton variant="primary" disabled={queryDisabled} loading={isRunning}>
          {formatMessage(labels.runQuery)}
        </SubmitButton>
      </FormButtons>
    </Form>
  );
}

export default RetentionParameters;
