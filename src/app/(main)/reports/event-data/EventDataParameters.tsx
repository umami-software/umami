import { useContext } from 'react';
import { Form, FormRow, FormButtons, SubmitButton, PopupTrigger, Icon, Popup } from 'react-basics';
import Empty from 'components/common/Empty';
import Icons from 'components/icons';
import { useApi, useMessages } from 'components/hooks';
import { DATA_TYPES, REPORT_PARAMETERS } from 'lib/constants';
import { ReportContext } from '../[reportId]/Report';
import FieldAddForm from '../[reportId]/FieldAddForm';
import ParameterList from '../[reportId]/ParameterList';
import BaseParameters from '../[reportId]/BaseParameters';
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
  const { report, runReport, updateReport, isRunning } = useContext(ReportContext);
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

  const handleSubmit = values => {
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
      <PopupTrigger>
        <Icon>
          <Icons.Plus />
        </Icon>
        <Popup position="bottom" alignment="start">
          {(close: () => void) => {
            return (
              <FieldAddForm
                fields={data.map(({ eventKey, eventDataType }) => ({
                  name: eventKey,
                  type: DATA_TYPES[eventDataType],
                }))}
                group={group}
                onAdd={onAdd}
                onClose={close}
              />
            );
          }}
        </Popup>
      </PopupTrigger>
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
            <FormRow
              key={label}
              label={label}
              action={<AddButton group={group} onAdd={handleAdd} />}
            >
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
            </FormRow>
          );
        })}
      <FormButtons>
        <SubmitButton variant="primary" disabled={!queryEnabled} isLoading={isRunning}>
          {formatMessage(labels.runQuery)}
        </SubmitButton>
      </FormButtons>
    </Form>
  );
}

export default EventDataParameters;
