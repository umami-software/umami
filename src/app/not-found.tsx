'use client';
import { Flexbox } from 'react-basics';
import useMessages from 'components/hooks/useMessages';

export default function () {
  const { formatMessage, labels } = useMessages();

  return (
    <Flexbox alignItems="center" justifyContent="center" flex={1} style={{ minHeight: 600 }}>
      <h1>{formatMessage(labels.pageNotFound)}</h1>
    </Flexbox>
  );
}
