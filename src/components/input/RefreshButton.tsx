import { LoadingButton, Icon, TooltipPopup } from 'react-basics';
import { setWebsiteDateRange } from 'store/websites';
import { useDateRange } from 'components/hooks';
import Icons from 'components/icons';
import { useMessages } from 'components/hooks';

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
    <TooltipPopup label={formatMessage(labels.refresh)}>
      <LoadingButton isLoading={isLoading} onClick={handleClick}>
        <Icon>
          <Icons.Refresh />
        </Icon>
      </LoadingButton>
    </TooltipPopup>
  );
}

export default RefreshButton;
