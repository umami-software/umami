import { useContext } from 'react';
import { useMessages } from 'components/hooks';
import {
  Dropdown,
  Form,
  FormButtons,
  FormInput,
  FormRow,
  Item,
  SubmitButton,
  TextField,
} from 'react-basics';
import { ReportContext } from '../[reportId]/Report';
import BaseParameters from '../[reportId]/BaseParameters';

export function JourneyParameters() {
  const { report, runReport, isRunning } = useContext(ReportContext);
  const { formatMessage, labels } = useMessages();

  const { id, parameters } = report || {};
  const { websiteId, dateRange, steps } = parameters || {};
  const queryDisabled = !websiteId || !dateRange || !steps;

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
      <FormRow label={formatMessage(labels.steps)}>
        <FormInput
          name="steps"
          rules={{ required: formatMessage(labels.required), pattern: /[0-9]+/, min: 3, max: 7 }}
        >
          <Dropdown items={[3, 4, 5, 6, 7]}>{item => <Item key={item}>{item}</Item>}</Dropdown>
        </FormInput>
      </FormRow>
      <FormRow label={formatMessage(labels.startStep)}>
        <FormInput name="startStep">
          <TextField autoComplete="off" />
        </FormInput>
      </FormRow>
      <FormRow label={formatMessage(labels.endStep)}>
        <FormInput name="endStep">
          <TextField autoComplete="off" />
        </FormInput>
      </FormRow>
      <FormButtons>
        <SubmitButton variant="primary" disabled={queryDisabled} isLoading={isRunning}>
          {formatMessage(labels.runQuery)}
        </SubmitButton>
      </FormButtons>
    </Form>
  );
}

export default JourneyParameters;
