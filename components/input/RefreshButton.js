import { LoadingButton, Icon, TooltipPopup } from 'react-basics';
import { setWebsiteDateRange } from 'store/websites';
import useDateRange from 'hooks/useDateRange';
import Icons from 'components/icons';
import useMessages from 'hooks/useMessages';

export function RefreshButton({ websiteId, isLoading }) {
  const { formatMessage, labels } = useMessages();
  const [dateRange] = useDateRange(websiteId);

  function handleClick() {
    if (!isLoading && dateRange) {
      setWebsiteDateRange(websiteId, dateRange);
    }
  }

  return (
    <TooltipPopup label={formatMessage(labels.refresh)}>
      <LoadingButton loading={isLoading} onClick={handleClick}>
        <Icon>
          <Icons.Refresh />
        </Icon>
      </LoadingButton>
    </TooltipPopup>
  );
}

export default RefreshButton;
