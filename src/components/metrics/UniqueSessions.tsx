import { Container, Text } from '@umami/react-zen';
import { useMemo } from 'react';
import { useWebsiteEventsQuery } from '@/components/hooks';

const UniqueSessions = ({ websiteId }) => {
  const query = useWebsiteEventsQuery(websiteId, { view: 'all' });

  const uniqueSessionCount = useMemo(() => {
    if (!query?.data?.data) return 0;

    const uniqueSessions = new Set(query.data.data.map((event: any) => event.sessionId));

    return uniqueSessions.size;
  }, [query?.data?.data]);

  return (
    <Container className="flex items-center gap-8">
      <Text size="5" color="gray">
        Unique Sessions:
      </Text>
      <Text size="5" className="text-white mr-3" weight="bold">
        {' '}
        {uniqueSessionCount}
      </Text>
    </Container>
  );
};

export default UniqueSessions;
