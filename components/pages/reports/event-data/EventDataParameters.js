import { useContext, useRef } from 'react';
import { useApi, useMessages } from 'hooks';
import { Form, FormRow, FormButtons, SubmitButton, PopupTrigger, Icon, Popup } from 'react-basics';
import { ReportContext } from 'components/pages/reports/Report';
import Empty from 'components/common/Empty';
import { DATA_TYPES } from 'lib/constants';
import BaseParameters from '../BaseParameters';
import FieldAddForm from './FieldAddForm';
import ParameterList from '../ParameterList';
import Icons from 'components/icons';
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
  const queryDisabled = !websiteId || !dateRange;
  const { data, error } = useFields(websiteId, startDate, endDate);
  const parametersSelected = websiteId && startDate && endDate;
  const hasData = data?.length !== 0;

  const parameterGroups = [
    { label: formatMessage(labels.fields), type: 'fields' },
    { label: formatMessage(labels.filters), type: 'filters' },
    { label: formatMessage(labels.groupBy), type: 'groups' },
  ];

  const parameterData = {
    fields,
    filters,
    groups,
  };

  const handleSubmit = values => {
    runReport(values);
  };

  const handleAdd = (type, value) => {
    const data = parameterData[type];
    updateReport({ parameters: { [type]: data.concat(value) } });
  };

  const handleRemove = (type, index) => {
    const data = [...parameterData[type]];
    data.splice(index, 1);
    updateReport({ parameters: { [type]: data } });
  };

  const AddButton = ({ type }) => {
    return (
      <PopupTrigger>
        <Icon>
          <Icons.Plus />
        </Icon>
        <Popup position="bottom" alignment="start">
          {(close, element) => {
            return (
              <FieldAddForm
                type={type}
                fields={data.map(({ eventKey, eventDataType }) => ({
                  name: eventKey,
                  type: DATA_TYPES[eventDataType],
                }))}
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
        parameterGroups.map(({ label, type }) => {
          return (
            <FormRow key={label} label={label} action={<AddButton type={type} onAdd={handleAdd} />}>
              <ParameterList
                items={parameterData[type]}
                onRemove={index => handleRemove(type, index)}
              >
                {({ name, value }) => {
                  return (
                    <div className={styles.parameter}>
                      {type === 'fields' && (
                        <>
                          <div className={styles.op}>{value}</div>
                          <div>{name}</div>
                        </>
                      )}
                      {type === 'filters' && (
                        <>
                          <div>{name}</div>
                          <div className={styles.op}>{value[0]}</div>
                          <div>{value[1]}</div>
                        </>
                      )}
                      {type === 'groups' && (
                        <>
                          <div>{name}</div>
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
        <SubmitButton variant="primary" disabled={queryDisabled} loading={isRunning}>
          {formatMessage(labels.runQuery)}
        </SubmitButton>
      </FormButtons>
    </Form>
  );
}

export default EventDataParameters;
