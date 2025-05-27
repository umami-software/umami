import { useMessages } from '@/components/hooks';
import { Eye, Bolt, Plus } from '@/components/icons';
import { useContext, useState } from 'react';
import {
  Button,
  Select,
  Form,
  FormButtons,
  FormField,
  Icon,
  ListItem,
  Popover,
  DialogTrigger,
  Toggle,
  FormSubmitButton,
} from '@umami/react-zen';
import { BaseParameters } from '../[reportId]/BaseParameters';
import { ParameterList } from '../[reportId]/ParameterList';
import { ReportContext } from '../[reportId]/Report';
import { FunnelStepAddForm } from '../funnel/FunnelStepAddForm';
import { AttributionStepAddForm } from './AttributionStepAddForm';
import { useRevenueValuesQuery } from '@/components/hooks/queries/useRevenueValuesQuery';

export function AttributionParameters() {
  const { report, runReport, updateReport, isRunning } = useContext(ReportContext);
  const { formatMessage, labels } = useMessages();
  const { id, parameters } = report || {};
  const { websiteId, dateRange, steps } = parameters || {};
  const queryEnabled = websiteId && dateRange && steps.length > 0;
  const [model, setModel] = useState('');
  const [revenueMode, setRevenueMode] = useState(false);

  const { data: currencyValues = [] } = useRevenueValuesQuery(
    websiteId,
    dateRange?.startDate,
    dateRange?.endDate,
  );

  const handleSubmit = (data: any, e: any) => {
    if (revenueMode === false) {
      delete data.currency;
    }

    e.stopPropagation();
    e.preventDefault();
    runReport(data);
  };

  const handleCheck = () => {
    setRevenueMode(!revenueMode);
  };

  const handleAddStep = (step: { type: string; value: string }) => {
    if (step.type === 'url') {
      setRevenueMode(false);
    }
    updateReport({ parameters: { steps: parameters.steps.concat(step) } });
  };

  const handleUpdateStep = (
    close: () => void,
    index: number,
    step: { type: string; value: string },
  ) => {
    if (step.type === 'url') {
      setRevenueMode(false);
    }
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
        <Button isDisabled={steps.length > 0}>
          <Icon>
            <Plus />
          </Icon>
        </Button>
        <Popover placement="right top">
          <FunnelStepAddForm onChange={handleAddStep} />
        </Popover>
      </DialogTrigger>
    );
  };

  const items = [
    { id: 'first-click', label: 'First-Click', value: 'firstClick' },
    { id: 'last-click', label: 'Last-Click', value: 'lastClick' },
  ];

  const onModelChange = (value: any) => {
    setModel(value);
    updateReport({ parameters: { model } });
  };

  return (
    <Form values={parameters} onSubmit={handleSubmit} preventSubmit={true}>
      <BaseParameters showDateSelect={true} allowWebsiteSelect={!id} />
      <FormField
        name="model"
        rules={{ required: formatMessage(labels.required) }}
        label={formatMessage(labels.model)}
      >
        <Select items={items} value={model} onChange={onModelChange}>
          {({ value, label }: any) => {
            return <ListItem key={value}>{label}</ListItem>;
          }}
        </Select>
      </FormField>
      <FormField name="step" label={formatMessage(labels.conversionStep)}>
        <ParameterList>
          {steps.map((step: { type: string; value: string }, index: number) => {
            return (
              <DialogTrigger key={index}>
                <ParameterList.Item
                  icon={step.type === 'url' ? <Eye /> : <Bolt />}
                  onRemove={() => handleRemoveStep(index)}
                >
                  <div>{step.value}</div>
                </ParameterList.Item>
                <Popover placement="right top">
                  <AttributionStepAddForm
                    type={step.type}
                    value={step.value}
                    onChange={handleUpdateStep.bind(null, close, index)}
                  />
                </Popover>
              </DialogTrigger>
            );
          })}
        </ParameterList>
        <AddStepButton />
      </FormField>

      <Toggle
        isSelected={revenueMode}
        onClick={handleCheck}
        isDisabled={currencyValues.length === 0 || steps[0]?.type === 'url'}
      >
        <b>Revenue Mode</b>
      </Toggle>

      {revenueMode && (
        <FormField
          name="currency"
          rules={{ required: formatMessage(labels.required) }}
          label={formatMessage(labels.currency)}
        >
          <Select items={currencyValues.map(item => ({ id: item.currency, value: item.currency }))}>
            {({ id, value }: any) => (
              <ListItem key={id} id={id}>
                {value}
              </ListItem>
            )}
          </Select>
        </FormField>
      )}
      <FormButtons>
        <FormSubmitButton variant="primary" isDisabled={!queryEnabled} isLoading={isRunning}>
          {formatMessage(labels.runQuery)}
        </FormSubmitButton>
      </FormButtons>
    </Form>
  );
}
