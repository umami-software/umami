import { Flexbox, Icon, LoadingButton, Text, useToast } from 'react-basics';
import WebsiteSelect from 'components/input/WebsiteSelect';
import PageHeader from 'components/layout/PageHeader';
import DateFilter from 'components/input/DateFilter';
import { parseDateRange } from 'lib/date';
import { updateReport } from 'store/reports';
import { useMessages, useApi } from 'hooks';
import styles from './reports.module.css';

export function ReportHeader({ report, icon }) {
  const { formatMessage, labels, messages } = useMessages();
  const { toast, showToast } = useToast();
  const { post, useMutation } = useApi();
  const { mutate, isLoading } = useMutation(data => post(`/reports`, data));

  const { id, websiteId, name, parameters } = report || {};
  const { value, startDate, endDate } = parameters?.dateRange || {};

  const handleSelect = websiteId => {
    updateReport(id, { websiteId });
  };

  const handleDateChange = value => {
    updateReport(id, { parameters: { dateRange: { ...parseDateRange(value) } } });
  };

  const handleSave = async () => {
    mutate(report, {
      onSuccess: async () => {
        showToast({ message: formatMessage(messages.saved), variant: 'success' });
      },
    });
  };

  const Title = () => {
    return (
      <>
        <Icon size="lg">{icon}</Icon>
        <Text>{name}</Text>
      </>
    );
  };

  return (
    <PageHeader title={<Title />} className={styles.header}>
      <Flexbox gap={20}>
        <DateFilter
          value={value}
          startDate={startDate}
          endDate={endDate}
          onChange={handleDateChange}
          showAllTime
        />
        <WebsiteSelect websiteId={websiteId} onSelect={handleSelect} />
        <LoadingButton
          variant="primary"
          loading={isLoading}
          disabled={!websiteId || !value}
          onClick={handleSave}
        >
          {formatMessage(labels.save)}
        </LoadingButton>
      </Flexbox>
      {toast}
    </PageHeader>
  );
}

export default ReportHeader;
