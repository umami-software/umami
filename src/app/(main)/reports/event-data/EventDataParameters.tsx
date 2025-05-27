import {
  Form,
  FormField,
  FormButtons,
  FormSubmitButton,
  DialogTrigger,
  Icon,
  Popover,
} from '@umami/react-zen';
import { Empty } from '@/components/common/Empty';
import { Plus } from '@/components/icons';
import { useApi, useMessages, useReport } from '@/components/hooks';
import { DATA_TYPES, REPORT_PARAMETERS } from '@/lib/constants';
import { FieldAddForm } from '../[reportId]/FieldAddForm';
import { ParameterList } from '../[reportId]/ParameterList';
import { BaseParameters } from '../[reportId]/BaseParameters';
import styles from './EventDataParameters.module.css';

function useFields(websiteId, startDate, endDate) {
  const { get, useQuery } = useApi();
  const { data, error, isLoading } = useQuery({
    queryKey: ['fields', websiteId, startDate, endDate],
    queryFn: () =>
      get('/reports/event-data', {
        websiteId,
        startAt: +startDate,
        endAt: +endDate,
      }),
    enabled: !!(websiteId && startDate && endDate),
  });

  return { data, error, isLoading };
}

export function EventDataParameters() {
  const { report, runReport, updateReport, isRunning } = useReport();
  const { formatMessage, labels, messages } = useMessages();
  const { id, parameters } = report || {};
  const { websiteId, dateRange, fields, filters, groups } = parameters || {};
  const { startDate, endDate } = dateRange || {};
  const queryEnabled = websiteId && dateRange && fields?.length;
  const { data, error } = useFields(websiteId, startDate, endDate);
  const parametersSelected = websiteId && startDate && endDate;
  const hasData = data?.length !== 0;

  const parameterGroups = [
    { label: formatMessage(labels.fields), group: REPORT_PARAMETERS.fields },
    { label: formatMessage(labels.filters), group: REPORT_PARAMETERS.filters },
  ];

  const parameterData = {
    fields,
    filters,
    groups,
  };

  const handleSubmit = (values: any) => {
    runReport(values);
  };

  const handleAdd = (group: string, value: any) => {
    const data = parameterData[group];

    if (!data.find(({ name }) => name === value?.name)) {
      updateReport({ parameters: { [group]: data.concat(value) } });
    }
  };

  const handleRemove = (group: string) => {
    const data = [...parameterData[group]];
    updateReport({ parameters: { [group]: data.filter(({ name }) => name !== group) } });
  };

  const AddButton = ({ group, onAdd }) => {
    return (
      <DialogTrigger>
        <Icon>
          <Plus />
        </Icon>
        <Popover placement="bottom start">
          {({ close }: any) => {
            return (
              <FieldAddForm
                fields={data.map(({ dataKey, eventDataType }) => ({
                  name: dataKey,
                  type: DATA_TYPES[eventDataType],
                }))}
                group={group}
                onAdd={onAdd}
                onClose={close}
              />
            );
          }}
        </Popover>
      </DialogTrigger>
    );
  };

  return (
    <Form values={parameters} error={error} onSubmit={handleSubmit}>
      <BaseParameters allowWebsiteSelect={!id} />
      {!hasData && <Empty message={formatMessage(messages.noEventData)} />}
      {parametersSelected &&
        hasData &&
        parameterGroups.map(({ label, group }) => {
          return (
            <FormField name={label} key={label} label={label}>
              <ParameterList>
                {parameterData[group].map(({ name, value }) => {
                  return (
                    <ParameterList.Item key={name} onRemove={() => handleRemove(group)}>
                      <div className={styles.parameter}>
                        {group === REPORT_PARAMETERS.fields && (
                          <>
                            <div>{name}</div>
                            <div className={styles.op}>{value}</div>
                          </>
                        )}
                        {group === REPORT_PARAMETERS.filters && (
                          <>
                            <div>{name}</div>
                            <div className={styles.op}>{value[0]}</div>
                            <div>{value[1]}</div>
                          </>
                        )}
                      </div>
                    </ParameterList.Item>
                  );
                })}
              </ParameterList>
              <AddButton group={group} onAdd={handleAdd} />
            </FormField>
          );
        })}
      <FormButtons>
        <FormSubmitButton variant="primary" isDisabled={!queryEnabled} isLoading={isRunning}>
          {formatMessage(labels.runQuery)}
        </FormSubmitButton>
      </FormButtons>
    </Form>
  );
}
