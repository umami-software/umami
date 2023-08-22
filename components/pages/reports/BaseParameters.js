import { FormRow } from 'react-basics';
import DateFilter from 'components/input/DateFilter';
import WebsiteSelect from 'components/input/WebsiteSelect';
import { parseDateRange } from 'lib/date';
import { useContext } from 'react';
import { ReportContext } from './Report';
import { useMessages } from 'hooks';

export function BaseParameters({
  showWebsiteSelect = true,
  allowWebsiteSelect = true,
  showDateSelect = true,
  allowDateSelect = true,
}) {
  const { report, updateReport } = useContext(ReportContext);
  const { formatMessage, labels } = useMessages();

  const { parameters } = report || {};
  const { websiteId, dateRange } = parameters || {};
  const { value, startDate, endDate } = dateRange || {};

  const handleWebsiteSelect = websiteId => {
    updateReport({ websiteId, parameters: { websiteId } });
  };

  const handleDateChange = value => {
    updateReport({ parameters: { dateRange: { ...parseDateRange(value) } } });
  };

  return (
    <>
      {showWebsiteSelect && (
        <FormRow label={formatMessage(labels.website)}>
          {allowWebsiteSelect && (
            <WebsiteSelect websiteId={websiteId} onSelect={handleWebsiteSelect} />
          )}
        </FormRow>
      )}
      {showDateSelect && (
        <FormRow label={formatMessage(labels.dateRange)}>
          {allowDateSelect && (
            <DateFilter
              value={value}
              startDate={startDate}
              endDate={endDate}
              onChange={handleDateChange}
            />
          )}
        </FormRow>
      )}
    </>
  );
}

export default BaseParameters;
