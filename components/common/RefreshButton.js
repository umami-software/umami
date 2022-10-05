import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import useStore from 'store/queries';
import { setDateRange } from 'store/websites';
import Button from './Button';
import Refresh from 'assets/redo.svg';
import Dots from 'assets/ellipsis-h.svg';
import useDateRange from 'hooks/useDateRange';

function RefreshButton({ websiteId }) {
  const [dateRange] = useDateRange(websiteId);
  const [loading, setLoading] = useState(false);
  const selector = useCallback(state => state[`/websites/${websiteId}/stats`], [websiteId]);
  const completed = useStore(selector);

  function handleClick() {
    if (!loading && dateRange) {
      setLoading(true);
      if (/^[\d]+/.test(dateRange.value)) {
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
      icon={loading ? <Dots /> : <Refresh />}
      tooltip={<FormattedMessage id="label.refresh" defaultMessage="Refresh" />}
      tooltipId="button-refresh"
      size="small"
      onClick={handleClick}
    />
  );
}

RefreshButton.propTypes = {
  websiteId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default RefreshButton;
