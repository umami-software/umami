'use client';
import { Button, Column, Text } from '@umami/react-zen';
import { useMessages } from '@/components/hooks';

export default function RouteError({ error, retry }: { error: unknown; retry: () => void }) {
  const { t, messages, labels } = useMessages();
  const digest = error instanceof Error ? (error as Error & { digest?: string }).digest : undefined;

  return (
    <Column
      role="alert"
      alignItems="center"
      justifyContent="center"
      gap
      padding="6"
      minHeight="600px"
    >
      <h1>{t(messages.error)}</h1>
      {digest && <Text color="muted">{digest}</Text>}
      <Button onPress={() => retry()}>{t(labels.refresh)}</Button>
    </Column>
  );
}
