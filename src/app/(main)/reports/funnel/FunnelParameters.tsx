import { useContext } from 'react';
import { useMessages } from 'components/hooks';
import {
  Icon,
  Form,
  FormButtons,
  FormInput,
  FormRow,
  PopupTrigger,
  Popup,
  SubmitButton,
  TextField,
  Button,
} from 'react-basics';
import Icons from 'components/icons';
import FunnelStepAddForm from './FunnelStepAddForm';
import { ReportContext } from '../[reportId]/Report';
import BaseParameters from '../[reportId]/BaseParameters';
import ParameterList from '../[reportId]/ParameterList';
import PopupForm from '../[reportId]/PopupForm';
import styles from './FunnelParameters.module.css';

export function FunnelParameters() {
  const { report, runReport, updateReport, isRunning } = useContext(ReportContext);
  const { formatMessage, labels } = useMessages();

  const { id, parameters } = report || {};
  const { websiteId, dateRange, steps } = parameters || {};
  const queryDisabled = !websiteId || !dateRange || steps?.length < 2;

  const handleSubmit = (data: any, e: any) => {
    e.stopPropagation();
    e.preventDefault();

    if (!queryDisabled) {
      runReport(data);
    }
  };

  const handleAddStep = (step: { type: string; value: string }) => {
    updateReport({ parameters: { steps: parameters.steps.concat(step) } });
  };

  const handleUpdateStep = (
    close: () => void,
    index: number,
    step: { type: string; value: string },
  ) => {
    const steps = [...parameters.steps];
    steps[index] = step;
    updateReport({ parameters: { steps } });
    close();
  };

  const handleRemoveStep = (index: number) => {
    const steps = [...parameters.steps];
    delete steps[index];
    updateReport({ parameters: { steps: steps.filter(n => n) } });
  };

  const AddStepButton = () => {
    return (
      <PopupTrigger>
        <Button>
          <Icon>
            <Icons.Plus />
          </Icon>
        </Button>
        <Popup alignment="start">
          <PopupForm>
            <FunnelStepAddForm onChange={handleAddStep} />
          </PopupForm>
        </Popup>
      </PopupTrigger>
    );
  };

  return (
    <Form values={parameters} onSubmit={handleSubmit} preventSubmit={true}>
      <BaseParameters allowWebsiteSelect={!id} />
      <FormRow label={formatMessage(labels.window)}>
        <FormInput
          name="window"
          rules={{ required: formatMessage(labels.required), pattern: /[0-9]+/ }}
        >
          <TextField autoComplete="off" />
        </FormInput>
      </FormRow>
      <FormRow label={formatMessage(labels.steps)} action={<AddStepButton />}>
        <ParameterList>
          {steps.map((step: { type: string; value: string }, index: number) => {
            return (
              <PopupTrigger key={index}>
                <ParameterList.Item
                  className={styles.item}
                  icon={step.type === 'url' ? <Icons.Eye /> : <Icons.Bolt />}
                  onRemove={() => handleRemoveStep(index)}
                >
                  <div className={styles.value}>
                    <div>{step.value}</div>
                  </div>
                </ParameterList.Item>
                <Popup alignment="start">
                  {(close: () => void) => (
                    <PopupForm>
                      <FunnelStepAddForm
                        type={step.type}
                        value={step.value}
                        onChange={handleUpdateStep.bind(null, close, index)}
                      />
                    </PopupForm>
                  )}
                </Popup>
              </PopupTrigger>
            );
          })}
        </ParameterList>
      </FormRow>
      <FormButtons>
        <SubmitButton variant="primary" disabled={queryDisabled} isLoading={isRunning}>
          {formatMessage(labels.runQuery)}
        </SubmitButton>
      </FormButtons>
    </Form>
  );
}

export default FunnelParameters;
