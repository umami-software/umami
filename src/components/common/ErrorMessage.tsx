import { Icon, Text, Row } from '@umami/react-zen';
import { useMessages } from '@/components/hooks';
import { Alert } from '@/components/icons';

export function ErrorMessage() {
  const { formatMessage, messages } = useMessages();

  return (
    <Row alignItems="center" justifyContent="center" gap>
      <Icon>
        <Alert />
      </Icon>
      <Text>{formatMessage(messages.error)}</Text>
    </Row>
  );
}
