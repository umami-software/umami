import { useState, useEffect, useCallback } from 'react';
import { useIntl } from 'react-intl';
import { Button, Icon, Tooltip } from '../react-basics';
import useStore from 'store/queries';
import { setDateRange } from 'store/websites';
import useDateRange from 'hooks/useDateRange';
import Icons from 'components/icons';
import { labels } from 'components/messages';

function RefreshButton({ websiteId }) {
  const { formatMessage } = useIntl();
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
    <Tooltip label={formatMessage(labels.refresh)}>
      <Button onClick={handleClick}>
        <Icon>
          <Icons.Refresh />
        </Icon>
      </Button>
    </Tooltip>
  );
}

export default RefreshButton;
