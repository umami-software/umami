import { useIntl } from 'react-intl';
import { LoadingButton, Icon, Tooltip } from 'react-basics';
import { setWebsiteDateRange } from 'store/websites';
import useDateRange from 'hooks/useDateRange';
import Icons from 'components/icons';
import { labels } from 'components/messages';

function RefreshButton({ websiteId, isLoading }) {
  const { formatMessage } = useIntl();
  const [dateRange] = useDateRange(websiteId);

  function handleClick() {
    if (!isLoading && dateRange) {
      if (/^\d+/.test(dateRange.value)) {
        setWebsiteDateRange(websiteId, dateRange.value);
      } else {
        setWebsiteDateRange(websiteId, dateRange);
      }
    }
  }

  return (
    <Tooltip label={formatMessage(labels.refresh)}>
      <LoadingButton loading={isLoading} onClick={handleClick}>
        <Icon>
          <Icons.Refresh />
        </Icon>
      </LoadingButton>
    </Tooltip>
  );
}

export default RefreshButton;
