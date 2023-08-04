import { useContext, useRef } from 'react';
import { useMessages } from 'hooks';
import { Form, FormButtons, FormInput, FormRow, SubmitButton, TextField } from 'react-basics';
import { ReportContext } from 'components/pages/reports/Report';
import BaseParameters from '../BaseParameters';

export function RetentionParameters() {
  const { report, runReport, isRunning } = useContext(ReportContext);
  const { formatMessage, labels } = useMessages();
  const ref = useRef(null);

  const { parameters } = report || {};
  const { websiteId, dateRange } = parameters || {};
  const queryDisabled = !websiteId || !dateRange;

  const handleSubmit = (data, e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!queryDisabled) {
      runReport(data);
    }
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
      <FormButtons>
        <SubmitButton variant="primary" disabled={queryDisabled} loading={isRunning}>
          {formatMessage(labels.runQuery)}
        </SubmitButton>
      </FormButtons>
    </Form>
  );
}

export default RetentionParameters;
