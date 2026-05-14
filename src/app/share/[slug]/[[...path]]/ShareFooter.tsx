'use client';
import { useShare } from '@/components/hooks';
import { Column, Row } from '@umami/react-zen';
import { ShareBranding } from './ShareBranding';

export function ShareFooter() {
  const share = useShare();

  if (!share?.whiteLabel) {
    return null;
  }

  return (
    <Column
      paddingX={{ base: '3', md: '6' }}
      width="100%"
      maxWidth="1320px"
      style={{ margin: '0 auto' }}
    >
      <Row border="top" justifyContent="flex-end" paddingY="4">
        <ShareBranding size="sm" />
      </Row>
    </Column>
  );
}
