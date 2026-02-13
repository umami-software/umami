'use client';
import { Icon, Row } from '@umami/react-zen';
import { useNavigation } from '@/components/hooks';
import { Slash } from '@/components/icons';
import { TeamsButton } from '@/components/input/TeamsButton';
import { WebsiteSelect } from '@/components/input/WebsiteSelect';

export function TopNav() {
  const { websiteId, teamId, router, renderUrl } = useNavigation();

  const handleWebsiteChange = (value: string) => {
    router.push(renderUrl(`/websites/${value}`));
  };

  return (
    <Row
      position="sticky"
      top="0"
      alignItems="center"
      justifyContent="flex-start"
      paddingY="2"
      paddingX="3"
      paddingRight="5"
      width="100%"
      zIndex={100}
    >
      <Row alignItems="center" backgroundColor="surface-raised" borderRadius>
        <TeamsButton />
        {websiteId && (
          <>
            <Icon size="sm" color="muted" style={{ opacity: 0.7, margin: '0 6px' }}>
              <Slash />
            </Icon>
            <WebsiteSelect
              websiteId={websiteId}
              teamId={teamId}
              onChange={handleWebsiteChange}
              buttonProps={{
                variant: 'quiet',
                style: { minHeight: 40, minWidth: 200, maxWidth: 200 },
              }}
            />
          </>
        )}
      </Row>
    </Row>
  );
}
