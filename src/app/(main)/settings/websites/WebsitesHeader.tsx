import { useMessages } from 'components/hooks';
import PageHeader from 'components/layout/PageHeader';
import WebsiteAddButton from './WebsiteAddButton';

export interface WebsitesHeaderProps {
  teamId?: string;
  allowCreate?: boolean;
}

export function WebsitesHeader({ teamId, allowCreate = true }: WebsitesHeaderProps) {
  const { formatMessage, labels } = useMessages();

  return (
    <PageHeader title={formatMessage(labels.websites)}>
      {allowCreate && <WebsiteAddButton teamId={teamId} />}
    </PageHeader>
  );
}

export default WebsitesHeader;
