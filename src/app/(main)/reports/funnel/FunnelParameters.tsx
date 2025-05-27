import { useMessages, useReport } from '@/components/hooks';
import {
  Icon,
  Form,
  FormButtons,
  FormField,
  DialogTrigger,
  Popover,
  FormSubmitButton,
  TextField,
  Button,
} from '@umami/react-zen';
import { Eye, Bolt, Plus } from '@/components/icons';
import { FunnelStepAddForm } from './FunnelStepAddForm';
import { BaseParameters } from '../[reportId]/BaseParameters';
import { ParameterList } from '../[reportId]/ParameterList';
import styles from './FunnelParameters.module.css';

export function FunnelParameters() {
  const { report, runReport, updateReport, isRunning } = useReport();
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
      <DialogTrigger>
        <Button>
          <Icon>
            <Plus />
          </Icon>
        </Button>
        <Popover placement="start">
          <FunnelStepAddForm onChange={handleAddStep} />
        </Popover>
      </DialogTrigger>
    );
  };

  return (
    <Form values={parameters} onSubmit={handleSubmit} preventSubmit={true}>
      <BaseParameters allowWebsiteSelect={!id} />
      <FormField
        label={formatMessage(labels.window)}
        name="window"
        rules={{ required: formatMessage(labels.required), pattern: /[0-9]+/ }}
      >
        <TextField autoComplete="off" />
      </FormField>
      <FormField name="steps" label={formatMessage(labels.steps)}>
        <ParameterList>
          {steps.map((step: { type: string; value: string }, index: number) => {
            return (
              <DialogTrigger key={index}>
                <ParameterList.Item
                  icon={step.type === 'url' ? <Eye /> : <Bolt />}
                  onRemove={() => handleRemoveStep(index)}
                >
                  <div className={styles.value}>
                    <div>{step.value}</div>
                  </div>
                </ParameterList.Item>
                <Popover placement="start">
                  {({ close }: any) => (
                    <FunnelStepAddForm
                      type={step.type}
                      value={step.value}
                      onChange={handleUpdateStep.bind(null, close, index)}
                    />
                  )}
                </Popover>
              </DialogTrigger>
            );
          })}
        </ParameterList>
        <AddStepButton />
      </FormField>
      <FormButtons>
        <FormSubmitButton variant="primary" isDisabled={queryDisabled} isLoading={isRunning}>
          {formatMessage(labels.runQuery)}
        </FormSubmitButton>
      </FormButtons>
    </Form>
  );
}
