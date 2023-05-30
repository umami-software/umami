import { useContext } from 'react';
import { useRouter } from 'next/router';
import { Flexbox, Icon, LoadingButton, InlineEditField, useToast } from 'react-basics';
import WebsiteSelect from 'components/input/WebsiteSelect';
import PageHeader from 'components/layout/PageHeader';
import DateFilter from 'components/input/DateFilter';
import { parseDateRange } from 'lib/date';
import { useMessages, useApi } from 'hooks';
import { ReportContext } from './Report';
import styles from './reports.module.css';

export function ReportHeader({ icon }) {
  const { report, updateReport } = useContext(ReportContext);
  const { formatMessage, labels, messages } = useMessages();
  const { toast, showToast } = useToast();
  const { post, useMutation } = useApi();
  const router = useRouter();
  const { mutate: create, isLoading: isCreating } = useMutation(data => post(`/reports`, data));
  const { mutate: update, isLoading: isUpdating } = useMutation(data =>
    post(`/reports/${data.id}`, data),
  );

  const { websiteId, name, dateRange } = report || {};
  const { value, startDate, endDate } = dateRange || {};

  const handleSelect = websiteId => {
    updateReport({ websiteId });
  };

  const handleDateChange = value => {
    updateReport({ dateRange: { ...parseDateRange(value) } });
  };

  const handleSave = async () => {
    if (!report.id) {
      create(report, {
        onSuccess: async ({ id }) => {
          router.push(`/reports/${id}`, null, { shallow: true });
          showToast({ message: formatMessage(messages.saved), variant: 'success' });
        },
      });
    } else {
      update(report, {
        onSuccess: async () => {
          showToast({ message: formatMessage(messages.saved), variant: 'success' });
        },
      });
    }
  };

  const handleNameChange = name => {
    updateReport({ name });
  };

  const Title = () => {
    return (
      <>
        <Icon size="lg">{icon}</Icon>
        <InlineEditField value={name} onCommit={handleNameChange} />
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
          loading={isCreating || isUpdating}
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
