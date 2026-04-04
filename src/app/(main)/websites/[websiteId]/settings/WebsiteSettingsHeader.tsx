import { Row } from '@umami/react-zen';
import Link from 'next/link';
import { IconLabel } from '@/components/common/IconLabel';
import { PageHeader } from '@/components/common/PageHeader';
import { useMessages, useNavigation, useWebsite } from '@/components/hooks';
import { ArrowLeft, Globe } from '@/components/icons';

export function WebsiteSettingsHeader() {
  const website = useWebsite();
  const { t, labels } = useMessages();
  const { renderUrl } = useNavigation();

  return (
    <>
      <Row marginTop="6">
        <Link href={renderUrl(`/websites/${website.id}`)}>
          <IconLabel icon={<ArrowLeft />} label={t(labels.website)} />
        </Link>
      </Row>
      <PageHeader title={website?.name} description={website?.domain} icon={<Globe />} />
    </>
  );
}
