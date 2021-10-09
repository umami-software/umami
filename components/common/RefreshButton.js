import Dots from 'assets/ellipsis-h.svg';
import Refresh from 'assets/redo.svg';
import useDateRange from 'hooks/useDateRange';
import useLocale from 'hooks/useLocale';
import { DEFAULT_DATE_RANGE } from 'lib/constants';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { setDateRange } from 'redux/actions/websites';
import { getDateRange } from '../../lib/date';
import Button from './Button';

function RefreshButton({ websiteId, createdAt }) {
  const dispatch = useDispatch();
  const { locale } = useLocale();
  const [dateRange] = useDateRange(websiteId, DEFAULT_DATE_RANGE, createdAt);
  const [loading, setLoading] = useState(false);
  const completed = useSelector(state => state.queries[`/api/website/${websiteId}/stats`]);

  function handleClick() {
    if (dateRange) {
      setLoading(true);
      dispatch(setDateRange(websiteId, getDateRange(dateRange.value, locale, createdAt)));
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
