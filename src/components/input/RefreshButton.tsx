import { Icon, LoadingButton, Tooltip, TooltipContent, TooltipTrigger } from '@umami/react-zen';
import { useDateRange, useMessages } from '@/components/hooks';
import { RefreshCw } from '@/components/icons';
import { setWebsiteDateRange } from '@/store/websites';

export function RefreshButton({
  websiteId,
  isLoading,
}: {
  websiteId: string;
  isLoading?: boolean;
}) {
  const { t, labels } = useMessages();
  const { dateRange } = useDateRange();

  function handleClick() {
    if (!isLoading && dateRange) {
      setWebsiteDateRange(websiteId, dateRange);
    }
  }

  return (
    <Tooltip>
      <TooltipTrigger
        render={<LoadingButton variant="secondary" loading={isLoading} onClick={handleClick} />}
      >
        <Icon>
          <RefreshCw />
        </Icon>
      </TooltipTrigger>
      <TooltipContent>{t(labels.refresh)}</TooltipContent>
    </Tooltip>
  );
}
