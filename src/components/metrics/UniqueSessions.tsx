import { Container, Loading, Text } from '@umami/react-zen';
import { useWebsiteStatsQuery } from '@/components/hooks';

interface UniqueSessionsProps {
  websiteId: string;
}

const UniqueSessions = ({ websiteId }: UniqueSessionsProps) => {
  const { data, isLoading, error } = useWebsiteStatsQuery(websiteId);

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
      <Text size="5" className="text-white mr-3" weight="bold">
        {data?.visitors ?? 0}
      </Text>
    );
  };

  return (
    <Container className="flex items-center gap-8">
      <Text size="5" color="gray">
        Unique Sessions:
      </Text>
      {renderContent()}
    </Container>
  );
};

export default UniqueSessions;
