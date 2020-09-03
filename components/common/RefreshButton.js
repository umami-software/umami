import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setDateRange } from 'redux/actions/websites';
import Button from './Button';
import Refresh from 'assets/redo.svg';
import Dots from 'assets/ellipsis-h.svg';
import { useDateRange } from 'hooks/useDateRange';
import { getDateRange } from '../../lib/date';

export default function RefreshButton({ websiteId }) {
  const dispatch = useDispatch();
  const dateRange = useDateRange(websiteId);
  const [loading, setLoading] = useState(false);
  const completed = useSelector(state => state.queries[`/api/website/${websiteId}/metrics`]);

  function handleClick() {
    if (dateRange) {
      setLoading(true);
      dispatch(setDateRange(websiteId, getDateRange(dateRange.value)));
    }
  }

  useEffect(() => {
    setLoading(false);
  }, [completed]);

  return <Button icon={loading ? <Dots /> : <Refresh />} size="small" onClick={handleClick} />;
}
