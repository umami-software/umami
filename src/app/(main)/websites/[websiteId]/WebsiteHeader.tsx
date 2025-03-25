import { ReactNode } from 'react';
import { Row, Heading } from '@umami/react-zen';
import { Favicon } from '@/components/common/Favicon';
import { ActiveUsers } from '@/components/metrics/ActiveUsers';
import { WebsiteTabs } from '@/app/(main)/websites/[websiteId]/WebsiteTabs';
import { useWebsite } from '@/components/hooks/useWebsite';

export function WebsiteHeader({
  websiteId,
  children,
}: {
  websiteId: string;
  children?: ReactNode;
}) {
  const website = useWebsite();
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
