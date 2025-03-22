import { useMessages } from '@/components/hooks';
import { useRevenueValuesQuery } from '@/components/hooks/queries/useRevenueValuesQuery';
import { useContext } from 'react';
import { Select, Form, FormButtons, FormField, ListItem, FormSubmitButton } from '@umami/react-zen';
import { BaseParameters } from '../[reportId]/BaseParameters';
import { ReportContext } from '../[reportId]/Report';

export function RevenueParameters() {
  const { report, runReport, isRunning } = useContext(ReportContext);
  const { formatMessage, labels } = useMessages();
  const { id, parameters } = report || {};
  const { websiteId, dateRange } = parameters || {};
  const queryEnabled = websiteId && dateRange;
  const { data: values = [] } = useRevenueValuesQuery(
    websiteId,
    dateRange?.startDate,
    dateRange?.endDate,
  );

  const handleSubmit = (data: any, e: any) => {
    e.stopPropagation();
    e.preventDefault();

    runReport(data);
  };

  return (
    <Form values={parameters} onSubmit={handleSubmit} preventSubmit={true}>
      <BaseParameters showDateSelect={true} allowWebsiteSelect={!id} />

      <FormField
        label={formatMessage(labels.currency)}
        name="currency"
        rules={{ required: formatMessage(labels.required) }}
      >
        <Select items={values.map(item => item.currency)}>
          {(item: any) => <ListItem key={item}>{item}</ListItem>}
        </Select>
      </FormField>
      <FormButtons>
        <FormSubmitButton variant="primary" isDisabled={!queryEnabled} isLoading={isRunning}>
          {formatMessage(labels.runQuery)}
        </FormSubmitButton>
      </FormButtons>
    </Form>
  );
}
