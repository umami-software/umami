import { ReactNode } from 'react';
import { Row, Heading } from '@umami/react-zen';
import { Favicon } from '@/components/common/Favicon';
import { useWebsiteQuery } from '@/components/hooks';
import { ActiveUsers } from '@/components/metrics/ActiveUsers';
import { WebsiteTabs } from '@/app/(main)/websites/[websiteId]/WebsiteTabs';

export function WebsiteHeader({
  websiteId,
  children,
}: {
  websiteId: string;
  children?: ReactNode;
}) {
  const { data: website } = useWebsiteQuery(websiteId);
  const { name, domain } = website || {};

  return (
    <>
      <Row alignItems="center" gap="3" marginY="6">
        <Favicon domain={domain} />
        <Heading>
          {name}
          <ActiveUsers websiteId={websiteId} />
        </Heading>
        {children}
      </Row>
      <WebsiteTabs websiteId={websiteId} />
    </>
  );
}
