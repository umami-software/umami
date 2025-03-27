import { useMessages, useReport } from '@/components/hooks';
import { Icons } from '@/components/icons';
import { formatNumber } from '@/lib/format';
import {
  Button,
  Form,
  FormButtons,
  FormField,
  Icon,
  Popover,
  MenuTrigger,
  FormSubmitButton,
  Column,
} from '@umami/react-zen';
import { BaseParameters } from '../[reportId]/BaseParameters';
import { ParameterList } from '../[reportId]/ParameterList';
import { GoalsAddForm } from './GoalsAddForm';
import styles from './GoalsParameters.module.css';

export function GoalsParameters() {
  const { report, runReport, updateReport, isRunning } = useReport();
  const { formatMessage, labels } = useMessages();

  const { id, parameters } = report || {};
  const { websiteId, dateRange, goals } = parameters || {};
  const queryDisabled = !websiteId || !dateRange || goals?.length < 1;

  const handleSubmit = (data: any, e: any) => {
    e.stopPropagation();
    e.preventDefault();

    if (!queryDisabled) {
      runReport(data);
    }
  };

  const handleAddGoals = (goal: { type: string; value: string }) => {
    updateReport({ parameters: { goals: parameters.goals.concat(goal) } });
  };

  const handleUpdateGoals = (
    close: () => void,
    index: number,
    goal: { type: string; value: string },
  ) => {
    const goals = [...parameters.goals];
    goals[index] = goal;
    updateReport({ parameters: { goals } });
    close();
  };

  const handleRemoveGoals = (index: number) => {
    const goals = [...parameters.goals];
    delete goals[index];
    updateReport({ parameters: { goals: goals.filter(n => n) } });
  };

  const AddGoalsButton = () => {
    return (
      <MenuTrigger>
        <Button>
          <Icon>
            <Icons.Plus />
          </Icon>
        </Button>
        <Popover placement="start">
          <GoalsAddForm onChange={handleAddGoals} />
        </Popover>
      </MenuTrigger>
    );
  };

  return (
    <Form values={parameters} onSubmit={handleSubmit} preventSubmit={true}>
      <BaseParameters allowWebsiteSelect={!id} />
      <AddGoalsButton />
      <FormField name="goal" label={formatMessage(labels.goals)}>
        <ParameterList>
          {goals.map(
            (
              goal: {
                type: string;
                value: string;
                goal: number;
                operator?: string;
                property?: string;
              },
              index: number,
            ) => {
              return (
                <MenuTrigger key={index}>
                  <ParameterList.Item
                    icon={goal.type === 'url' ? <Icons.Eye /> : <Icons.Bolt />}
                    onRemove={() => handleRemoveGoals(index)}
                  >
                    <Column>
                      <div className={styles.value}>{goal.value}</div>
                      {goal.type === 'event-data' && (
                        <div className={styles.eventData}>
                          {formatMessage(labels[goal.operator])}: {goal.property}
                        </div>
                      )}
                      <div className={styles.goal}>
                        {formatMessage(labels.goal)}: {formatNumber(goal.goal)}
                      </div>
                    </Column>
                  </ParameterList.Item>
                  <Popover placement="start">
                    <GoalsAddForm
                      type={goal.type}
                      value={goal.value}
                      goal={goal.goal}
                      operator={goal.operator}
                      property={goal.property}
                      onChange={handleUpdateGoals.bind(null, () => {}, index)}
                    />
                  </Popover>
                </MenuTrigger>
              );
            },
          )}
        </ParameterList>
      </FormField>
      <FormButtons>
        <FormSubmitButton variant="primary" isDisabled={queryDisabled} isLoading={isRunning}>
          {formatMessage(labels.runQuery)}
        </FormSubmitButton>
      </FormButtons>
    </Form>
  );
}
