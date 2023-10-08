'use client';
import useMessages from 'components/hooks/useMessages';
import PageHeader from 'components/layout/PageHeader';
import WebsiteAddButton from './WebsiteAddButton';

export function WebsitesHeader({ showActions = true }) {
  const { formatMessage, labels } = useMessages();

  return (
    <PageHeader title={formatMessage(labels.websites)}>
      {!process.env.cloudMode && showActions && <WebsiteAddButton />}
    </PageHeader>
  );
}

export default WebsitesHeader;
