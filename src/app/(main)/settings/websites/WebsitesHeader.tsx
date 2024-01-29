'use client';
import { useMessages } from 'components/hooks';
import PageHeader from 'components/layout/PageHeader';
import WebsiteAddButton from './WebsiteAddButton';

export interface WebsitesHeaderProps {
  teamId?: string;
  showActions?: boolean;
}

export function WebsitesHeader({ teamId, showActions = true }: WebsitesHeaderProps) {
  const { formatMessage, labels } = useMessages();

  return (
    <PageHeader title={formatMessage(labels.websites)}>
      {!process.env.cloudMode && showActions && <WebsiteAddButton teamId={teamId} />}
    </PageHeader>
  );
}

export default WebsitesHeader;
