import { useContext, useRef } from 'react';
import { useApi, useMessages } from 'hooks';
import { Form, FormRow, FormButtons, SubmitButton, PopupTrigger, Icon, Popup } from 'react-basics';
import { ReportContext } from 'components/pages/reports/Report';
import Empty from 'components/common/Empty';
import { DATA_TYPES, REPORT_PARAMETERS } from 'lib/constants';
import Icons from 'components/icons';
import FieldAddForm from './FieldAddForm';
import BaseParameters from '../BaseParameters';
import ParameterList from '../ParameterList';
import styles from './EventDataParameters.module.css';

function useFields(websiteId, startDate, endDate) {
  const { get, useQuery } = useApi();
  const { data, error, isLoading } = useQuery(
    ['fields', websiteId, startDate, endDate],
    () =>
      get('/reports/event-data', {
        websiteId,
        startAt: +startDate,
        endAt: +endDate,
      }),
    { enabled: !!(websiteId && startDate && endDate) },
  );

  return { data, error, isLoading };
}

export function EventDataParameters() {
  const { report, runReport, updateReport, isRunning } = useContext(ReportContext);
  const { formatMessage, labels, messages } = useMessages();
  const ref = useRef(null);
  const { parameters } = report || {};
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

  const handleAdd = (group, value) => {
    const data = parameterData[group].filter(({ name }) => name !== value.name);

    updateReport({ parameters: { [group]: data.concat(value) } });
  };

  const handleRemove = (group, index) => {
    const data = [...parameterData[group]];
    data.splice(index, 1);
    updateReport({ parameters: { [group]: data } });
  };

  const AddButton = ({ group }) => {
    return (
      <PopupTrigger>
        <Icon>
          <Icons.Plus />
        </Icon>
        <Popup position="bottom" alignment="start">
          {(close, element) => {
            return (
              <FieldAddForm
                fields={data.map(({ eventKey, eventDataType }) => ({
                  name: eventKey,
                  type: DATA_TYPES[eventDataType],
                }))}
                group={group}
                element={element}
                onAdd={handleAdd}
                onClose={close}
              />
            );
          }}
        </Popup>
      </PopupTrigger>
    );
  };

  return (
    <Form ref={ref} values={parameters} error={error} onSubmit={handleSubmit}>
      <BaseParameters />
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
              <ParameterList
                items={parameterData[group]}
                onRemove={index => handleRemove(group, index)}
              >
                {({ name, value }) => {
                  return (
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
                  );
                }}
              </ParameterList>
            </FormRow>
          );
        })}
      <FormButtons>
        <SubmitButton variant="primary" disabled={!queryEnabled} loading={isRunning}>
          {formatMessage(labels.runQuery)}
        </SubmitButton>
      </FormButtons>
    </Form>
  );
}

export default EventDataParameters;
