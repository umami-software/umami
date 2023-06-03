import { useContext, useRef } from 'react';
import { useApi, useMessages } from 'hooks';
import { Form, FormRow, FormButtons, SubmitButton, Loading } from 'react-basics';
import { ReportContext } from 'components/pages/reports/Report';
import NoData from 'components/common/NoData';
import styles from './EventDataParameters.module.css';
import { DATA_TYPES } from 'lib/constants';

function useFields(websiteId, startDate, endDate) {
  const { get, useQuery } = useApi();
  const { data, error, isLoading } = useQuery(
    ['fields', websiteId, startDate, endDate],
    () => get('/reports/event-data', { websiteId, startAt: +startDate, endAt: +endDate }),
    { enabled: !!(websiteId && startDate && endDate) },
  );

  return { data, error, isLoading };
}

export function EventDataParameters() {
  const { report, runReport, isRunning } = useContext(ReportContext);
  const { formatMessage, labels } = useMessages();
  const ref = useRef(null);
  const { parameters } = report || {};
  const { websiteId, dateRange } = parameters || {};
  const { startDate, endDate } = dateRange || {};
  const queryDisabled = !websiteId || !dateRange;
  const { data, error, isLoading } = useFields(websiteId, startDate, endDate);

  const handleSubmit = values => {
    runReport(values);
  };

  if (!websiteId || !dateRange) {
    return null;
  }

  if (isLoading) {
    return <Loading icon="dots" />;
  }

  return (
    <Form ref={ref} values={parameters} error={error} onSubmit={handleSubmit}>
      <FormRow label={formatMessage(labels.fields)}>
        <div className={styles.fields}>
          {!data?.length && <NoData />}
          {data?.map?.(({ eventKey, eventDataType }) => {
            return (
              <div className={styles.field} key={eventKey}>
                <div className={styles.key}>{eventKey}</div>
                <div className={styles.type}>{DATA_TYPES[eventDataType]}</div>
              </div>
            );
          })}
        </div>
      </FormRow>
      <FormButtons>
        <SubmitButton variant="primary" disabled={queryDisabled} loading={isRunning}>
          {formatMessage(labels.runQuery)}
        </SubmitButton>
      </FormButtons>
    </Form>
  );
}

export default EventDataParameters;
