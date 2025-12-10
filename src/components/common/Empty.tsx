import { Row } from '@umami/react-zen';
import { useMessages } from '@/components/hooks';

export interface EmptyProps {
  message?: string;
}

export function Empty({ message }: EmptyProps) {
  const { formatMessage, messages } = useMessages();

  return (
    <Row
      color="muted"
      alignItems="center"
      justifyContent="center"
      width="100%"
      height="100%"
      minHeight="70px"
      flexGrow={1}
    >
      {message || formatMessage(messages.noDataAvailable)}
    </Row>
  );
}
