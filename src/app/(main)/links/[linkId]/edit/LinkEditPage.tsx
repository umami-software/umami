'use client';
import { Column } from '@umami/react-zen';
import { LinkShareForm } from '@/app/(main)/links/[linkId]/LinkShareForm';
import { LinkEditForm } from '@/app/(main)/links/LinkEditForm';
import { LinkProvider } from '@/app/(main)/links/LinkProvider';
import { IconLabel } from '@/components/common/IconLabel';
import Link from '@/components/common/Link';
import { PageHeader } from '@/components/common/PageHeader';
import { Panel } from '@/components/common/Panel';
import { useLink, useMessages, useNavigation } from '@/components/hooks';
import { ArrowLeft, Link as LinkIcon } from '@/components/icons';

export function LinkEditPage({ linkId }: { linkId: string }) {
  return (
    <LinkProvider linkId={linkId}>
      <Column margin="2" width="100%" maxWidth="800px" style={{ marginInline: 'auto' }}>
        <LinkEditHeader />
        <Column gap="6">
          <Panel>
            <LinkEditForm linkId={linkId} />
          </Panel>
          <Panel>
            <LinkShareForm linkId={linkId} />
          </Panel>
        </Column>
      </Column>
    </LinkProvider>
  );
}

function LinkEditHeader() {
  const link = useLink();
  const { t, labels } = useMessages();
  const { renderUrl } = useNavigation();

  return (
    <>
      <Column marginTop="6">
        <Link href={renderUrl(`/links/${link.id}`)}>
          <IconLabel icon={<ArrowLeft />} label={t(labels.link)} />
        </Link>
      </Column>
      <PageHeader title={link.name} description={link.url} icon={<LinkIcon />} />
    </>
  );
}
