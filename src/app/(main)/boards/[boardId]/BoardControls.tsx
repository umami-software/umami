import { Box } from '@umami/react-zen';
import { WebsiteControls } from '@/app/(main)/websites/[websiteId]/WebsiteControls';
import { useBoard } from '@/components/hooks';

export function BoardControls() {
  const { board } = useBoard();
  const websiteId = board?.parameters?.websiteId;

  if (!websiteId) {
    return null;
  }

  return (
    <Box marginBottom="4">
      <WebsiteControls websiteId={websiteId} />
    </Box>
  );
}
