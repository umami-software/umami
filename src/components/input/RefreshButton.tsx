import { LoadingButton, Icon, Tooltip, TooltipTrigger } from '@umami/react-zen';
import { setWebsiteDateRange } from '@/store/websites';
import { useDateRange } from '@/components/hooks';
import { Icons } from '@/components/icons';
import { useMessages } from '@/components/hooks';

export function RefreshButton({
  websiteId,
  isLoading,
}: {
  websiteId: string;
  isLoading?: boolean;
}) {
  const { formatMessage, labels } = useMessages();
  const { dateRange } = useDateRange(websiteId);

  function handleClick() {
    if (!isLoading && dateRange) {
      setWebsiteDateRange(websiteId, dateRange);
    }
  }

  return (
    <TooltipTrigger>
      <LoadingButton isLoading={isLoading} onPress={handleClick}>
        <Icon>
          <Icons.Refresh />
        </Icon>
      </LoadingButton>
      <Tooltip>{formatMessage(labels.refresh)}</Tooltip>
    </TooltipTrigger>
  );
}
