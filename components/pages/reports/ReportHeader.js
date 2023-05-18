import { useState } from 'react';
import { Flexbox, Icon, Text } from 'react-basics';
import WebsiteSelect from 'components/input/WebsiteSelect';
import PageHeader from 'components/layout/PageHeader';
import DateFilter from 'components/input/DateFilter';
import { parseDateRange } from 'lib/date';

export default function ReportHeader({ title, icon }) {
  const [websiteId, setWebsiteId] = useState();
  const [dateRange, setDateRange] = useState({});
  const { value, startDate, endDate } = dateRange;

  const handleSelect = id => {
    setWebsiteId(id);
  };

  const handleDateChange = value => setDateRange(parseDateRange(value));

  const Title = () => {
    return (
      <>
        <Icon size="xl">{icon}</Icon>
        <Text>{title}</Text>
      </>
    );
  };

  return (
    <PageHeader title={<Title />}>
      <Flexbox gap={20}>
        <DateFilter
          value={value}
          startDate={startDate}
          endDate={endDate}
          onChange={handleDateChange}
          showAllTime
        />
        <WebsiteSelect websiteId={websiteId} onSelect={handleSelect} />
      </Flexbox>
    </PageHeader>
  );
}
