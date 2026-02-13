'use client';
import { Icon, Row } from '@umami/react-zen';
import { useNavigation } from '@/components/hooks';
import { Slash } from '@/components/icons';
import { BoardSelect } from '@/components/input/BoardSelect';
import { LinkSelect } from '@/components/input/LinkSelect';
import { PixelSelect } from '@/components/input/PixelSelect';
import { TeamsButton } from '@/components/input/TeamsButton';
import { WebsiteSelect } from '@/components/input/WebsiteSelect';

export function TopNav() {
  const { websiteId, linkId, pixelId, boardId, teamId, router, renderUrl } = useNavigation();

  const handleWebsiteChange = (value: string) => {
    router.push(renderUrl(`/websites/${value}`));
  };

  const handleLinkChange = (value: string) => {
    router.push(renderUrl(`/links/${value}`));
  };

  const handlePixelChange = (value: string) => {
    router.push(renderUrl(`/pixels/${value}`));
  };

  const handleBoardChange = (value: string) => {
    router.push(renderUrl(`/boards/${value}`));
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
        {(websiteId || linkId || pixelId || boardId) && (
          <>
            <Icon size="sm" color="muted" style={{ opacity: 0.7, margin: '0 6px' }}>
              <Slash />
            </Icon>
            {websiteId && (
              <WebsiteSelect
                websiteId={websiteId}
                teamId={teamId}
                onChange={handleWebsiteChange}
                buttonProps={{
                  variant: 'quiet',
                  style: { minHeight: 40, minWidth: 200, maxWidth: 200 },
                }}
              />
            )}
            {linkId && (
              <LinkSelect
                linkId={linkId}
                teamId={teamId}
                onChange={handleLinkChange}
                buttonProps={{
                  variant: 'quiet',
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
                  variant: 'quiet',
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
                  variant: 'quiet',
                  style: { minHeight: 40, minWidth: 200, maxWidth: 200 },
                }}
              />
            )}
          </>
        )}
      </Row>
    </Row>
  );
}
