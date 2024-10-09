import { useMessages } from 'components/hooks';
import useRevenueValues from 'components/hooks/queries/useRevenueValues';
import { useContext } from 'react';
import { Dropdown, Form, FormButtons, FormInput, FormRow, Item, SubmitButton } from 'react-basics';
import BaseParameters from '../[reportId]/BaseParameters';
import { ReportContext } from '../[reportId]/Report';

export function RevenueParameters() {
  const { report, runReport, isRunning } = useContext(ReportContext);
  const { formatMessage, labels } = useMessages();
  const { id, parameters } = report || {};
  const { websiteId, dateRange } = parameters || {};
  const queryEnabled = websiteId && dateRange;
  const { data: values = [] } = useRevenueValues(
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
      <FormRow label={formatMessage(labels.currency)}>
        <FormInput name="currency" rules={{ required: formatMessage(labels.required) }}>
          <Dropdown items={values.map(item => item.currency)}>
            {item => <Item key={item}>{item}</Item>}
          </Dropdown>
        </FormInput>
      </FormRow>
      <FormButtons>
        <SubmitButton variant="primary" disabled={!queryEnabled} isLoading={isRunning}>
          {formatMessage(labels.runQuery)}
        </SubmitButton>
      </FormButtons>
    </Form>
  );
}

export default RevenueParameters;
