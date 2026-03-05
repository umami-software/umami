import { Box } from '@umami/react-zen';
import { WebsiteControls } from '@/app/(main)/websites/[websiteId]/WebsiteControls';
import { useBoard } from '@/components/hooks';

export function BoardControls() {
  const { board } = useBoard();
  const boardWebsiteId = board?.parameters?.websiteId;
  const componentWebsiteIds = board?.parameters?.rows
    ?.flatMap(row => row.columns)
    .map(column => column.component?.websiteId)
    .filter(Boolean);
  const fallbackWebsiteId = componentWebsiteIds?.[0];
  const websiteId = boardWebsiteId || fallbackWebsiteId;

  return (
    <Box marginBottom="4">
      <WebsiteControls websiteId={websiteId} />
    </Box>
  );
}
