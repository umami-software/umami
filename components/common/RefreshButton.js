import { useState, useEffect, useCallback } from 'react';
import { FormattedMessage } from 'react-intl';
import useStore from 'store/queries';
import { setDateRange } from 'store/websites';
import { Button, Icon } from 'react-basics';
import useDateRange from 'hooks/useDateRange';
import Icons from 'components/icons';

function RefreshButton({ websiteId }) {
  const [dateRange] = useDateRange(websiteId);
  const [loading, setLoading] = useState(false);
  const selector = useCallback(state => state[`/websites/${websiteId}/stats`], [websiteId]);
  const completed = useStore(selector);

  function handleClick() {
    if (!loading && dateRange) {
      setLoading(true);
      if (/^\d+/.test(dateRange.value)) {
        setDateRange(websiteId, dateRange.value);
      } else {
        setDateRange(websiteId, dateRange);
      }
    }
  }

  useEffect(() => {
    setLoading(false);
  }, [completed]);

  return (
    <Button
      tooltip={<FormattedMessage id="label.refresh" defaultMessage="Refresh" />}
      tooltipId="button-refresh"
      size="small"
      onClick={handleClick}
    >
      <Icon>
        <Icons.Refresh />
      </Icon>
    </Button>
  );
}

export default RefreshButton;
