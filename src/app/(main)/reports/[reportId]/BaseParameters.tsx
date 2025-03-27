import { Column, Label } from '@umami/react-zen';
import { useReport } from '@/components/hooks';
import { parseDateRange } from '@/lib/date';
import { DateFilter } from '@/components/input/DateFilter';
import { WebsiteSelect } from '@/components/input/WebsiteSelect';
import { useMessages, useNavigation, useWebsiteQuery } from '@/components/hooks';

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
  const { report, updateReport } = useReport();
  const { formatMessage, labels } = useMessages();
  const { teamId } = useNavigation();
  const { parameters } = report || {};
  const { websiteId, dateRange } = parameters || {};
  const { value, startDate, endDate } = dateRange || {};
  const { data: website } = useWebsiteQuery(websiteId);
  const { name } = website || {};

  const handleWebsiteSelect = (websiteId: string) => {
    updateReport({ websiteId, parameters: { websiteId } });
  };

  const handleDateChange = (value: string) => {
    updateReport({ parameters: { dateRange: { ...parseDateRange(value) } } });
  };

  return (
    <>
      {showWebsiteSelect && (
        <Column>
          <Label>{formatMessage(labels.website)}</Label>
          {allowWebsiteSelect ? (
            <WebsiteSelect teamId={teamId} websiteId={websiteId} onSelect={handleWebsiteSelect} />
          ) : (
            name
          )}
        </Column>
      )}
      {showDateSelect && (
        <Column>
          <Label>{formatMessage(labels.dateRange)}</Label>
          {allowDateSelect && (
            <DateFilter
              value={value}
              startDate={startDate}
              endDate={endDate}
              onChange={handleDateChange}
            />
          )}
        </Column>
      )}
    </>
  );
}
