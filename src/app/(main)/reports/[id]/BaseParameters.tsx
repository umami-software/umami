import { useContext } from 'react';
import { FormRow } from 'react-basics';
import { parseDateRange } from 'lib/date';
import DateFilter from 'components/input/DateFilter';
import WebsiteSelect from 'components/input/WebsiteSelect';
import { useMessages } from 'components/hooks';
import { ReportContext } from './Report';

export interface BaseParametersProps {
  showWebsiteSelect?: boolean;
  allowWebsiteSelect?: boolean;
  showDateSelect?: boolean;
  allowDateSelect?: boolean;
}

export function BaseParameters({
  showWebsiteSelect = true,
  allowWebsiteSelect = true,
  showDateSelect = true,
  allowDateSelect = true,
}: BaseParametersProps) {
  const { report, updateReport } = useContext(ReportContext);
  const { formatMessage, labels } = useMessages();

  const { parameters } = report || {};
  const { websiteId, dateRange } = parameters || {};
  const { value, startDate, endDate } = dateRange || {};

  const handleWebsiteSelect = (websiteId: string) => {
    updateReport({ websiteId, parameters: { websiteId } });
  };

  const handleDateChange = (value: string) => {
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
