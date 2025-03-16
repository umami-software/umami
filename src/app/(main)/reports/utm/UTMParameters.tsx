import { useContext } from 'react';
import { useMessages } from '@/components/hooks';
import { Form, FormButtons, FormSubmitButton } from '@umami/react-zen';
import { ReportContext } from '../[reportId]/Report';
import { BaseParameters } from '../[reportId]/BaseParameters';

export function UTMParameters() {
  const { report, runReport, isRunning } = useContext(ReportContext);
  const { formatMessage, labels } = useMessages();

  const { id, parameters } = report || {};
  const { websiteId, dateRange } = parameters || {};
  const queryDisabled = !websiteId || !dateRange;

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
      <FormButtons>
        <FormSubmitButton variant="primary" isDisabled={queryDisabled} isLoading={isRunning}>
          {formatMessage(labels.runQuery)}
        </FormSubmitButton>
      </FormButtons>
    </Form>
  );
}
