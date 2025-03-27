import { useMessages, useReport } from '@/components/hooks';
import { Form, FormButtons, FormSubmitButton } from '@umami/react-zen';
import { BaseParameters } from '../[reportId]/BaseParameters';

export function RetentionParameters() {
  const { report, runReport, isRunning } = useReport();
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
      <BaseParameters showDateSelect={false} allowWebsiteSelect={!id} />

      <FormButtons>
        <FormSubmitButton variant="primary" isDisabled={queryDisabled} isLoading={isRunning}>
          {formatMessage(labels.runQuery)}
        </FormSubmitButton>
      </FormButtons>
    </Form>
  );
}
