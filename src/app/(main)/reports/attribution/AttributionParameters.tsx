import { useMessages } from '@/components/hooks';
import Icons from '@/components/icons';
import { useContext, useState } from 'react';
import {
  Button,
  Dropdown,
  Form,
  FormButtons,
  FormInput,
  FormRow,
  Icon,
  Item,
  Popup,
  PopupTrigger,
  SubmitButton,
} from 'react-basics';
import BaseParameters from '../[reportId]/BaseParameters';
import ParameterList from '../[reportId]/ParameterList';
import PopupForm from '../[reportId]/PopupForm';
import { ReportContext } from '../[reportId]/Report';
import FunnelStepAddForm from '../funnel/FunnelStepAddForm';
import styles from './AttributionParameters.module.css';
import AttributionStepAddForm from './AttributionStepAddForm';

export function AttributionParameters() {
  const { report, runReport, updateReport, isRunning } = useContext(ReportContext);
  const { formatMessage, labels } = useMessages();
  const { id, parameters } = report || {};
  const { websiteId, dateRange, steps } = parameters || {};
  const queryEnabled = websiteId && dateRange && steps.length > 0;
  const [model, setModel] = useState('');

  const handleSubmit = (data: any, e: any) => {
    e.stopPropagation();
    e.preventDefault();
    runReport(data);
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
      <PopupTrigger disabled={steps.length > 0}>
        <Button disabled={steps.length > 0}>
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

  const items = [
    { label: 'First-Click', value: 'firstClick' },
    { label: 'Last-Click', value: 'lastClick' },
  ];

  const renderModelValue = (value: any) => {
    return items.find(item => item.value === value)?.label;
  };

  const onModelChange = (value: any) => {
    setModel(value);
    updateReport({ parameters: { model } });
  };

  return (
    <Form values={parameters} onSubmit={handleSubmit} preventSubmit={true}>
      <BaseParameters showDateSelect={true} allowWebsiteSelect={!id} />
      <FormRow label={formatMessage(labels.model)}>
        <FormInput name="model" rules={{ required: formatMessage(labels.required) }}>
          <Dropdown
            items={items}
            value={model}
            renderValue={renderModelValue}
            onChange={onModelChange}
          >
            {({ value, label }) => {
              return <Item key={value}>{label}</Item>;
            }}
          </Dropdown>
        </FormInput>
      </FormRow>
      <FormRow label={formatMessage(labels.conversionStep)} action={<AddStepButton />}>
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
                      <AttributionStepAddForm
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
        <SubmitButton variant="primary" disabled={!queryEnabled} isLoading={isRunning}>
          {formatMessage(labels.runQuery)}
        </SubmitButton>
      </FormButtons>
    </Form>
  );
}

export default AttributionParameters;
