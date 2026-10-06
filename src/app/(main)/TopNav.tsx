'use client';
import { Icon, Row } from '@umami/react-zen';
import { useNavigation } from '@/components/hooks';
import { Minus } from '@/components/icons';
import { BoardSelect } from '@/components/input/BoardSelect';
import { LinkSelect } from '@/components/input/LinkSelect';
import { PixelSelect } from '@/components/input/PixelSelect';
import { TeamsButton } from '@/components/input/TeamsButton';
import { WebsiteSelect } from '@/components/input/WebsiteSelect';

export function TopNav() {
  const { websiteId, linkId, pixelId, boardId, teamId, router, renderUrl } = useNavigation();

  const navigateToEntity = (basePath: string, value: string | number | null) => {
    if (value === null || value === undefined || value === '') {
      return;
    }

    router.push(renderUrl(`${basePath}/${value}`, false));
  };

  const handleWebsiteChange = (value: string | number | null) => {
    navigateToEntity('/websites', value);
  };

  const handleLinkChange = (value: string | number | null) => {
    navigateToEntity('/links', value);
  };

  const handlePixelChange = (value: string | number | null) => {
    navigateToEntity('/pixels', value);
  };

  const handleBoardChange = (value: string | number | null) => {
    navigateToEntity('/boards', value);
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
      backgroundColor="surface-raised"
    >
      <Row alignItems="center">
        <TeamsButton />
        {(websiteId || linkId || pixelId || boardId) && (
          <>
            <Icon size="sm" color="muted" rotate={90} style={{ opacity: 0.7, margin: '0 6px' }}>
              <Minus />
            </Icon>
            {websiteId && (
              <WebsiteSelect
                websiteId={websiteId}
                teamId={teamId}
                onChange={handleWebsiteChange}
                buttonProps={{
                  style: { minWidth: 200, maxWidth: 200 },
                }}
              />
            )}
            {linkId && (
              <LinkSelect
                linkId={linkId}
                teamId={teamId}
                onChange={handleLinkChange}
                buttonProps={{
                  className:
                    'border-transparent bg-transparent shadow-none hover:border-transparent hover:bg-interactive active:bg-interactive-hover',
                  style: { minHeight: 40, minWidth: 200, maxWidth: 200 },
                }}
              />
            )}
            {pixelId && (
              <PixelSelect
                pixelId={pixelId}
                teamId={teamId}
                onChange={handlePixelChange}
                buttonProps={{
                  className:
                    'border-transparent bg-transparent shadow-none hover:border-transparent hover:bg-interactive active:bg-interactive-hover',
                  style: { minHeight: 40, minWidth: 200, maxWidth: 200 },
                }}
              />
            )}
            {boardId && (
              <BoardSelect
                boardId={boardId}
                teamId={teamId}
                onChange={handleBoardChange}
                buttonProps={{
                  className:
                    'border-transparent bg-transparent shadow-none hover:border-transparent hover:bg-interactive active:bg-interactive-hover',
                  style: { minHeight: 40, minWidth: 200, maxWidth: 200 },
                }}
              />
            )}
          </>
        )}
      </Row>
      <div
        style={{
          position: 'absolute',
          bottom: -16,
          left: 0,
          right: 0,
          height: 16,
          background: 'linear-gradient(to bottom, var(--zen-surface-raised), transparent)',
          pointerEvents: 'none',
        }}
      />
    </Row>
  );
}
