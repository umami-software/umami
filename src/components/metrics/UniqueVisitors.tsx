import { Loading, Row, Text } from '@umami/react-zen';
import { useMessages, useWebsiteStatsQuery } from '@/components/hooks';

interface UniqueVisitorsProps {
  websiteId: string;
}

const UniqueVisitors = ({ websiteId }: UniqueVisitorsProps) => {
  const { data, isLoading, error } = useWebsiteStatsQuery(websiteId);
  const { formatMessage, labels } = useMessages();

  const renderContent = () => {
    if (isLoading) {
      return <Loading icon="dots" />;
    }

    if (error) {
      return (
        <Text size="5" color="red">
          Error loading data
        </Text>
      );
    }

    return (
      <Text size="5" weight="bold">
        {data?.visitors ?? 0}
      </Text>
    );
  };

  return (
    <Row alignItems="center" gap="3">
      <Text size="5" color="gray">
        {formatMessage(labels.visitors)}:
      </Text>
      {renderContent()}
    </Row>
  );
};

export default UniqueVisitors;
