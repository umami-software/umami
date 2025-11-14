import Link from 'next/link';
import { PageHeader } from '@/components/common/PageHeader';
import { Globe, ArrowLeft } from '@/components/icons';
import { useMessages, useNavigation, useWebsite } from '@/components/hooks';
import { IconLabel, Row } from '@umami/react-zen';

export function WebsiteSettingsHeader() {
  const website = useWebsite();
  const { formatMessage, labels } = useMessages();
  const { renderUrl } = useNavigation();

  return (
    <>
      <Row marginTop="6">
        <Link href={renderUrl(`/websites/${website.id}`)}>
          <IconLabel icon={<ArrowLeft />} label={formatMessage(labels.website)} />
        </Link>
      </Row>
      <PageHeader title={website?.name} description={website?.domain} icon={<Globe />} />
    </>
  );
}
